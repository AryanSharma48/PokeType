import { useState, useRef, useEffect } from 'react';
import '../styles/AudioToggle.css';
import pokemonTheme from '../audio/Pokemon Season 1 Music_ Pokemon, I Choose You!.mp3';

export default function AudioToggle() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio(pokemonTheme));
    const hasAttemptedAutoPlay = useRef(false);

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;
        audio.volume = 0.4;

        // Try auto-play
        const attemptAutoPlay = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
                hasAttemptedAutoPlay.current = true;
            } catch (err) {
                console.log("Auto-play blocked, waiting for user interaction");
                // Auto-play blocked, will play on first click
            }
        };

        attemptAutoPlay();

        // Play on first user interaction if auto-play failed
        const handleFirstClick = () => {
            if (!hasAttemptedAutoPlay.current) {
                audio.play().then(() => {
                    setIsPlaying(true);
                    hasAttemptedAutoPlay.current = true;
                }).catch(err => console.error("Play failed:", err));
            }
        };

        document.addEventListener('click', handleFirstClick, { once: true });

        return () => {
            audio.pause();
            audio.src = '';
            document.removeEventListener('click', handleFirstClick);
        };
    }, []);

    const toggleAudio = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            // Ensure loop is set and play
            audio.loop = true;
            audio.play().catch(err => console.error("Audio play failed:", err));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="audio-toggle">
            <button 
                className={`music-btn ${isPlaying ? 'playing' : 'muted'}`} 
                onClick={toggleAudio}
                title={isPlaying ? "Mute Music" : "Play Music"}
            >
                <div className="music-icon">
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" strokeLinejoin="inherit">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" strokeLinejoin="inherit">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    )}
                </div>
            </button>
        </div>
    );
}
