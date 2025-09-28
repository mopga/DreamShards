import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

export default function DialogueBox() {
  const { dialogueData, setGameState, setDialogueData } = useGame();
  const [currentText, setCurrentText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    if (dialogueData && dialogueData.text) {
      setCurrentText(dialogueData.text);
      setDisplayedText('');
      setIsTyping(true);
      setShowChoices(false);
    }
  }, [dialogueData]);

  useEffect(() => {
    if (isTyping && currentText) {
      if (displayedText.length < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
        if (dialogueData.choices && dialogueData.choices.length > 0) {
          setShowChoices(true);
        }
      }
    }
  }, [displayedText, currentText, isTyping, dialogueData]);

  const handleChoice = (choice: any) => {
    if (choice.action) {
      choice.action();
    }
    
    if (choice.nextDialogue) {
      setDialogueData(choice.nextDialogue);
    } else {
      setGameState('exploration');
      setDialogueData(null);
    }
  };

  const skipTyping = () => {
    if (isTyping) {
      setDisplayedText(currentText);
      setIsTyping(false);
      if (dialogueData.choices && dialogueData.choices.length > 0) {
        setShowChoices(true);
      }
    } else if (!showChoices) {
      setGameState('exploration');
      setDialogueData(null);
    }
  };

  if (!dialogueData) return null;

  return (
    <div className="dialogue-overlay">
      <div className="dialogue-box">
        <div className="dialogue-header">
          {dialogueData.speaker && (
            <div className="speaker-name">{dialogueData.speaker}</div>
          )}
        </div>
        
        <div className="dialogue-content">
          <div className="dialogue-text" onClick={skipTyping}>
            {displayedText}
            {isTyping && <span className="typing-cursor">|</span>}
          </div>
          
          {showChoices && dialogueData.choices && (
            <div className="dialogue-choices">
              {dialogueData.choices.map((choice: any, index: number) => (
                <button
                  key={index}
                  className="choice-button"
                  onClick={() => handleChoice(choice)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
          
          {!showChoices && !isTyping && !dialogueData.choices && (
            <div className="continue-hint">Click to continue...</div>
          )}
        </div>
      </div>
    </div>
  );
}
