import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaTimes, FaPaperPlane, FaInfoCircle, FaSchool, FaCode, 
    FaBriefcase, FaUsers, FaQuestionCircle 
} from 'react-icons/fa';
import styles from './publish.module.css';
import { API_URL } from '../Utils/api';

// Constantes déplacées hors du composant pour éviter la recréation à chaque rendu
const CATEGORIES = [
    { id: 'academic', label: 'Académique', icon: FaSchool, color: '#3b82f6' },
    { id: 'technical', label: 'Technique', icon: FaCode, color: '#8b5cf6' },
    { id: 'career', label: 'Carrière', icon: FaBriefcase, color: '#10b981' },
    { id: 'life', label: 'Vie étudiante', icon: FaUsers, color: '#f59e0b' },
    { id: 'other', label: 'Autre', icon: FaQuestionCircle, color: '#6b7280' },
];

const TAGS_LIST = [
    'Cours', 'Examens', 'Projets', 'Stage', 'Emploi', 
    'Logement', 'Transport', 'Santé', 'Sport', 'Culture',
    'Programmation', 'Mathématiques', 'Physique', 'Langues'
];

const MAX_QUESTION_CHARS = 200;
const MAX_DETAILS_CHARS = 1000;

const AskQuestion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        question: '',
        details: '',
        category: '',
        tags: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Validation mémorisée
    const isFormValid = useMemo(() => (
        formData.question.trim().length >= 10 && formData.category !== ''
    ), [formData.question, formData.category]);

    // Gestionnaire de champ unique pour réduire le code
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const toggleTag = useCallback((tag) => {
        setFormData(prev => {
            const isSelected = prev.tags.includes(tag);
            if (isSelected) {
                return { ...prev, tags: prev.tags.filter(t => t !== tag) };
            } else if (prev.tags.length < 5) {
                return { ...prev, tags: [...prev.tags, tag] };
            }
            setToast('Maximum 5 tags autorisés');
            return prev;
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                question: formData.question.trim(),
                details: formData.details.trim(),
                type: 'question'
            };

            await axios.post(
                `${API_URL}/publication`,
                { post: payload },
                // Correction ici : Ajout de l'espace après Bearer
                { headers: { Authorization: `Bearer${token}` } } 
            );

            setToast('Question publiée avec succès !');
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            setToast(error.response?.data?.message || 'Erreur lors de la publication');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (formData.question.trim() || formData.details.trim()) {
            if (window.confirm('Abandonner la rédaction ?')) navigate(-1);
        } else {
            navigate(-1);
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <div className={styles.container}>
            {toast && <div className={styles.toast}>{toast}</div>}

            <header className={styles.header}>
                <button type="button" onClick={handleCancel} className={styles.closeBtn} aria-label="Fermer">
                    <FaTimes />
                </button>
                <h1 className={styles.title}>Poser une question</h1>
                <div className={styles.placeholder}></div>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.scrollContent}>
                    <div className={styles.infoBanner}>
                        <FaInfoCircle />
                        <span>Privilégiez une question courte et précise.</span>
                    </div>

                    {/* Section Question */}
                    <div className={styles.section}>
                        <label className={styles.label}>Votre question *</label>
                        <textarea
                            name="question"
                            className={`${styles.input} ${styles.questionInput}`}
                            placeholder="Ex: Quel est le meilleur langage pour le Web en 2026 ?"
                            value={formData.question}
                            onChange={handleChange}
                            maxLength={MAX_QUESTION_CHARS}
                            rows={3}
                            required
                        />
                        <span className={styles.charCount}>
                            {formData.question.length}/{MAX_QUESTION_CHARS}
                        </span>
                    </div>

                    {/* Section Détails */}
                    <div className={styles.section}>
                        <label className={styles.label}>Détails (optionnel)</label>
                        <textarea
                            name="details"
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Donnez plus de contexte..."
                            value={formData.details}
                            onChange={handleChange}
                            maxLength={MAX_DETAILS_CHARS}
                            rows={5}
                        />
                        <span className={styles.charCount}>
                            {formData.details.length}/{MAX_DETAILS_CHARS}
                        </span>
                    </div>

                    {/* Section Catégories */}
                    <div className={styles.section}>
                        <label className={styles.label}>Catégorie *</label>
                        <div className={styles.categoriesGrid}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`${styles.categoryCard} ${formData.category === cat.id ? styles.categoryCardActive : ''}`}
                                    onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                                >
                                    <div 
                                        className={styles.categoryIcon}
                                        style={{ 
                                            backgroundColor: formData.category === cat.id ? cat.color : 'var(--bg-hover)',
                                            color: formData.category === cat.id ? '#fff' : cat.color
                                        }}
                                    >
                                        <cat.icon />
                                    </div>
                                    <span className={styles.categoryLabel}>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Tags */}
                    <div className={styles.section}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Tags</label>
                            <span className={styles.labelHint}>{formData.tags.length}/5</span>
                        </div>
                        <div className={styles.tagsContainer}>
                            {TAGS_LIST.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`${styles.tagChip} ${formData.tags.includes(tag) ? styles.tagChipActive : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className={styles.footer}>
                    <button
                        type="submit"
                        className={`${styles.submitBtn} ${(!isFormValid || isLoading) ? styles.submitBtnDisabled : ''}`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? <div className={styles.spinner} /> : (
                            <>
                                <FaPaperPlane />
                                <span>Publier</span>
                            </>
                        )}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AskQuestion;