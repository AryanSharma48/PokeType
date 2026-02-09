import { useEffect, useRef, useState } from "react";
import "../styles/main.css"

const dictionary = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

export default function Main() {
  const [targetText, setTargetText] = useState("");
  const [typed, setTyped] = useState("");
  const [time, setTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [timerSettings, setTimerSettings] = useState(10000);

  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const mainRef = useRef(null);
  const startTimeRef = useRef(null);
  const wpmHistoryRef = useRef([]);

  const typedRef = useRef("");

  useEffect(() => {
    loadText();
  }, []);

  // Update typedRef whenever typed changes
  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);

  // Focus on click anywhere in main
  useEffect(() => {
    const handleClick = () => {
      if (mainRef.current && !showResults) {
        mainRef.current.focus();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showResults]);

  // Check if test is complete
  useEffect(() => {
    if (typed.length > 0 && typed.length === targetText.length) {
      stopTimer(true);
    }
  }, [typed, targetText]);

  function timeSettings(settings) {
    setTimerSettings(settings * 1000);
    handleRestart();
  }

  function generateText(wordCount = 100) {
    let result = [];
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * dictionary.length);
        result.push(dictionary[randomIndex]);
    }
    return result.join(" ");
  }

  function loadText() {
    const text = generateText(100);
    setTargetText(text.toLowerCase());
    setTyped("");
    typedRef.current = "";
    setTime(0);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    startTimeRef.current = null;
    setShowResults(false);
    setFinalStats(null);
    setWpmHistory([]);
    wpmHistoryRef.current = [];
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function startTimer() {
    if (timerRef.current) return;

    const now = Date.now();
    startTimeRef.current = now;

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - now) / 1000;
      setTime(elapsed);
    }, 100);

    timeoutRef.current = setTimeout(() => {
      stopTimer(true);
    }, timerSettings);
  }

  function stopTimer(showResultsPage = false) {
    // Clear intervals and timeouts
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (showResultsPage && startTimeRef.current) {
      // Use the ref value to avoid stale closure
      const currentTyped = typedRef.current;
      const finalTime = Math.min((Date.now() - startTimeRef.current) / 1000, timerSettings / 1000);
      const elapsedMinutes = finalTime / 60 || 0.001;
      
      const spans = targetText.split("");
      let correctChars = 0;
      
      for (let i = 0; i < currentTyped.length; i++) {
        if (currentTyped[i] === spans[i]) {
          correctChars++;
        }
      }
      
      const totalCharsTyped = currentTyped.length;
      const finalRawWpm = totalCharsTyped > 0 
        ? Math.max(0, Math.round((totalCharsTyped / 5) / elapsedMinutes))
        : 0;
      const finalWpm = totalCharsTyped > 0
        ? Math.max(0, Math.round((correctChars / 5) / elapsedMinutes))
        : 0;
      const finalAccuracy = totalCharsTyped > 0
        ? Math.round((correctChars / totalCharsTyped) * 100)
        : 100;

      setFinalStats({
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAccuracy,
        time: Math.round(finalTime),
        totalChars: totalCharsTyped,
      });
      setShowResults(true);
    }
  }

  // Update real-time stats
  useEffect(() => {
    if (!startTimeRef.current) return;
    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000 || 1;
    const elapsedMinutes = elapsedSeconds / 60 || 0.001;

    const spans = targetText.split("");
    let correctChars = 0;

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === spans[i]) {
        correctChars++;
      }
    }

    const totalCharsTyped = typed.length;
    if (totalCharsTyped > 0) {
      const rawWpmCalc = Math.max(0, Math.round((totalCharsTyped / 5) / elapsedMinutes));
      const wpmCalc = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
      const accuracyCalc = Math.round((correctChars / totalCharsTyped) * 100);
      setWpm(wpmCalc);
      setAccuracy(accuracyCalc);
      setRawWpm(rawWpmCalc);
    }
  }, [typed, time]);

  function handleKeyDown(e) {
    if (showResults) return;

    // Start timer on first keypress
    if (!startTimeRef.current && e.key.length === 1) {
      startTimer();
    }

    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      setTyped((prev) => prev.slice(0, -1));
      return;
    }

    // Handle character input
    if (e.key.length === 1) {
      e.preventDefault();
      if (typed.length < targetText.length) {
        setTyped((prev) => prev + e.key);
      }
    }
  }

  function handleRestart() {
    stopTimer();
    loadText();
  }

  const remainingTime = Math.max(0, (timerSettings / 1000) - Math.round(time));

  return (
    <main
      ref={mainRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      {/* Timer Display at Top */}
      <div className="timer-display">
        {startTimeRef.current ? remainingTime : Math.round(timerSettings / 1000)}
      </div>

      <div className="time-settings">
        <span>time:</span>
        <button
          onClick={() => timeSettings(10)}
          className={timerSettings === 10000 ? "active" : ""}
        >
          10
        </button>
        <button
          onClick={() => timeSettings(30)}
          className={timerSettings === 30000 ? "active" : ""}
        >
          30
        </button>
        <button
          onClick={() => timeSettings(60)}
          className={timerSettings === 60000 ? "active" : ""}
        >
          60
        </button>
      </div>

      <div id="typing-sentence">
        {targetText.split("").map((char, i) => {
          const typedChar = typed[i];
          let className = "";
          if (typedChar == null) {
            className = i === typed.length ? "current" : "";
          } else if (typedChar === char) {
            className = "correct";
          } else {
            className = "incorrect";
          }
          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      <div id="restart-button">
        <button onClick={handleRestart}>restart</button>
      </div>

      {/* Mario Ground */}
      <div className="ground"></div>

      {/* Results Modal */}
      {showResults && finalStats && (
        <div className="results-page">
          <div className="results-container">
            <div className="results-header">
              <h1>Victory!</h1>
            </div>

            {/* Main Stats */}
            <div className="results-main-stats">
              <div className="main-stat">
                <div className="main-stat-label">wpm</div>
                <div className="main-stat-value">{finalStats.wpm}</div>
              </div>
              <div className="main-stat">
                <div className="main-stat-label">accuracy</div>
                <div className="main-stat-value">{finalStats.accuracy}%</div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="results-detailed-stats">
              <div className="detail-stat">
                <span className="detail-label">raw wpm</span>
                <span className="detail-value">{finalStats.rawWpm}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-label">characters</span>
                <span className="detail-value">{finalStats.totalChars}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-label">time</span>
                <span className="detail-value">{finalStats.time}s</span>
              </div>
            </div>

            {/* Actions */}
            <div className="results-actions">
              <button className="results-button primary" onClick={handleRestart}>
                Next Battle!
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
