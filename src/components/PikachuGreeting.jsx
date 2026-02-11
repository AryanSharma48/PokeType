import { useState, useEffect } from 'react';
import '../styles/PikachuGreeting.css';
import pikachuImg from '../images/pokemons/pikachu.png';
import textboxImg from '../images/textbox.png';

export default function PikachuGreeting() {
    const [showPikachu, setShowPikachu] = useState(false);
    const [showTextbox, setShowTextbox] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isHiding, setIsHiding] = useState(false);

    useEffect(() => {
        // Delay appearance slightly after page load
        const pikachuTimer = setTimeout(() => setShowPikachu(true), 500);
        const textboxTimer = setTimeout(() => setShowTextbox(true), 1000);

        return () => {
            clearTimeout(pikachuTimer);
            clearTimeout(textboxTimer);
        };
    }, []);

    useEffect(() => {
        let typingTimer;
        let hasStartedTyping = false;

        const handleKeyPress = () => {
            if (!hasStartedTyping) {
                hasStartedTyping = true;
                // Start 5-second timer on first keypress
                typingTimer = setTimeout(() => {
                    setIsHiding(true);
                    // Wait for animation to complete before hiding
                    setTimeout(() => {
                        setIsVisible(false);
                    }, 600); // Match animation duration
                }, 5000);
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (typingTimer) clearTimeout(typingTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`pikachu-greeting ${isHiding ? 'hiding' : ''}`}>
            {/* Pikachu in bottom-left */}
            {showPikachu && (
                <div className="pikachu-character">
                    <img 
                        src={pikachuImg} 
                        alt="Pikachu" 
                    />
                </div>
            )}

            {/* Speech bubble textbox */}
            {showTextbox && (
                <div className="greeting-textbox">
                    <img 
                        src={textboxImg} 
                        alt="Textbox" 
                        className="textbox-image"
                    />
                    <p className="greeting-text">
                        Pika Pika!<br />
                        Good luck!
                    </p>
                </div>
            )}
        </div>
    );
}
