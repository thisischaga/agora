import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaTimes, FaPaperPlane, FaExclamationTriangle, 
    FaCalendar, FaBriefcase, FaNewspaper, FaLightbulb, FaImage, FaLink 
} from 'react-icons/fa';
import styles from './publish.module.css';
import { API_URL } from '../Utils/api';

const PublishInfo = ({ back }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    
    const [infoData, setInfoData] = useState({
        title: '',
        content: '',
        type: '',
        priority: 'normal',
        link: '',
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const MAX_TITLE_CHARS = 100;
    const MAX_CONTENT_CHARS = 1000;

    const infoTypes = [
        { id: 'announcement', label: 'Annonce', icon: FaBriefcase, color: '#3b82f6' },
        { id: 'alert', label: 'Alerte', icon: FaExclamationTriangle, color: '#ef4444' },
        { id: 'event', label: 'Événement', icon: FaCalendar, color: '#10b981' },
        { id: 'opportunity', label: 'Opportunité', icon: FaBriefcase, color: '#2563eb' },
        { id: 'news', label: 'Actualité', icon: FaNewspaper, color: '#f59e0b' },
        { id: 'tip', label: 'Astuce', icon: FaLightbulb, color: '#06b6d4' },
    ];

    const priorities = [
        { id: 'low', label: 'Basse', color: '#6b7280' },
        { id: 'normal', label: 'Normale', color: '#3b82f6' },
        { id: 'high', label: 'Haute', color: '#f59e0b' },
        { id: 'urgent', label: 'Urgente', color: '#ef4444' },
    ];

    const handleInputChange = (field, value) => {
        setInfoData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setToast("L'image ne doit pas dépasser 5 Mo");
                return;
            }
            
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        if (infoData.title.trim() === '') {
            setToast("Le titre est requis");
            return false;
        }
        if (infoData.content.trim() === '') {
            setToast("Le contenu est requis");
            return false;
        }
        if (!infoData.type) {
            setToast("Veuillez sélectionner un type d'information");
            return false;
        }
        if (infoData.link && !isValidUrl(infoData.link)) {
            setToast("Le lien fourni n'est pas valide");
            return false;
        }
        return true;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const payload = {
                title: infoData.title.trim(),
                content: infoData.content.trim(),
                type: infoData.type,
                priority: infoData.priority,
                link: infoData.link.trim() || null,
                imageUrl: imagePreview || null,
                postType: 'info'
            };

            await axios.post(
                `${API_URL}/publication`,
                { post: payload },
                { headers: { Authorization: `Bearer${token}` } }
            );

            setToast('Information publiée avec succès!');
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            console.error('Erreur lors de la publication:', error);
            setToast(error.response?.data?.message || 'Erreur lors de la publication');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (infoData.title.trim() !== '' || infoData.content.trim() !== '') {
            if (window.confirm('Êtes-vous sûr de vouloir abandonner cette publication ?')) {
                back();
            }
        } else {
            back();
        }
    };

    const isFormValid = infoData.title.trim() !== '' && 
                        infoData.content.trim() !== '' && 
                        infoData.type !== '';

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <div className={styles.container}>
            {toast && (
                <div className={styles.toast}>
                    {toast}
                </div>
            )}

            <div className={styles.header}>
                <button onClick={handleCancel} className={styles.closeBtn}>
                    <FaTimes />
                </button>
                <h1 className={styles.title}>Publier une info</h1>
                <div className={styles.placeholder}></div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.scrollContent}>
                    {/* Titre */}
                    <div className={styles.section}>
                        <label className={styles.label}>Titre *</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Ex: Réunion importante ce vendredi"
                            value={infoData.title}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_TITLE_CHARS) {
                                    handleInputChange('title', e.target.value);
                                }
                            }}
                            maxLength={MAX_TITLE_CHARS}
                        />
                        <span className={styles.charCount}>
                            {infoData.title.length}/{MAX_TITLE_CHARS}
                        </span>
                    </div>

                    {/* Contenu */}
                    <div className={styles.section}>
                        <label className={styles.label}>Contenu *</label>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Décrivez l'information en détail..."
                            value={infoData.content}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_CONTENT_CHARS) {
                                    handleInputChange('content', e.target.value);
                                }
                            }}
                            maxLength={MAX_CONTENT_CHARS}
                            rows={6}
                        />
                        <span className={styles.charCount}>
                            {infoData.content.length}/{MAX_CONTENT_CHARS}
                        </span>
                    </div>

                    {/* Type d'info */}
                    <div className={styles.section}>
                        <label className={styles.label}>Type d'information *</label>
                        <div className={styles.typesGrid}>
                            {infoTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`${styles.typeCard} ${infoData.type === type.id ? styles.typeCardActive : ''}`}
                                        onClick={() => handleInputChange('type', type.id)}
                                    >
                                        <div 
                                            className={styles.typeIcon}
                                            style={{ 
                                                backgroundColor: infoData.type === type.id ? type.color : '#f3f4f6',
                                                color: infoData.type === type.id ? '#fff' : type.color
                                            }}
                                        >
                                            <Icon />
                                        </div>
                                        <span 
                                            className={styles.typeLabel}
                                            style={infoData.type === type.id ? { color: type.color } : {}}
                                        >
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priorité */}
                    <div className={styles.section}>
                        <label className={styles.label}>Priorité</label>
                        <div className={styles.prioritiesRow}>
                            {priorities.map((priority) => (
                                <button
                                    key={priority.id}
                                    type="button"
                                    className={`${styles.priorityChip} ${infoData.priority === priority.id ? styles.priorityChipActive : ''}`}
                                    onClick={() => handleInputChange('priority', priority.id)}
                                    style={infoData.priority === priority.id ? { 
                                        backgroundColor: priority.color,
                                        borderColor: priority.color,
                                        color: '#fff'
                                    } : {}}
                                >
                                    {priority.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image */}
                    <div className={styles.section}>
                        <label className={styles.label}>Image (optionnel)</label>
                        {imagePreview ? (
                            <div className={styles.imagePreview}>
                                <img src={imagePreview} alt="Preview" />
                                <button 
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={removeImage}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.imagePicker}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FaImage />
                                <span>Ajouter une image</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Lien */}
                    <div className={styles.section}>
                        <label className={styles.label}>Lien (optionnel)</label>
                        <div className={styles.inputWithIcon}>
                            <FaLink className={styles.inputIcon} />
                            <input
                                type="url"
                                className={styles.inputWithIconText}
                                placeholder="https://exemple.com"
                                value={infoData.link}
                                onChange={(e) => handleInputChange('link', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        type="submit"
                        className={`${styles.submitBtn} ${(!isFormValid || isLoading) ? styles.submitBtnDisabled : ''}`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            <>
                                <FaPaperPlane />
                                <span>Publier l'information</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishInfo;