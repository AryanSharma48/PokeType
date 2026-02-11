import { useEffect, useRef, useState } from "react";
import "../styles/Main.css"

const sentences = [
  "Every meaningful skill is built in silence long before it is ever recognized in public. Most people underestimate how powerful small daily actions can be, because they are obsessed with visible results instead of invisible growth. The truth is that discipline is not about forcing yourself to work all the time, but about deciding once and removing the need to decide again. When you wake up and already know what must be done, mental resistance slowly loses its grip. Progress feels slow because you live inside it, but looking back reveals how far consistent effort can carry you. Distractions are endless, but attention is limited, which makes focus one of the most valuable skills of the modern world. Learning to sit with discomfort instead of escaping it builds a kind of confidence that cannot be shaken easily. Motivation fades, moods change, and energy fluctuates, but systems continue to work even when feelings do not cooperate. People often wait for the perfect time to start, not realizing that starting is what creates clarity. Failure is not a verdict on your ability, it is feedback that helps refine direction. Each attempt sharpens judgment, even when it feels like wasted effort. Patience is developed when expectations are realistic and grounded in effort rather than fantasy. The gap between where you are and where you want to be is crossed step by step, not leap by leap. Comparison distorts reality because it ignores context, struggle, and timing. True confidence grows from knowing you can rely on yourself even on difficult days. Mastery comes from repetition, and repetition requires endurance more than talent. The most reliable advantage is not intelligence or luck, but persistence applied over long periods of time. When progress feels invisible, it is usually because foundations are being laid. The work that feels boring today becomes the skill that feels effortless tomorrow. Instead of chasing intensity, learn to value consistency. The ability to show up again and again is what separates those who dream from those who build. Over time, effort compounds quietly, turning ordinary days into extraordinary outcomes",
  "Learning is not a straight line, and anyone who claims otherwise has forgotten what it felt like to struggle at the beginning. Confusion is not a weakness, but a sign that the brain is stretching beyond familiar territory. Growth happens when you stay present long enough to understand what you do not yet know. The urge to quit often appears right before a breakthrough, disguised as boredom or frustration. Mastery is not achieved by avoiding mistakes, but by making them faster and learning from them honestly. Every problem solved rewires the mind slightly, making future challenges easier to approach. The goal is not to collect information, but to develop judgment through experience. Knowledge without application fades quickly, while applied learning sticks deeply. Progress becomes sustainable when curiosity replaces pressure. When you stop proving and start improving, learning becomes lighter and more enjoyable. Fear of being bad at something prevents many people from ever becoming good at it. Beginners often underestimate how normal it is to feel lost. Skill is built by returning to the basics repeatedly, each time with deeper understanding. Time spent practicing is never wasted, even when results are delayed. Confidence grows when you trust the process rather than chasing validation. Learning teaches patience by forcing you to accept temporary incompetence. Instead of rushing to the finish line, focus on building strong fundamentals. Complexity becomes manageable when broken into simple parts. The brain adapts through repetition, not inspiration. Small improvements accumulate into noticeable change over time. When frustration appears, it often means progress is happening just beneath the surface. Those who continue despite uncertainty eventually develop clarity. Learning rewards persistence more than brilliance. The person willing to stay longer eventually understands more. Growth is not dramatic, but it is reliable when effort is consistent. In the long run, the learner always outpaces the quitter.",
  "Purpose is not something you find suddenly, but something you build through action. Waiting for clarity before starting often leads to permanent hesitation. Direction emerges when effort is applied repeatedly in one general path. Most people do not fail because they choose the wrong goal, but because they stop too early. Consistency creates identity, and identity reinforces behavior. When you act like the person you want to become, transformation becomes inevitable. Discipline shapes days, and days shape years. The quality of your focus determines the quality of your output. Meaning is created when effort is aligned with values rather than approval. External validation is unstable, but internal standards endure. The ability to work without immediate reward builds strength that lasts. Success is quieter than imagined, often felt before it is seen. Momentum grows when action becomes habitual rather than emotional. The strongest habits are built during ordinary days, not extraordinary ones. Direction becomes clearer when you commit instead of constantly reconsidering. Progress requires choosing long term fulfillment over short term comfort. Most limitations exist only because they have not been tested yet. Courage grows through exposure, not contemplation. Confidence is earned through repetition, not affirmation. Every small decision compounds into a larger trajectory. When effort is honest, results eventually follow. Purpose deepens as skill increases. The journey becomes meaningful when growth is prioritized over speed. Even slow progress moves you forward. What matters most is not how fast you move, but that you keep moving at all."
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
      }
    };
    

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
