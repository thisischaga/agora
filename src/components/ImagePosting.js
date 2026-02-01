import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';
import styles from './imagePosting.module.css';
import { API_URL } from '../Utils/api';

const ImagePosting = ({ back, onPublish }) => {
    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [imageError, setImageError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [toast, setToast] = useState(null);
    
    const fileInputRef = useRef(null);
    const backendURL = API_URL;

    const MAX_CHARS = 500;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    useEffect(() => {
        // Handle ESC key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isLoading) {
                back();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [back, isLoading]);

    const handleImgChange = (file) => {
        setImageError('');
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Veuillez sélectionner une image valide (PNG, JPG, GIF)');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setImageError('L\'image ne doit pas dépasser 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPostImage(reader.result);
            setImagePreview(reader.result);
        };
        reader.onerror = () => {
            setImageError('Erreur lors de la lecture du fichier');
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImgChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) handleImgChange(file);
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_CHARS) {
            setPostText(text);
            setCharCount(text.length);
        }
    };

    const handleRemoveImage = () => {
        setPostImage(null);
        setImagePreview(null);
        setImageError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!postText.trim() && !postImage) {
            setToast({ type: 'error', message: 'Ajoutez du texte ou une image !' });
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${backendURL}/publication`,
                { legend: postText, postPicture: postImage, type: "image" },
                { headers: { Authorization: `Bearer${token}` } }
            );
            
            setToast({ type: 'success', message: response.data.message || 'Publication créée avec succès !' });
            setPostText('');
            setPostImage(null);
            setImagePreview(null);
            setCharCount(0);
            setImageError('');
            
            if (onPublish) onPublish();
            setTimeout(() => back(), 1500);
        } catch (error) {
            console.error(error.response?.data?.message || error.message);
            setToast({ 
                type: 'error', 
                message: error.response?.data?.message || 'Erreur lors de la publication !' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isCharLimitClose = charCount > MAX_CHARS * 0.9;
    const progressPercentage = (charCount / MAX_CHARS) * 100;

    return (
        <div className={styles.overlay} onClick={back}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerContent}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <div>
                            <h2 className={styles.modalTitle}>Créer une publication</h2>
                            <p className={styles.modalSubtitle}>Partagez une image avec votre communauté</p>
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
                    {!imagePreview ? (
                        <div 
                            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                            <div className={styles.dropZoneContent}>
                                <div className={styles.dropZoneIcon}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                </div>
                                <h3 className={styles.dropZoneTitle}>
                                    {isDragging ? 'Déposez votre image ici' : 'Glissez et déposez une image'}
                                </h3>
                                <p className={styles.dropZoneSubtitle}>ou cliquez pour parcourir</p>
                                <div className={styles.dropZoneFormats}>
                                    <span>PNG</span>
                                    <span>•</span>
                                    <span>JPG</span>
                                    <span>•</span>
                                    <span>GIF</span>
                                    <span>•</span>
                                    <span>Max 5MB</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.imagePreviewSection}>
                            <div className={styles.imagePreviewWrapper}>
                                <img src={imagePreview} alt="Aperçu" className={styles.imagePreview} />
                                <div className={styles.imageOverlay}>
                                    <button
                                        className={styles.changeImageBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                        type="button"
                                        disabled={isLoading}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        <span>Modifier</span>
                                    </button>
                                    <button
                                        className={styles.removeImageBtn}
                                        onClick={handleRemoveImage}
                                        type="button"
                                        disabled={isLoading}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        <span>Supprimer</span>
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {imageError && (
                        <div className={styles.errorBanner}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>{imageError}</p>
                        </div>
                    )}

                    <div className={styles.captionSection}>
                        <label className={styles.captionLabel}>
                            {imagePreview ? 'Légende (optionnelle)' : 'Ou écrivez simplement un message'}
                        </label>
                        <div className={styles.textareaWrapper}>
                            <textarea
                                placeholder={imagePreview ? "Écrivez une légende..." : "Qu'avez-vous en tête ?"}
                                value={postText}
                                onChange={handleTextChange}
                                className={styles.textarea}
                                maxLength={MAX_CHARS}
                                rows={4}
                            />
                            <div className={styles.textareaFooter}>
                                <span className={`${styles.charCount} ${isCharLimitClose ? styles.charCountWarning : ''}`}>
                                    {charCount} / {MAX_CHARS}
                                </span>
                                <div className={styles.progressBar}>
                                    <div 
                                        className={`${styles.progressFill} ${isCharLimitClose ? styles.progressWarning : ''}`}
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        className={`${styles.submitBtn} ${(!postText.trim() && !postImage) || isLoading ? styles.submitBtnDisabled : ''}`}
                        onClick={handleSubmit}
                        disabled={isLoading || (!postText.trim() && !postImage)}
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

export default ImagePosting;