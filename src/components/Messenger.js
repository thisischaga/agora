import React, { useState, useEffect } from 'react';
import styles from './messenger.module.css';
import { API_URL } from '../Utils/api';

const Messenger = ({ onOpenChat }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/conversations_list`, {
                headers: {
                    'Authorization': `Bearer${token}`
                }
            });

            if (!response.ok) throw new Error('Erreur de chargement');

            const data = await response.json();
            setConversations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (username) => {
        return username?.charAt(0).toUpperCase() || '?';
    };

    const formatTime = (date) => {
        const messageDate = new Date(date);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `${diffMins} min`;
        if (diffHours < 24) return `${diffHours} h`;
        if (diffDays < 7) return `${diffDays} j`;
        
        return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const truncateMessage = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const filteredConversations = conversations.filter(conv =>
        conv.conversationWith.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.forums}>
                <div className={styles.noUsers}>Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.forums}>
                <div className={styles.noUsers}>Erreur: {error}</div>
            </div>
        );
    }
    const openChat = (user) => {
        // Préparer l'objet receiver avec les bonnes propriétés
        const receiver = {
            _id: user.id,
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

    return (
        <div className={styles.forums}>
            {/* Header */}
            <h3>Messages</h3>

            {/* Search Bar */}
            <div className={styles.tools}>
                <input
                    type="text"
                    placeholder="Rechercher dans Messenger"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className={styles.add}>
                    <p>+</p>
                </div>
            </div>

            {/* Conversations List */}
            {filteredConversations.length === 0 ? (
                <div className={styles.noUsers}>
                    {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                </div>
            ) : (
                filteredConversations.map((conv, index) => (
                    <div 
                        key={conv.conversationWith.id || index} 
                        className={styles.forumCard}
                        onClick={() => openChat(conv.conversationWith)}
                    >
                        <div className={styles.roomData}>
                            {/* Avatar */}
                            <div className={styles.avatarContainer}>
                                {conv.conversationWith.userPP ? (
                                    <img 
                                        src={conv.conversationWith.userPP} 
                                        alt={conv.conversationWith.username}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {getInitials(conv.conversationWith.username)}
                                    </div>
                                )}
                                {conv.conversationWith.socketId && (
                                    <span className={styles.onlineIndicator}></span>
                                )}
                            </div>

                            {/* Message Info */}
                            <div className={styles.dataInColum}>
                                <div className={styles.topRow}>
                                    <p>{conv.conversationWith.username}</p>
                                    <span className={styles.timestamp}>
                                        {formatTime(conv.lastMessage.createdAt)}
                                    </span>
                                </div>
                                <div className={styles.bottomRow}>
                                    <span className={conv.lastMessage.unread ? styles.unreadMessage : ''}>
                                        {truncateMessage(conv.lastMessage.text)}
                                    </span>
                                    {conv.lastMessage.unread === 1 && (
                                        <span className={styles.unreadBadge}></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Messenger;