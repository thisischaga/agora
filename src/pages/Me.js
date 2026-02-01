import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import styles from './me.module.css';
import { API_URL } from '../Utils/api';

const Me = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const backendURL = API_URL;

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${backendURL}/user_data`, {
                headers: { Authorization: `Bearer${token}` },
            });
            setUserData(response.data);
        } catch (error) {
            console.error("Erreur fetchData:", error.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [backendURL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // LOGIQUE DE TRI : Plus récent en haut
    const displayData = useMemo(() => {
        let source = [];
        if (activeTab === "posts") source = userData?.posts || [];
        else if (activeTab === "saved") source = userData?.favoris || [];

        return [...source].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [activeTab, userData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
                <img src={userData?.userPP} alt="Avatar" className={styles.avatar} />
                <div className={styles.statsContainer}>
                    <StatItem number={userData?.posts?.length || 0} label="Posts" />
                    <StatItem number={userData?.followers?.length || 0} label="Abonnés" />
                    <StatItem number={userData?.following?.length || 0} label="Abonnements." />
                </div>
            </div>

            <div className={styles.bioSection}>
                <h2 className={styles.displayName}>{userData?.displayName || userData?.username}</h2>
                {userData?.bio && <p className={styles.bio}>{userData?.bio}</p>}
            </div>

            <div className={styles.actionButtons}>
                <button 
                    className={styles.editButton} 
                    onClick={() => navigate('/edit-profile', { state: { userData } })}
                >
                    Modifier le profil
                </button>
                <button className={styles.shareButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                </button>
            </div>

            <div className={styles.tabsContainer}>
                <TabIcon 
                    icon="grid" 
                    active={activeTab === "posts"} 
                    onPress={() => setActiveTab("posts")} 
                />
                <TabIcon 
                    icon="bookmark" 
                    active={activeTab === "saved"} 
                    onPress={() => setActiveTab("saved")} 
                />
                <TabIcon 
                    icon="person" 
                    active={activeTab === "tagged"} 
                    onPress={() => setActiveTab("tagged")} 
                />
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.topNav}>
                <h1 className={styles.usernameTitle}>{userData?.username}</h1>
                <button onClick={() => navigate('/settings')} className={styles.menuButton}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className={styles.scrollContainer}>
                {renderHeader()}

                <div className={styles.gridContainer}>
                    {displayData.length > 0 ? (
                        displayData.map((item) => (
                            <div 
                                key={item._id} 
                                className={styles.gridItem}
                                onClick={() => navigate(`/post/${item._id}`)}
                            >
                                {item.postPicture ? (
                                    <img src={item.postPicture} alt="Post" className={styles.gridImage} />
                                ) : (
                                    <div className={`${styles.gridImage} ${styles.textPostFallback}`}>
                                        <p className={styles.textFallbackText}>{item.postText}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <p className={styles.emptyTitle}>Aucun contenu</p>
                        </div>
                    )}
                </div>
            </div>

            {refreshing && (
                <div className={styles.refreshIndicator}>
                    <div className={styles.spinner}></div>
                </div>
            )}
        </div>
    );
};

// Sous-composants
const StatItem = ({ number, label }) => (
    <div className={styles.statItem}>
        <span className={styles.statNumber}>{number}</span>
        <span className={styles.statLabel}>{label}</span>
    </div>
);

const TabIcon = ({ icon, active, onPress }) => {
    const renderIcon = () => {
        switch(icon) {
            case 'grid':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                );
            case 'bookmark':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                );
            case 'person':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <button 
            className={`${styles.tab} ${active ? styles.tabActive : ''}`} 
            onClick={onPress}
        >
            {renderIcon()}
        </button>
    );
};

export default Me;