import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';
import styles from './text.module.css';

const Text = ({ back, onPublish }) => {
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const MAX_CHARS = 5000;

  useEffect(() => {
    // Auto-focus textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Handle ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        back();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [back, isLoading]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setTextContent(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!textContent.trim()) {
      setToast({ type: 'error', message: 'Veuillez écrire quelque chose avant de publier !' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendURL}/publication`,
        { postText: textContent, type: "text" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ type: 'success', message: response.data.message || 'Publication créée avec succès !' });
      setTextContent('');
      setCharCount(0);
      
      if (onPublish) onPublish();
      setTimeout(() => back(), 1500);
    } catch (error) {
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Erreur lors de la publication.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCharLimitClose = charCount > MAX_CHARS * 0.9;
  const isCharLimitReached = charCount === MAX_CHARS;
  const progressPercentage = (charCount / MAX_CHARS) * 100;

  return (
    <div className={styles.overlay} onClick={back}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <div>
              <h2 className={styles.modalTitle}>Créer une publication</h2>
              <p className={styles.modalSubtitle}>Partagez vos pensées avec votre communauté</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={back} aria-label="Fermer" disabled={isLoading}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              placeholder="Qu'avez-vous en tête ?"
              value={textContent}
              onChange={handleTextChange}
              className={styles.textarea}
              rows={8}
            />
            
            <div className={styles.textareaFooter}>
              <div className={styles.charCountWrapper}>
                <span className={`${styles.charCount} ${isCharLimitClose ? styles.charCountWarning : ''} ${isCharLimitReached ? styles.charCountDanger : ''}`}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${isCharLimitClose ? styles.progressWarning : ''} ${isCharLimitReached ? styles.progressDanger : ''}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className={styles.features}>
                <button 
                  className={styles.featureBtn}
                  type="button"
                  title="Ajouter un emoji"
                  disabled={isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </button>
                <button 
                  className={styles.featureBtn}
                  type="button"
                  title="Ajouter un hashtag"
                  disabled={isLoading}
                  onClick={() => {
                    const newText = textContent + (textContent && !textContent.endsWith(' ') ? ' #' : '#');
                    if (newText.length <= MAX_CHARS) {
                      setTextContent(newText);
                      setCharCount(newText.length);
                      textareaRef.current?.focus();
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="9" x2="20" y2="9"></line>
                    <line x1="4" y1="15" x2="20" y2="15"></line>
                    <line x1="10" y1="3" x2="8" y2="21"></line>
                    <line x1="16" y1="3" x2="14" y2="21"></line>
                  </svg>
                </button>
                <button 
                  className={styles.featureBtn}
                  type="button"
                  title="Mention"
                  disabled={isLoading}
                  onClick={() => {
                    const newText = textContent + (textContent && !textContent.endsWith(' ') ? ' @' : '@');
                    if (newText.length <= MAX_CHARS) {
                      setTextContent(newText);
                      setCharCount(newText.length);
                      textareaRef.current?.focus();
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {textContent.trim() && (
            <div className={styles.preview}>
              <h4 className={styles.previewTitle}>Aperçu</h4>
              <div className={styles.previewCard}>
                <p className={styles.previewText}>{textContent}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={back}
            disabled={isLoading}
            type="button"
          >
            Annuler
          </button>
          <button
            className={`${styles.submitBtn} ${!textContent.trim() || isLoading ? styles.submitBtnDisabled : ''}`}
            onClick={handleSubmit}
            disabled={isLoading || !textContent.trim()}
            type="button"
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                <span>Publication...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <span>Publier</span>
              </>
            )}
          </button>
        </div>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type}
            setToast={setToast} 
          />
        )}
      </div>
    </div>
  );
};

export default Text;