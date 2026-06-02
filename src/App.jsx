import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileVideo, Download, Play, CheckCircle, LogOut, History, Calendar, Clock, User as UserIcon, Camera, Save, X, Mic } from 'lucide-react';
import Auth from './Auth';
import SubtitleViewer from './SubtitleViewer';
import Landing from './Landing';

const LANGUAGES = ['Hindi', 'Marathi', 'Bengali', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Urdu', 'Odia'];

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dmyng3pwc";
const CLOUDINARY_UPLOAD_PRESET = "voiceflux_upload";

function App() {
  const [file, setFile] = useState(null);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [statusMap, setStatusMap] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('dubbing');
  const [historyData, setHistoryData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [videoTime, setVideoTime] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [initialIsLogin, setInitialIsLogin] = useState(true);
  const [includeSubtitles, setIncludeSubtitles] = useState(true);
  const [voicePreference, setVoicePreference] = useState('female');
  const fileInputRef = useRef(null);
  const dpInputRef = useRef(null);
  
  // Set global axios auth header if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Add interceptor to handle 401 Unauthorized
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [isAuthenticated]);

  // Fetch user profile on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const AUTH_API = import.meta.env.VITE_AUTH_API_URL || '';
  const DUBBING_API = import.meta.env.VITE_DUBBING_API_URL || '';

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${AUTH_API}/user/profile`);
      setUserProfile(res.data);
      setNewUsername(res.data.username);
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserProfile(null);
    setShowDropdown(false);
    setActiveTab('dubbing');
    setShowAuth(false);
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.post(`${AUTH_API}/user/update`, { username: newUsername });
      setUserProfile({ ...userProfile, username: newUsername });
      setIsEditingProfile(false);
    } catch (e) {
      alert("Error updating profile");
    }
  };

  const handleDpUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      try {
        const res = await axios.post(`${AUTH_API}/user/upload-dp`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUserProfile({ ...userProfile, profile_picture: res.data.profile_picture });
      } catch (e) {
        alert("Error uploading profile picture");
      }
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleLanguage = (lang) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter(l => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const startProcessing = async () => {
    if (!file || selectedLangs.length === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setJobId(null);
    setStatusMap(null);

    try {
      // 1. Upload Direct to Cloudinary
      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      cloudFormData.append('resource_type', 'video');

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        cloudFormData,
        {
          headers: { 'Authorization': undefined }, // Remove global auth header for this request
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      const videoUrl = cloudRes.data.secure_url;

      // 2. Send Cloudinary URL to Backend
      const backendRes = await axios.post(`${DUBBING_API}/upload/cloud`, {
        video_url: videoUrl,
        target_langs: selectedLangs.join(','),
        filename: file.name,
        include_subtitles: includeSubtitles,
        voice_preference: voicePreference
      });

      setJobId(backendRes.data.job_id);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error';
      alert(`Error during upload or processing: ${errorMsg}. Please check your Cloudinary settings or try again.`);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    let interval;
    if (jobId && isProcessing) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${DUBBING_API}/status/${jobId}`);
          setStatusMap(res.data);
          
          if (res.data.status.includes('Completed') || res.data.status.includes('Failed')) {
            setIsProcessing(false);
            clearInterval(interval);
            
            if (res.data.status.includes('Completed') && res.data.completed) {
              const token = localStorage.getItem('token');
              Object.keys(res.data.completed).forEach(async (lang) => {
                try {
                  await axios.post(`${AUTH_API}/history`, {
                    video_filename: file ? file.name : "dubbed_video.mp4",
                    selected_language: lang,
                    output_file_path: res.data.completed[lang],
                    include_subtitles: includeSubtitles ? 1 : 0,
                    voice_preference: voicePreference
                  }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                } catch (err) {
                  console.error('Failed to save history for', lang, err);
                }
              });
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId, isProcessing]);

  useEffect(() => {
    if (activeTab === 'history' && isAuthenticated) {
      fetchHistory();
    }
  }, [activeTab, isAuthenticated]);

  const fetchHistory = async () => {
    console.log("Fetching history...");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${AUTH_API}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("History response received:", res.data);
      setHistoryData(res.data);
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  };

  if (!isAuthenticated) {
    if (!showAuth) {
      return (
        <Landing 
          onGetStarted={() => { setInitialIsLogin(false); setShowAuth(true); }} 
          onLogin={() => { setInitialIsLogin(true); setShowAuth(true); }} 
        />
      );
    }
    return (
      <Auth 
        onLoginSuccess={() => { setIsAuthenticated(true); setShowAuth(false); }} 
        onBackToHome={() => setShowAuth(false)}
        initialIsLogin={initialIsLogin}
      />
    );
  }

  return (
    <div className="container fade-in">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-bottom-right"></div>
      
      <div className="user-menu-container">
        <div 
          className="user-profile-icon"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {userProfile?.profile_picture ? (
            <img src={userProfile.profile_picture} alt="Profile" />
          ) : (
            <UserIcon size={24} color="var(--accent-color)" />
          )}
        </div>
        
        {showDropdown && (
          <div className="dropdown-menu glass-panel">
            <button 
              className="dropdown-item"
              onClick={() => {
                setActiveTab('profile');
                setShowDropdown(false);
              }}
            >
              <UserIcon size={18} /> My Profile
            </button>
            <button 
              className="dropdown-item"
              onClick={() => {
                setActiveTab('history');
                setShowDropdown(false);
              }}
            >
              <History size={18} /> My History
            </button>
            <div className="dropdown-divider"></div>
            <button 
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>

      <header className="header" style={{ position: 'relative' }}>
        <h1>VoiceFlux</h1>
        <p>AI-Powered Multilingual Video Dubbing for India</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className={`nav-btn ${activeTab === 'dubbing' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dubbing');
              setJobId(null);
              setFile(null);
              setSelectedLangs([]);
              setStatusMap(null);
            }}
          >
            <Play size={18} /> Dubbing
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              setJobId(null);
            }}
          >
            <History size={18} /> My History
          </button>
        </div>
      </header>

      {activeTab === 'dubbing' && !jobId && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div 
            className="upload-zone" 
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="video/*"
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <FileVideo className="upload-icon" />
                <h3 style={{ marginBottom: '0.5rem' }}>{file.name}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Click to change video</p>
              </>
            ) : (
              <>
                <UploadCloud className="upload-icon" />
                <h3 style={{ marginBottom: '0.5rem' }}>Upload Video</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Drag and drop or click to browse</p>
              </>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h3>Select Target Languages</h3>
            <div className="language-grid">
              {LANGUAGES.map(lang => (
                <div 
                  key={lang}
                  className={`lang-chip ${selectedLangs.includes(lang) ? 'selected' : ''}`}
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>

          {/* Include Subtitles Toggle Switch */}
          <div className="subtitle-toggle-container glass-panel">
            <span className="toggle-label">Include Subtitles in Final Video</span>
            <button 
              type="button"
              className={`toggle-switch ${includeSubtitles ? 'active' : ''}`}
              onClick={() => setIncludeSubtitles(!includeSubtitles)}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          {/* Voice Preference Selector */}
          <div className="voice-preference-container glass-panel">
            <div className="voice-preference-header">
              <Mic size={18} className="voice-pref-icon" />
              <span className="voice-pref-label">Voice Preference</span>
            </div>
            <div className="voice-preference-cards">
              <div
                id="voice-pref-female"
                className={`voice-card ${voicePreference === 'female' ? 'selected' : ''}`}
                onClick={() => setVoicePreference('female')}
                role="radio"
                aria-checked={voicePreference === 'female'}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setVoicePreference('female')}
              >
                <div className="voice-card-icon female">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                    <line x1="12" y1="14" x2="12" y2="17"/>
                    <line x1="9" y1="17" x2="15" y2="17"/>
                  </svg>
                </div>
                <div className="voice-card-text">
                  <span className="voice-card-title">Female Voice</span>
                  <span className="voice-card-sub">Neural · Default</span>
                </div>
                {voicePreference === 'female' && <span className="voice-card-check">✓</span>}
              </div>

              <div
                id="voice-pref-male"
                className={`voice-card ${voicePreference === 'male' ? 'selected' : ''}`}
                onClick={() => setVoicePreference('male')}
                role="radio"
                aria-checked={voicePreference === 'male'}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setVoicePreference('male')}
              >
                <div className="voice-card-icon male">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                  </svg>
                </div>
                <div className="voice-card-text">
                  <span className="voice-card-title">Male Voice</span>
                  <span className="voice-card-sub">Neural · Deep</span>
                </div>
                {voicePreference === 'male' && <span className="voice-card-check">✓</span>}
              </div>
            </div>
          </div>

          <button 
            className="btn-primary fade-in"
            disabled={!file || selectedLangs.length === 0}
            onClick={startProcessing}
          >
            Start Dubbing
          </button>
        </div>
      )}

      {activeTab === 'dubbing' && jobId && (
        <>
          {isProcessing && (
            <div className="glass-panel status-card fade-in">
              {uploadProgress < 100 ? (
                <div style={{ padding: '1rem' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Uploading Video...</h2>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontWeight: 500 }}>
                    {uploadProgress}% Uploaded
                  </p>
                </div>
              ) : (
                <>
                  <div className="spinner"></div>
                  <h2>Processing Video</h2>
                  <p style={{ color: 'var(--accent-color)', fontSize: '1.25rem', marginTop: '1rem', fontWeight: 600 }}>
                    {statusMap ? statusMap.status : 'Preparing Pipeline...'}
                  </p>
                  <div style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
                    This might take a while depending on the video length.
                  </div>
                </>
              )}
            </div>
          )}

          {statusMap && statusMap.status.includes('Completed') && (
            <div className="fade-in">
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <CheckCircle style={{ color: 'var(--success-color)', width: 64, height: 64, margin: '0 auto 1rem' }} />
                <h2>Dubbing Complete!</h2>
              </div>
              
              <div className="results-grid">
                {Object.keys(statusMap.completed).map(lang => (
                  <div key={lang} className="glass-panel video-card fade-in">
                    <video 
                      controls 
                      src={`${DUBBING_API}/download/${jobId}/${lang}`} 
                      crossOrigin="anonymous"
                      poster=""
                      onTimeUpdate={(e) => setVideoTime(e.target.currentTime)}
                    >
                      {statusMap.include_subtitles !== false && (
                        <track 
                          label={`${lang} Dub`} 
                          kind="subtitles" 
                          srcLang={lang.substring(0,2).toLowerCase()} 
                          src={`${DUBBING_API}/subtitle/${jobId}/${lang}`} 
                          default 
                        />
                      )}
                    </video>
                    {statusMap.include_subtitles !== false && (
                      <SubtitleViewer jobId={jobId} lang={lang} currentTime={videoTime} />
                    )}
                    <div className="video-info">
                      <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{lang} Dub</span>
                      <a 
                        href={`${DUBBING_API}/download/${jobId}/${lang}`}
                        download={`dubbed_${lang}.mp4`}
                        className="btn-download"
                      >
                        <Download size={18} /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className="btn-primary" 
                style={{ marginTop: '3rem' }}
                onClick={() => {
                  setJobId(null);
                  setFile(null);
                  setSelectedLangs([]);
                  setStatusMap(null);
                }}
              >
                Dub Another Video
              </button>
            </div>
          )}
          
          {statusMap && statusMap.status.includes('Failed') && (
            <div className="glass-panel status-card fade-in" style={{ borderColor: 'red' }}>
              <h2 style={{ color: 'red' }}>Error</h2>
              <p>{statusMap.status}</p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '2rem' }}
                onClick={() => {
                  setJobId(null);
                  setFile(null);
                  setSelectedLangs([]);
                  setStatusMap(null);
                  setIsProcessing(false);
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="fade-in">
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <History size={24} color="var(--accent-color)" /> My Dubbing History
                </h2>
                <button className="btn-link" onClick={fetchHistory} style={{ fontSize: '0.9rem' }}>
                    Refresh
                </button>
            </div>
            
            {(!historyData || historyData.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '1.125rem' }}>No history available yet.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Your dubbed videos will appear here automatically.</p>
                    <button 
                      className="btn-primary" 
                      onClick={() => setActiveTab('dubbing')}
                      style={{ marginTop: '1.5rem' }}
                    >
                        Start Your First Dub!
                    </button>
                </div>
            ) : (
                <div className="history-list">
                    {Array.isArray(historyData) && historyData.map(item => (
                        <div key={item.id} className="history-item fade-in">
                            <div className="history-info">
                                <h3 style={{ fontSize: '1.25rem' }}>{item.filename}</h3>
                                <div className="history-date">
                                    <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{item.language}</span>
                                    <span style={{ color: 'var(--glass-border)', fontSize: '1.2rem' }}>|</span>
                                    <span style={{ 
                                      color: item.include_subtitles ? '#10b981' : '#94a3b8', 
                                      fontWeight: 600,
                                      background: item.include_subtitles ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      border: item.include_subtitles ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    }}>
                                        Subtitles: {item.include_subtitles ? 'On' : 'Off'}
                                    </span>
                                    <span style={{ color: 'var(--glass-border)', fontSize: '1.2rem' }}>|</span>
                                    <span style={{
                                      color: item.voice_preference === 'male' ? '#818cf8' : '#ec4899',
                                      fontWeight: 600,
                                      background: item.voice_preference === 'male' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      border: item.voice_preference === 'male' ? '1px solid rgba(129, 140, 248, 0.2)' : '1px solid rgba(236, 72, 153, 0.2)',
                                    }}>
                                      Voice: {item.voice_preference === 'male' ? '♂ Male' : '♀ Female'}
                                    </span>
                                    <span style={{ color: 'var(--glass-border)', fontSize: '1.2rem' }}>|</span>
                                    <Calendar size={14} /> {new Date(item.timestamp).toLocaleDateString()}
                                    <Clock size={14} style={{ marginLeft: '0.5rem' }} /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <a 
                              href={item.download_url} 
                              download 
                              className="btn-download"
                              style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }}
                            >
                                <Download size={18} /> Download Dub
                            </a>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="fade-in">
          <div className="glass-panel profile-view">
            <h2 style={{ marginBottom: '2rem' }}>User Profile</h2>
            
            <div className="profile-pic-container">
              {userProfile?.profile_picture ? (
                <img src={userProfile.profile_picture} className="profile-pic-large" alt="Profile" />
              ) : (
                <div className="profile-pic-large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                  <UserIcon size={48} color="var(--accent-color)" />
                </div>
              )}
              <div className="edit-pic-btn" onClick={() => dpInputRef.current?.click()}>
                <Camera size={18} />
              </div>
              <input 
                type="file" 
                ref={dpInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleDpUpload}
              />
            </div>

            <div className="profile-info">
              <label>Email Address</label>
              <p>{userProfile?.email}</p>
              
              <div className="profile-input-group">
                <label>Username</label>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)} 
                    autoFocus
                  />
                ) : (
                  <p>{userProfile?.username}</p>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {isEditingProfile ? (
                <>
                  <button className="nav-btn active" onClick={handleUpdateProfile}>
                    <Save size={18} /> Save Changes
                  </button>
                  <button className="nav-btn" onClick={() => setIsEditingProfile(false)}>
                    <X size={18} /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn-primary" style={{ margin: 0 }} onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
