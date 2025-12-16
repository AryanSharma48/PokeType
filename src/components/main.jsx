import { useEffect, useRef, useState } from "react";
import "../styles/main.css"

export default function Main() {
  const list = [
    "The quick brown fox jumps over the lazy dog",
    "Life is a journey filled with unexpected bugs and beautiful fixes",
    "Precision matters more than speed when accuracy defines success",
    "Every developer once started with a single line of code and a dream",
    "Silence can sometimes speak louder than the noisiest words",
    "Creativity thrives best when curiosity is left untamed",
    "In the rhythm of typing, every mistake becomes a beat of learning",
    "The night was calm, the stars whispered secrets to the open sky",
    "Focus on progress, not perfection, and speed will naturally follow",
    "Sometimes the smallest steps lead to the biggest breakthroughs",
  ];

  const [targetText, setTargetText] = useState("");
  const [typed, setTyped] = useState("");
  const [time, setTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  // load a random sentence when component mounts or when restarting
  useEffect(() => {
    loadText();
  }, []);

  function loadText() {
    const random = list[Math.floor(Math.random() * list.length)];
    setTargetText(random.toLowerCase());
    setTyped("");
    setTime(0);
    setWpm(0);
    setAccuracy(0);
    setStartTime(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // focus textarea when text loads
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }

  function startTimer() {
    const now = Date.now();
    setStartTime(now);
    timerRef.current = setInterval(() => {
      setTime(((Date.now() - now) / 1000).toFixed(1));
    }, 100);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // update stats whenever typed text or time changes
  useEffect(() => {
    if (!startTime) return;
    const elapsedSeconds = (Date.now() - startTime) / 1000 || 1;
    const elapsedMinutes = elapsedSeconds / 60;

    const spans = targetText.split("");
    let correctChars = 0;

    for (let i = 0; i < spans.length; i++) {
      const char = typed[i];
      const targetChar = spans[i];
      if (char === targetChar) {
        correctChars++;
      }
    }

    const totalCharsTyped = typed.length;
    if (totalCharsTyped > 0) {
      const wpmCalc = Math.round((totalCharsTyped / 5) / elapsedMinutes);
      const accuracyCalc = Math.round((correctChars / totalCharsTyped) * 100);
      setWpm(wpmCalc);
      setAccuracy(accuracyCalc);
    }
  }, [typed, startTime, targetText]);

  function handleChange(e) {
    const value = e.target.value;

    if (!startTime) {
      startTimer();
    }

    setTyped(value);

    if (value.length >= targetText.length) {
      stopTimer();
    }
  }

  function handleRestart() {
    stopTimer();
    loadText();
  }

  return (
    <main>
      <div className="heading">
        {/* <h1>Type the below sentence as fast as you can!</h1> */}
      </div>

      <div id="typing-sentence">
        {targetText.split("").map((char, i) => {
          const typedChar = typed[i];
          let className = "";
          if (typedChar == null) {
            className = "";
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

      <textarea
        rows="3"
        cols="100"
        id="text-input"
        placeholder="Click to start typing"
        value={typed}
        onChange={handleChange}
        ref={textareaRef}
      />

      <div id="restart-button">
        <button onClick={handleRestart}>Restart</button>
      </div>

      <div className="stats">
        <div>
          Time : <span id="time">{time}</span>s
        </div>
        <div>
          WPM : <span id="wpm">{wpm}</span>
        </div>
        <div>
          Accuracy : <span id="accuracy">{accuracy}</span>%
        </div>
      </div>

      
    </main>
  );
}
