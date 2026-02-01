import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './messageBox.module.css';
import { FaArrowLeft, FaEllipsisV, FaPaperPlane, FaImage, FaSmile } from "react-icons/fa";
import profil from '../images/batimat.png';

const MessageBox = ({ setShowMessBox, conversation, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll vers le dernier message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize du textarea
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    
    // Auto-resize
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  // Envoi de message
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    try {
      // Logique d'envoi de message ici
      const newMessage = {
        id: Date.now(),
        text: inputValue,
        sender: 'me',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  }, [inputValue]);

  // Gestion de la touche Enter
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  // Formatage de l'heure
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffHours = Math.floor((now - messageDate) / 3600000);
    
    if (diffHours < 24) {
      return messageDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return messageDate.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  // Messages factices pour la démo
  const demoMessages = [
    { id: 1, text: "Salut ! Comment ça va ?", sender: 'them', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, text: "Ça va bien merci ! Et toi ?", sender: 'me', timestamp: new Date(Date.now() - 3000000) },
    { id: 3, text: "Très bien aussi ! Tu fais quoi ce week-end ?", sender: 'them', timestamp: new Date(Date.now() - 2400000) },
    { id: 4, text: "Je ne sais pas encore, peut-être sortir quelque part", sender: 'me', timestamp: new Date(Date.now() - 1800000) },
    ...messages
  ];

  return (
    <div className={styles.messageBox}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.backBtn} 
              onClick={() => setShowMessBox(false)}
              aria-label="Retour"
            >
              <FaArrowLeft />
            </button>
            
            <img src={profil} alt="profil" className={styles.avatar} />
            
            <div className={styles.userMetadata}>
              <p className={styles.username}><strong>username</strong></p>
              <p className={styles.status}>
                <span className={styles.onlineDot}></span>
                En ligne
              </p>
            </div>
          </div>

          <button 
            className={styles.optionsBtn}
            onClick={() => setShowOptions(!showOptions)}
            aria-label="Options"
          >
            <FaEllipsisV />
          </button>

          {showOptions && (
            <div className={styles.optionsMenu}>
              <button>Voir le profil</button>
              <button>Rechercher dans la conversation</button>
              <button>Notifications</button>
              <button className={styles.danger}>Supprimer la conversation</button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {demoMessages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.messageWrapper} ${
                message.sender === 'me' ? styles.sent : styles.received
              }`}
            >
              <div className={styles.messageBubble}>
                <p>{message.text}</p>
                <span className={styles.timestamp}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Indicateur de saisie */}
        {isTyping && (
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {/* Input */}
        <form className={styles.messageInput} onSubmit={handleSendMessage}>
          <button 
            type="button" 
            className={styles.attachBtn}
            aria-label="Joindre une image"
          >
            <FaImage />
          </button>

          <textarea
            ref={textareaRef}
            placeholder="Envoyer un message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows={1}
            className={styles.textarea}
          />

          <button 
            type="button" 
            className={styles.emojiBtn}
            aria-label="Emoji"
          >
            <FaSmile />
          </button>

          <button 
            type="submit" 
            className={styles.sendBtn}
            disabled={!inputValue.trim()}
            aria-label="Envoyer"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageBox;