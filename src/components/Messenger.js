import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './messenger.module.css';
import { API_URL } from '../Utils/api';
import { FaSearch, FaPlus, FaCircle, FaInbox } from 'react-icons/fa';
import Menu from './Menu';

const Messenger = ({ onOpenChat, setActive, active, pp }) => {  // ← Ajouter pp
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConv, setSelectedConv] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

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

    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
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
    };

    const getInitials = useCallback((username) => {
        if (!username) return '?';
        return username.split(' ')
            .map(word => word.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }, []);

    const formatTime = useCallback((date) => {
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

    const filteredConversations = useMemo(() => 
        conversations.filter(conv =>
            conv.conversationWith?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [conversations, searchQuery]
    );

    const openChat = (user) => {
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
    };

    const handleNewConversation = () => {
        console.log('Nouvelle conversation');
    };

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
                    <h3>Messages</h3>
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button 
                                className={styles.clearSearchBtn}
                                onClick={() => setSearchQuery('')}
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
                        filteredConversations.map((conv, index) => {
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
                        })
                    )}
                </div>
            </div>
            
            {/* Menu mobile UNE SEULE FOIS en dehors */}
            {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
        </>
    );
};

export default Messenger;