import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './messenger.module.css';
import { API_URL } from '../Utils/api';
import { FaSearch, FaPlus, FaCircle, FaInbox } from 'react-icons/fa';
import Menu from './Menu';
import socket from '../Utils/socket';
import { useNavigate } from 'react-router-dom';

const Messenger = ({ onOpenChat, setActive, active, pp, showChat }) => { 
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConv, setSelectedConv] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    const token = useMemo(() => localStorage.getItem('token'), []);
    const navigate = useNavigate();

    // Fonction de chargement des conversations optimisée avec useCallback
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_URL}/conversations_list`, {
                headers: {
                    'Authorization': `Bearer${token}`
                }
            });

            if (!response.ok) throw new Error('Erreur de chargement');

            const data = await response.json();
            setConversations(data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des conversations:', err);
            setError(err.message);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [token]); // Dépend uniquement du token

    // Effet pour charger les conversations - optimisé
    useEffect(() => {
        fetchConversations();
        
        // Écouter les nouveaux messages pour rafraîchir la liste
        const handleNewMessage = () => {
            fetchConversations();
        };

        socket.on('message', handleNewMessage);

        return () => {
            socket.off('message', handleNewMessage);
        };
    }, [fetchConversations]); // Dépend de fetchConversations qui est stable grâce à useCallback

    // Effet pour détecter le mode mobile
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
                navigator.userAgent
            );
            const screenWidth = window.innerWidth <= 768;
            setIsMobile(userAgent || screenWidth);
        };
    
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fonctions utilitaires optimisées avec useCallback
    const getInitials = useCallback((username) => {
        if (!username) return '?';
        return username.split(' ')
            .map(word => word.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }, []);

    const formatTime = useCallback((date) => {
        if (!date) return '';
        
        const messageDate = new Date(date);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'maintenant';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}j`;
        
        return messageDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
    }, []);

    const truncateMessage = useCallback((text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }, []);

    // Conversations triées - optimisé avec useMemo
    const sortedConversations = useMemo(() => {
        return [...conversations].sort((a, b) => {
            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
            return dateB - dateA;
        });
    }, [conversations]);

    // Conversations filtrées - optimisé avec useMemo
    const filteredConversations = useMemo(() => 
        sortedConversations.filter(conv =>
            conv.conversationWith?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [sortedConversations, searchQuery]
    );

    // Gestionnaires d'événements optimisés avec useCallback
    const openChat = useCallback((user) => {
        const receiver = {
            _id: user.id,
            username: user.username,
            userPP: user.userPP,
            socketId: user.socketId,
            locationName: user.locationName,
            distance: user.distance
        };
        
        if (onOpenChat) {
            onOpenChat(receiver);
        }
    }, [onOpenChat]);

    const handleNewConversation = useCallback(() => {
        if (isMobile) {
            navigate('/students');
        } else {
            setActive('students');
        }
    }, [isMobile, navigate, setActive]);

    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    // Rendu du composant de conversation optimisé avec useCallback
    const renderConversationCard = useCallback((conv, index) => {
        const isSelected = selectedConv === conv.conversationWith?.id;
        const isUnread = conv.lastMessage?.unread === 1;
        const isOnline = conv.conversationWith?.socketId;

        return (
            <div 
                key={conv.conversationWith?.id || index} 
                className={`${styles.conversationCard} ${isSelected ? styles.selected : ''} ${isUnread ? styles.unread : ''}`}
                onClick={() => openChat(conv.conversationWith)}
            >
                {/* Avatar */}
                <div className={styles.avatarContainer}>
                    {conv.conversationWith?.userPP ? (
                        <img 
                            src={conv.conversationWith.userPP} 
                            alt={conv.conversationWith.username}
                            className={styles.avatar}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {getInitials(conv.conversationWith?.username)}
                        </div>
                    )}
                    {isOnline && (
                        <span className={styles.onlineIndicator}>
                            <FaCircle />
                        </span>
                    )}
                </div>

                {/* Conversation Info */}
                <div className={styles.conversationInfo}>
                    <div className={styles.topRow}>
                        <p className={styles.username}>
                            {conv.conversationWith?.username || 'Utilisateur'}
                        </p>
                        <span className={styles.timestamp}>
                            {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                    </div>
                    
                    <div className={styles.bottomRow}>
                        <span className={`${styles.lastMessage} ${isUnread ? styles.bold : ''}`}>
                            {truncateMessage(conv.lastMessage?.text)}
                        </span>
                        {isUnread && (
                            <span className={styles.unreadBadge}></span>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [selectedConv, openChat, getInitials, formatTime, truncateMessage]);

    // Loading state
    if (loading) {
        return (
            <>
                <div className={styles.messenger}>
                    <div className={styles.header}>
                        <h3>Messages</h3>
                    </div>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Chargement...</p>
                    </div>
                </div>
                {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <div className={styles.messenger}>
                    <div className={styles.header}>
                        <h3>Messages</h3>
                    </div>
                    <div className={styles.error}>
                        <FaInbox />
                        <p>Erreur: {error}</p>
                        <button onClick={fetchConversations} className={styles.retryBtn}>
                            Réessayer
                        </button>
                    </div>
                </div>
                {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
            </>
        );
    }

    return (
        <>
            <div className={styles.messenger}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>Messages</h2>
                    <button 
                        className={styles.newChatBtn}
                        onClick={handleNewConversation}
                        aria-label="Nouvelle conversation"
                    >
                        <FaPlus />
                    </button>
                </div>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Rechercher une conversation..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button 
                                className={styles.clearSearchBtn}
                                onClick={clearSearch}
                                aria-label="Effacer la recherche"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Conversations List */}
                <div className={styles.conversationsList}>
                    {filteredConversations.length === 0 ? (
                        <div className={styles.empty}>
                            <FaInbox />
                            <p>{searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}</p>
                            {!searchQuery && (
                                <button onClick={handleNewConversation} className={styles.startChatBtn}>
                                    Commencer une conversation
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredConversations.map((conv, index) => renderConversationCard(conv, index))
                    )}
                </div>
            </div>
            
            {/* Menu mobile UNE SEULE FOIS en dehors */}
            {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
        </>
    );
};

export default Messenger;