import styles from './imagePosting.module.css';
import { useState } from 'react';
import axios from 'axios';
import { FaImage } from "react-icons/fa";

const ImagePosting = ({ back }) => {
    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem('token');

    const handleImgChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPostImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleTextChange = (e) => {
        setPostText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!postImage && !postText.trim()) return alert('Ajoutez du texte ou une image !');

        setIsLoading(true);
        try {
            await axios.post(
                'http://localhost:8000/publication',
                { postText, postPicture: postImage },
                { headers: { Authorization: `Bearer${token}` } }
            );
            alert('Publication envoyée ✅');
            window.location.reload();
        } catch (error) {
            console.error('Erreur :', error.response?.data?.message || error.message);
            alert("Erreur lors de la publication !");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.editor}>
            <div className={styles.btns}>
                <button onClick={back} className={styles.back}>← Retour</button>
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

            <main className={styles.article}>
                <h2>Créer une publication</h2>

                {/* Choix d’image */}
                {!postImage && (
                    <div className={styles.imgInput}>
                        <label htmlFor="fileChoosing" className={styles.imgLabel}>
                            <FaImage size={150} color="gray" />
                            <p>Cliquez pour choisir une image</p>
                        </label>
                        <input
                            type="file"
                            id="fileChoosing"
                            accept="image/*"
                            onChange={handleImgChange}
                        />
                    </div>
                )}

                {/* Aperçu + texte */}
                {postImage && (
                    <div className={styles.previewContainer}>
                        <div className={styles.previewImage}>
                            <img src={postImage} alt="Aperçu du post" />
                            <button
                                className={styles.removeImg}
                                onClick={() => setPostImage(null)}
                            >
                                ✖
                            </button>
                        </div>

                        <textarea
                            placeholder="Écrivez une légende..."
                            onChange={handleTextChange}
                            value={postText}
                            className={styles.textarea}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default ImagePosting;
