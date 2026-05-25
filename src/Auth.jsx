import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, ShieldCheck, Send, ArrowLeft } from 'lucide-react';

export default function Auth({ onLoginSuccess, onBackToHome, initialIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !isOtpVerified) {
      setError("Please verify your email with OTP first.");
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const response = await axios.post(endpoint, { email, password });
      
      if (isLogin) {
        localStorage.setItem('token', response.data.access_token);
        onLoginSuccess();
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
        resetRegistration();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'An error occurred. Please try again.';
      setError(msg);
      console.error("Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetRegistration = () => {
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtp('');
    setPassword('');
  };

  const handleSendOtp = async () => {
    if (!email.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed");
      return;
    }

    setError('');
    setOtpLoading(true);
    try {
      await axios.post('/send-otp', { email });
      setIsOtpSent(true);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send OTP';
      setError(msg);
      console.error("OTP Send Error:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 5) {
      setError("OTP must be 5 digits");
      return;
    }

    setError('');
    setOtpLoading(true);
    try {
      await axios.post('/verify-otp', { email, otp });
      setIsOtpVerified(true);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid OTP';
      setError(msg);
      console.error("OTP Verify Error:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-bottom-right"></div>

      <div className="glass-panel auth-card">
        {onBackToHome && (
          <button className="btn-back-home" onClick={onBackToHome} type="button">
            <ArrowLeft size={16} /> Back to Home
          </button>
        )}
        <div className="auth-header">
          <h1>VoiceFlux</h1>
          <p>{isLogin ? 'Welcome back! Please login' : 'Create an account to get started'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field - Always Visible */}
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!isLogin && isOtpSent) resetRegistration();
              }}
              disabled={!isLogin && (isOtpSent || isOtpVerified)}
              required
            />
          </div>

          {/* Registration Sequential Flow */}
          {!isLogin && (
            <div className="otp-step-container">
              {!isOtpVerified ? (
                <div className="otp-section">
                  {!isOtpSent ? (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={handleSendOtp}
                      disabled={otpLoading || !email.endsWith("@gmail.com")}
                    >
                      {otpLoading ? <div className="spinner-small"></div> : <><Send size={18} /> Send OTP</>}
                    </button>
                  ) : (
                    <div className="otp-verification-group">
                      <div className="input-group">
                        <ShieldCheck className="input-icon" size={20} />
                        <input
                          type="text"
                          placeholder="5-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          required
                        />
                      </div>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={handleVerifyOtp}
                        disabled={otpLoading || otp.length !== 5}
                      >
                        {otpLoading ? <div className="spinner-small"></div> : 'Verify OTP'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="success-message" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <ShieldCheck size={16} />
                  <span>Email verified successfully</span>
                </div>
              )}
            </div>
          )}

          {/* Password Field - Visible during Login OR after OTP Verified during Register */}
          {(isLogin || (!isLogin && isOtpVerified)) && (
            <div className="input-group fade-in">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                placeholder="Set Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || (!isLogin && !isOtpVerified)}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : isLogin ? (
              <><LogIn size={20} /> Login</>
            ) : (
              <><UserPlus size={20} /> Register</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              className="btn-link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                resetRegistration();
              }}
            >
              {isLogin ? 'Register now' : 'Login instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
