import { useEffect, useRef, useState } from "react";
import "../styles/Main.css"

const sentences = [
  "The only way to do great work is to love what you do If you haven't found it yet keep looking Don't settle As with all matters of the heart you'll know when you find it",
  "In the world of Pokemon every trainer starts with a single companion and a dream to become a champion It takes patience strategy and a bit of luck to master the art of battle",
  "Coding is like solving a complex puzzle where every piece of logic must fit perfectly A single missing semicolon can bring down an entire system teaching us the value of precision",
  "Success is not final failure is not fatal it is the courage to continue that counts Whether you are typing a sentence or building a future persistence is the key to excellence",
  "Move fast and break things Unless you are breaking things you are not moving fast enough Innovation requires taking risks and learning from the mistakes that happen along the way"
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
  const inputRef = useRef(null);

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
      if (!showResults) {
        if (inputRef.current) {
          inputRef.current.focus();
        } else if (mainRef.current) {
          mainRef.current.focus();
        }
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

  // Handle Tab + Enter for restart
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Check for Tab + Enter
      if (e.key === 'Enter' && e.shiftKey === false && e.ctrlKey === false) {
        // If we want Tab + Enter combo exactly, we'd need to track Tab state
        // But many users prefer just Tab or a common combo.
        // User asked for "tab with enter"
      }
    };
    
    // More robust way to handle "Tab then Enter" or "Tab + Enter"
    let tabDown = false;
    const keyDown = (e) => {
      if (e.key === 'Tab') {
        tabDown = true;
        e.preventDefault(); // Stop focus jumping
      }
      if (e.key === 'Enter' && tabDown) {
        handleRestart();
        tabDown = false;
      }
    };
    const keyUp = (e) => {
      if (e.key === 'Tab') tabDown = false;
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [targetText]); // Dependency on targetText or empty if handleRestart is stable

  function timeSettings(settings) {
    setTimerSettings(settings * 1000);
    handleRestart();
  }

  function generateText() {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    return sentences[randomIndex];
  }

  function loadText() {
    const text = generateText();
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

  function handleInput(e) {
    if (showResults) return;
    const value = e.target.value;

    // Start timer on first char if not started
    if (!startTimeRef.current && value.length > 0) {
      startTimer();
    }

    // Capture the latest char if it's an addition
    if (value.length <= targetText.length) {
      setTyped(value);
    }
  }

  function handleRestart() {
    stopTimer();
    loadText();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const remainingTime = Math.max(0, (timerSettings / 1000) - Math.round(time));

  return (
    <>
      <main
        ref={mainRef}
        tabIndex={0}
        style={{ outline: "none" }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden Input for Mobile Keyboard */}
        <input
          ref={inputRef}
          type="text"
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            height: 0,
            width: 0,
          }}
          value={typed}
          onChange={handleInput}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
        />
        {/* Timer Display at Top */}
        <div className="timer-display">
          {startTimeRef.current
            ? remainingTime
            : Math.round(timerSettings / 1000)}
        </div>

        <div className="time-settings">
          <span>Time(s):</span>
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
          <div className="typing-wrapper">
            <div
              className="typing-content"
              ref={(el) => {
                if (el && typed.length > 0) {
                  const currentSpan = el.querySelector(".current");
                  const cursor = el.querySelector(".mario-cursor");
                  if (currentSpan) {
                    // Responsive Scrolling Logic
                    const styles = window.getComputedStyle(el);
                    const lineHeight = parseFloat(styles.lineHeight);
                    const wrapper = el.parentElement;
                    const wrapperPadding = parseFloat(
                      window.getComputedStyle(wrapper).paddingTop
                    );

                    const lineOffset = currentSpan.offsetTop - wrapperPadding;
                    if (lineOffset >= lineHeight) {
                      el.style.transform = `translateY(-${
                        lineOffset - lineHeight
                      }px)`;
                    } else {
                      el.style.transform = `translateY(0)`;
                    }

                    // Cursor Positioning Logic
                    if (cursor) {
                      cursor.style.left = `${currentSpan.offsetLeft}px`;
                      cursor.style.top = `${currentSpan.offsetTop}px`;
                    }
                  }
                } else if (el) {
                  el.style.transform = `translateY(0)`;
                  const cursor = el.querySelector(".mario-cursor");
                  const firstSpan = el.querySelector("span");
                  if (cursor && firstSpan) {
                    cursor.style.left = `${firstSpan.offsetLeft}px`;
                    cursor.style.top = `${firstSpan.offsetTop}px`;
                  }
                }
              }}
            >
              {/* The Floating Cursor */}
              <div className="mario-cursor"></div>

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
          </div>
        </div>

        <div id="restart-button">
          <button onClick={handleRestart}>restart</button>
        </div>
      </main>

      {/* Results Modal - Moved Outside Main to avoid transform issues */}
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
              <button
                className="results-button primary"
                onClick={handleRestart}
              >
                Next Battle!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
