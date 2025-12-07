import styles from './text.module.css';
import { useState } from 'react';
import axios from 'axios';
import Toast from './Toast';

const Text = ({ back }) => {
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const token = localStorage.getItem('token');

  const handleTextChange = (e) => {
    setTextContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!textContent.trim()) {
      setToast('Veuillez écrire quelque chose avant de publier !');
      return;
    }

    setIsLoading(true);
    try {
        const response = await axios.post(
            'http://localhost:8000/publication',
            {
            postText: textContent, type:"text"
            },
            {
            headers: { Authorization: `Bearer${token}` },
            }
        );
        setToast(response.data.message);
        window.location.reload();
    } catch (error) {
      console.log('Erreur :', error.response?.data?.message || error.message);
      setToast(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.btns}>
        <button onClick={back} className={styles.back}>
          Retour
        </button>
        {isLoading ? (
          <div className={styles.spinner}>
            <p className={styles.btnInLoading}></p>
          </div>
        ) : (
          <button className={styles.submitBtn} onClick={handleSubmit}>
            PUBLIER
          </button>
        )}
      </div>
      <div >
        {toast && <Toast message={toast} setToast={setToast}/>}
      </div>
      <main className={styles.article}>
        <div>
          <h2>Créer une publication</h2>
          <div className={styles.inputs}>
            <textarea
              placeholder="Écrivez..."
              onChange={handleTextChange}
              value={textContent}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Text;
