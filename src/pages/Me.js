import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import styles from './me.module.css';
import { API_URL } from '../Utils/api';
import { 
    FaCalendar, FaQuestionCircle, FaExclamationTriangle, 
    FaBriefcase, FaNewspaper, FaLightbulb, FaHeart, 
    FaRegCommentDots, FaClock
} from 'react-icons/fa';

const Me = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const backendURL = API_URL;

    // ========== TYPE CONFIGURATIONS ==========
    const typeConfig = useMemo(() => ({
        announcement: { icon: FaClock, color: '#3b82f6', label: 'Annonce' },
        alert: { icon: FaExclamationTriangle, color: '#ef4444', label: 'Alerte' },
        event: { icon: FaCalendar, color: '#10b981', label: 'Événement' },
        opportunity: { icon: FaBriefcase, color: '#2563eb', label: 'Opportunité' },
        news: { icon: FaNewspaper, color: '#f59e0b', label: 'Actualité' },
        tip: { icon: FaLightbulb, color: '#06b6d4', label: 'Astuce' },
        question: { icon: FaQuestionCircle, color: '#3b82f6', label: 'Question' },
    }), []);

    // ========== FETCH DATA ==========
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

    // ========== DATA SORTING ==========
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

    const renderGridItem = useCallback((item) => {
        const postType = item.post?.type || item.post?.postType;
        const postData = item.post || {};
        
        // Question Post
        if (postType === 'question') {
            const config = typeConfig.question;
            const IconComponent = config.icon;
            
            return (
                <div 
                    key={item._id} 
                    className={`${styles.gridItem} ${styles.questionPost}`}
                    onClick={() => navigate(`/post/${item._id}`)}
                >
                    <div className={styles.questionOverlay}>
                        <div className={styles.typeIndicator} style={{ backgroundColor: config.color }}>
                            <IconComponent />
                        </div>
                        <h3 className={styles.gridQuestionTitle}>{postData.question}</h3>
                        {postData.category && (
                            <span className={styles.gridCategory}>{postData.category}</span>
                        )}
                    </div>
                    <div className={styles.gridStats}>
                        <span><FaRegCommentDots /> {item.postComment?.length || 0}</span>
                    </div>
                </div>
            );
        }

        // Info Post
        if (postData.postType === 'info') {
            const config = typeConfig[postData.type] || typeConfig.announcement;
            const IconComponent = config.icon;
            
            return (
                <div 
                    key={item._id} 
                    className={`${styles.gridItem} ${styles.infoPost}`}
                    onClick={() => navigate(`/post/${item._id}`)}
                >
                    {postData.imageUrl ? (
                        <>
                            <img src={postData.imageUrl} alt="Info" className={styles.gridImage} />
                            <div className={styles.infoOverlay}>
                                <div className={styles.typeIndicator} style={{ backgroundColor: config.color }}>
                                    <IconComponent />
                                </div>
                                <h3 className={styles.gridInfoTitle}>{postData.title}</h3>
                            </div>
                        </>
                    ) : (
                        <div className={styles.infoTextOnly}>
                            <div className={styles.typeIndicator} style={{ backgroundColor: config.color }}>
                                <IconComponent />
                            </div>
                            <h3 className={styles.gridInfoTitle}>{postData.title}</h3>
                            <p className={styles.gridInfoContent}>{postData.content?.substring(0, 80)}...</p>
                        </div>
                    )}
                    <div className={styles.gridStats}>
                        <span><FaHeart /> {item.postLike?.length || 0}</span>
                        <span><FaRegCommentDots /> {item.postComment?.length || 0}</span>
                    </div>
                </div>
            );
        }

        // Event Post
        if (postType === 'event') {
            const config = typeConfig.event;
            const IconComponent = config.icon;
            
            return (
                <div 
                    key={item._id} 
                    className={`${styles.gridItem} ${styles.eventPost}`}
                    onClick={() => navigate(`/post/${item._id}`)}
                >
                    <div className={styles.eventOverlay}>
                        <div className={styles.typeIndicator} style={{ backgroundColor: config.color }}>
                            <IconComponent />
                        </div>
                        <h3 className={styles.gridEventTitle}>{postData.title}</h3>
                        {postData.startDate && (
                            <span className={styles.gridEventDate}>
                                <FaClock /> {new Date(postData.startDate).toLocaleDateString('fr-FR', { 
                                    day: 'numeric', 
                                    month: 'short' 
                                })}
                            </span>
                        )}
                    </div>
                    <div className={styles.gridStats}>
                        <span><FaHeart /> {item.postLike?.length || 0}</span>
                        <span><FaRegCommentDots /> {item.postComment?.length || 0}</span>
                    </div>
                </div>
            );
        }

        // Regular Post with Image
        if (item.postPicture) {
            return (
                <div 
                    key={item._id} 
                    className={styles.gridItem}
                    onClick={() => navigate(`/post/${item._id}`)}
                >
                    <img src={item.postPicture} alt="Post" className={styles.gridImage} />
                    {item.title && (
                        <div className={styles.articleOverlay}>
                            <h3 className={styles.gridArticleTitle}>{item.title}</h3>
                        </div>
                    )}
                    <div className={styles.gridStats}>
                        <span><FaHeart /> {item.postLike?.length || 0}</span>
                        <span><FaRegCommentDots /> {item.postComment?.length || 0}</span>
                    </div>
                </div>
            );
        }

        // Text-only Post
        return (
            <div 
                key={item._id} 
                className={`${styles.gridItem} ${styles.textPost}`}
                onClick={() => navigate(`/post/${item._id}`)}
            >
                <div className={styles.textPostContent}>
                    <p className={styles.gridTextContent}>
                        {item.postText?.substring(0, 120)}
                        {item.postText?.length > 120 ? '...' : ''}
                    </p>
                </div>
                <div className={styles.gridStats}>
                    <span><FaHeart /> {item.postLike?.length || 0}</span>
                    <span><FaRegCommentDots /> {item.postComment?.length || 0}</span>
                </div>
            </div>
        );
    }, [navigate, typeConfig]);

    // ========== RENDER HEADER ==========
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

    // ========== LOADING STATE ==========
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    // ========== MAIN RENDER ==========
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
                        displayData.map((item) => renderGridItem(item))
                    ) : (
                        <div className={styles.emptyState}>
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <p className={styles.emptyTitle}>
                                {activeTab === "posts" ? "Aucune publication" : "Aucun contenu enregistré"}
                            </p>
                            <p className={styles.emptySubtitle}>
                                {activeTab === "posts" 
                                    ? "Créez votre première publication" 
                                    : "Enregistrez des publications pour les retrouver ici"}
                            </p>
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

// ========== SUB-COMPONENTS ==========
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