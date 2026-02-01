import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./StudentMap.module.css";

const StudentMap = ({ onOpenChat }) => {  // Ajout de la prop onOpenChat
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8000/all-users`, {
                headers: { Authorization: `Bearer${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const getStatusInfo = (socketId) => {
        if (socketId) return { color: "#10b981", text: "En ligne" };
        return { color: "#6b7280", text: "Hors ligne" };
    };

    const openChat = (user) => {
        // Préparer l'objet receiver avec les bonnes propriétés
        const receiver = {
            _id: user._id,
            username: user.username,
            userPP: user.userPP,
            socketId: user.socketId,
            locationName: user.locationName,
            distance: user.distance
        };
        
        // Appeler la fonction onOpenChat passée en prop
        if (onOpenChat) {
            onOpenChat(receiver);
        }
    };

    const getInitials = (username) => {
        return username?.charAt(0).toUpperCase() || '?';
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h3>À proximité</h3>
                <button className={styles.refreshBtn} onClick={onRefresh} disabled={refreshing}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <LegendItem color="#10b981" label="En ligne" />
                <LegendItem color="#6b7280" label="Hors ligne" />
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.center}>
                    <div className={styles.spinner}></div>
                </div>
            ) : users.length === 0 ? (
                <div className={styles.noUsers}>
                    Aucun étudiant trouvé à proximité.
                </div>
            ) : (
                <div className={styles.listContainer}>
                    {users.map((user) => (
                        <StudentCard 
                            key={user._id || user.id} 
                            user={user} 
                            onOpenChat={openChat}
                            getStatusInfo={getStatusInfo}
                            getInitials={getInitials}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Composant pour chaque carte étudiant
const StudentCard = ({ user, onOpenChat, getStatusInfo, getInitials }) => {
    const status = getStatusInfo(user.socketId);

    return (
        <div className={styles.studentCard}>
            <div className={styles.studentHeader}>
                <div className={styles.avatarContainer}>
                    {user.userPP ? (
                        <img 
                            src={user.userPP} 
                            alt={user.username}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {getInitials(user.username)}
                        </div>
                    )}
                    <div 
                        className={styles.statusDot} 
                        style={{ backgroundColor: status.color }}
                    />
                </div>

                <div className={styles.studentInfo}>
                    <p className={styles.studentName}>{user.username}</p>
                    
                    {user.locationName && (
                        <div className={styles.locationContainer}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className={styles.locationText}>
                                {user.locationName}
                            </span>
                        </div>
                    )}
                    
                    <div className={styles.statusContainer}>
                        <div 
                            className={styles.statusIndicator} 
                            style={{ backgroundColor: status.color }}
                        />
                        <span className={styles.statusText}>{status.text}</span>
                        {user.distance && (
                            <span className={styles.distanceText}>• {user.distance} km</span>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button 
                    className={styles.actionBtn} 
                    onClick={() => onOpenChat(user)}
                    title="Envoyer un message"
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </button>
                <button 
                    className={styles.actionBtn}
                    title="Appeler"
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                </button>
                <button 
                    className={`${styles.actionBtn} ${styles.navigateBtn}`}
                    title="Localiser"
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Composant pour la légende
const LegendItem = ({ color, label }) => (
    <div className={styles.legendItem}>
        <div className={styles.legendDot} style={{ backgroundColor: color }} />
        <span className={styles.legendText}>{label}</span>
    </div>
);

export default StudentMap;