import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaTimes, FaCheckCircle, FaFootballBall, FaPalette, FaSchool, 
    FaUsers, FaLaptop, FaEllipsisH, FaCalendar, FaClock, 
    FaMapMarkerAlt, FaUserFriends 
} from 'react-icons/fa';
import styles from './publish.module.css';
import { API_URL } from '../Utils/api';

const CATEGORIES = [
    { id: 'sport', label: 'Sport', icon: FaFootballBall },
    { id: 'culture', label: 'Culture', icon: FaPalette },
    { id: 'education', label: 'Éducation', icon: FaSchool },
    { id: 'social', label: 'Social', icon: FaUsers },
    { id: 'technology', label: 'Technologie', icon: FaLaptop },
    { id: 'other', label: 'Autre', icon: FaEllipsisH },
];

const CreateEvent = ({ back }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        category: '',
        maxParticipants: '',
    });

    const [dates, setDates] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });

    // Gestionnaire d'input générique
    const handleInputChange = useCallback((field, value) => {
        setEventData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleDateChange = useCallback((field, value) => {
        setDates(prev => ({ ...prev, [field]: value }));
    }, []);

    // Validation mémorisée pour la performance
    const isFormValid = useMemo(() => {
        const { title, description, location, category } = eventData;
        const { startDate, startTime, endDate, endTime } = dates;
        
        return (
            title.trim().length >= 3 &&
            description.trim().length >= 10 &&
            location.trim() !== '' &&
            category !== '' &&
            startDate && startTime && endDate && endTime
        );
    }, [eventData, dates]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation logique des dates
        const start = new Date(`${dates.startDate}T${dates.startTime}`);
        const end = new Date(`${dates.endDate}T${dates.endTime}`);
        
        if (end <= start) {
            setToast("La fin de l'événement doit être après le début.");
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const eventPayload = {
                ...eventData,
                title: eventData.title.trim(),
                description: eventData.description.trim(),
                location: eventData.location.trim(),
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : null,
                type: 'event'
            };

            await axios.post(
                `${API_URL}/publication`,
                { post: eventPayload },
                // Correction de l'espace Bearer
                { headers: { Authorization: `Bearer${token}` } }
            );

            setToast('Événement créé avec succès !');
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            setToast(error.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (eventData.title.trim() || eventData.description.trim()) {
            if (window.confirm('Abandonner la création ?')) back();
        } else {
            back();
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
                <button type="button" onClick={handleCancel} className={styles.closeBtn} aria-label="Annuler">
                    <FaTimes />
                </button>
                <h1 className={styles.title}>Créer un événement</h1>
                <div className={styles.placeholder}></div>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.scrollContent}>
                    {/* Titre */}
                    <div className={styles.section}>
                        <label className={styles.label}>Titre de l'événement *</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Ex: Tournoi de football"
                            value={eventData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.section}>
                        <label className={styles.label}>Description *</label>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Détails, programme, matériel à prévoir..."
                            value={eventData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            maxLength={500}
                            rows={4}
                            required
                        />
                        <span className={styles.charCount}>{eventData.description.length}/500</span>
                    </div>

                    {/* Catégories */}
                    <div className={styles.section}>
                        <label className={styles.label}>Catégorie *</label>
                        <div className={styles.categoriesGrid}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`${styles.categoryChip} ${eventData.category === cat.id ? styles.categoryChipActive : ''}`}
                                    onClick={() => handleInputChange('category', cat.id)}
                                >
                                    <cat.icon />
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className={styles.section}>
                        <label className={styles.label}>Début et Fin *</label>
                        <div className={styles.dateTimeGrid}>
                            <div className={styles.dateTimeInput}>
                                <FaCalendar className={styles.inputIcon} />
                                <input
                                    type="date"
                                    value={dates.startDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                />
                                <input
                                    type="time"
                                    value={dates.startTime}
                                    onChange={(e) => handleDateChange('startTime', e.target.value)}
                                />
                            </div>
                            <div className={styles.dateTimeInput}>
                                <FaClock className={styles.inputIcon} />
                                <input
                                    type="date"
                                    value={dates.endDate}
                                    min={dates.startDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                />
                                <input
                                    type="time"
                                    value={dates.endTime}
                                    onChange={(e) => handleDateChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lieu et Participants */}
                    <div className={styles.sectionRow}>
                        <div className={styles.section}>
                            <label className={styles.label}>Lieu *</label>
                            <div className={styles.inputWithIcon}>
                                <FaMapMarkerAlt className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Lieu physique ou lien"
                                    value={eventData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.section}>
                            <label className={styles.label}>Places max</label>
                            <div className={styles.inputWithIcon}>
                                <FaUserFriends className={styles.inputIcon} />
                                <input
                                    type="number"
                                    placeholder="Illimité"
                                    value={eventData.maxParticipants}
                                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                                    min="1"
                                />
                            </div>
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
                                <FaCheckCircle />
                                <span>Créer l'événement</span>
                            </>
                        )}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default CreateEvent;