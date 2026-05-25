import { useState, useEffect } from 'react';
import axios from 'axios';

const SubtitleViewer = ({ jobId, lang, currentTime }) => {
  const [subtitles, setSubtitles] = useState([]);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (jobId && lang) {
      fetchSubtitles();
    }
  }, [jobId, lang]);

  const fetchSubtitles = async () => {
    try {
      const res = await axios.get(`/subtitle/${jobId}/${lang}`);
      const parsed = parseVTT(res.data);
      setSubtitles(parsed);
    } catch (e) {
      console.warn("Subtitles not found for this language");
      setSubtitles([]);
    }
  };

  const parseVTT = (data) => {
    const lines = data.split('\n');
    const subs = [];
    let currentSub = null;

    const timeRegex = /(\d{2}:\d{2}:\d{2}.\d{3}) --> (\d{2}:\d{2}:\d{2}.\d{3})/;

    lines.forEach((line) => {
      const timeMatch = line.match(timeRegex);
      if (timeMatch) {
        currentSub = {
          start: timeToSeconds(timeMatch[1]),
          end: timeToSeconds(timeMatch[2]),
          text: ''
        };
      } else if (currentSub && line.trim() !== '' && !line.includes('WEBVTT') && isNaN(line.trim())) {
        currentSub.text += (currentSub.text ? '\n' : '') + line.trim();
      } else if (line.trim() === '' && currentSub) {
        subs.push(currentSub);
        currentSub = null;
      }
    });

    if (currentSub) subs.push(currentSub);
    return subs;
  };

  const timeToSeconds = (timeStr) => {
    const [hms, ms] = timeStr.split('.');
    const [h, m, s] = hms.split(':').map(Number);
    return h * 3600 + m * 60 + s + Number(ms) / 1000;
  };

  useEffect(() => {
    const activeSub = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
    setCurrentText(activeSub ? activeSub.text : '');
  }, [currentTime, subtitles]);

  if (!currentText) return <div className="subtitle-placeholder"></div>;

  return (
    <div className="subtitle-viewer">
      <div className="subtitle-box">
        {currentText.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default SubtitleViewer;
