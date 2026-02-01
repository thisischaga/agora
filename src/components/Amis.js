import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "./amis.module.css";

const Amis = ({ setRefresh, refresh }) => {
    const [active, setActive] = useState("followers");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [amis, setAmis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingIds, setProcessingIds] = useState(new Set());

    const token = localStorage.getItem("token");
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

    const headers = {
        headers: { Authorization: `Bearer${token}` },
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [followersRes, followingRes, amisRes] = await Promise.all([
                axios.get(`${backendURL}/amis/followers`, headers),
                axios.get(`${backendURL}/amis/following`, headers),
                axios.get(`${backendURL}/amis/all_friends`, headers),
            ]);

            setFollowers(followersRes.data || []);
            setFollowing(followingRes.data || []);
            setAmis(amisRes.data || []);
        } catch (err) {
            console.error("Erreur chargement amis :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refresh]);

    const handleFollowAction = async (userId) => {
        if (processingIds.has(userId)) return;

        setProcessingIds(prev => new Set(prev).add(userId));
        
        try {
            await axios.put(
                `${backendURL}/back_follow`,
                { authorId: userId },
                headers
            );
            setRefresh((prev) => !prev);
        } catch (err) {
            console.error("Erreur action follow :", err);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        let users = [];
        if (active === "followers") users = followers;
        else if (active === "following") users = following;
        else if (active === "amis") users = amis;

        if (!searchQuery.trim()) return users;

        return users.filter(user => 
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [active, followers, following, amis, searchQuery]);

    const getTabCount = (tab) => {
        switch(tab) {
            case "followers": return followers.length;
            case "following": return following.length;
            case "amis": return amis.length;
            default: return 0;
        }
    };

    const renderUsers = (users, emptyText, btnLabel, btnClass, action) => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Chargement...</p>
                </div>
            );
        }

        if (users.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <p className={styles.emptyText}>{emptyText}</p>
                </div>
            );
        }

        return (
            <div className={styles.usersList}>
                {users.map((user) => {
                    const userId = user.id || user._id;
                    const isProcessing = processingIds.has(userId);
                    
                    return (
                        <div key={userId} className={styles.userCard}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    <img
                                        src={user.pp || "https://via.placeholder.com/48"}
                                        alt={user.username}
                                        className={styles.avatar}
                                    />
                                    {user.isOnline && <span className={styles.onlineBadge}></span>}
                                </div>
                                <div className={styles.userDetails}>
                                    <p className={styles.username}>
                                        {user.displayName || user.username}
                                    </p>
                                    {user.displayName && (
                                        <p className={styles.handle}>@{user.username}</p>
                                    )}
                                    {user.mutualFriends && (
                                        <p className={styles.mutualFriends}>
                                            {user.mutualFriends} ami(s) en commun
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                className={`${btnClass} ${isProcessing ? styles.processing : ''}`}
                                onClick={() => handleFollowAction(userId)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className={styles.btnSpinner}></span>
                                ) : (
                                    btnLabel
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <aside className={styles.amisCont}>
            <div className={styles.header}>
                <h3>Vos amis</h3>
                <div className={styles.statsBar}>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>{followers.length}</span>
                        <span className={styles.statLabel}>Followers</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>{following.length}</span>
                        <span className={styles.statLabel}>Following</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>{amis.length}</span>
                        <span className={styles.statLabel}>Amis</span>
                    </div>
                </div>
            </div>

            <div className={styles.searchContainer}>
                <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    placeholder="Rechercher un ami..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                {searchQuery && (
                    <button 
                        className={styles.clearSearch}
                        onClick={() => setSearchQuery("")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${active === "followers" ? styles.active : ""}`}
                    onClick={() => setActive("followers")}
                >
                    <span>Followers</span>
                    {getTabCount("followers") > 0 && (
                        <span className={styles.tabBadge}>{getTabCount("followers")}</span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${active === "following" ? styles.active : ""}`}
                    onClick={() => setActive("following")}
                >
                    <span>Following</span>
                    {getTabCount("following") > 0 && (
                        <span className={styles.tabBadge}>{getTabCount("following")}</span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${active === "amis" ? styles.active : ""}`}
                    onClick={() => setActive("amis")}
                >
                    <span>Amis</span>
                    {getTabCount("amis") > 0 && (
                        <span className={styles.tabBadge}>{getTabCount("amis")}</span>
                    )}
                </button>
            </div>

            <div className={styles.content}>
                {active === "followers" &&
                    renderUsers(
                        filteredUsers,
                        searchQuery ? "Aucun résultat" : "Vous n'avez aucun follower",
                        "Suivre",
                        styles.blueBtn,
                        "follow"
                    )}

                {active === "following" &&
                    renderUsers(
                        filteredUsers,
                        searchQuery ? "Aucun résultat" : "Vous ne suivez personne",
                        "Ne plus suivre",
                        styles.dangerBtn,
                        "unfollow"
                    )}

                {active === "amis" &&
                    renderUsers(
                        filteredUsers,
                        searchQuery ? "Aucun résultat" : "Vous n'avez aucun ami",
                        "Retirer",
                        styles.neutreBtn,
                        "remove"
                    )}
            </div>
        </aside>
    );
};

export default Amis;