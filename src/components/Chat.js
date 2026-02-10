import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import styles from "./chat.module.css";
import { API_URL } from '../Utils/api';
import socket from "../Utils/socket";
import { FaCheck, FaCheckDouble, FaClock, FaTimes, FaEllipsisV, FaPaperclip, FaSmile } from "react-icons/fa";

const AVATAR_SIZE = 32;

// --- COMPOSANT BULLE DE MESSAGE OPTIMISÉ ---
const MessageBubble = React.memo(({ item, isMyMessage, showAvatar, showDate, receiver, formatTime, dateText }) => (
    <div className={styles.messageWrapper}>
        {showDate && (
            <div className={styles.dateSeparator}>
                <span className={styles.dateSeparatorText}>{dateText}</span>
            </div>
        )}
        <div className={`${styles.messageRow} ${isMyMessage ? styles.myMessageRow : styles.otherMessageRow}`}>
            {!isMyMessage && (
                <div className={`${styles.avatarContainer} ${!showAvatar ? styles.avatarHidden : ''}`}>
                    {receiver.userPP ? (
                        <img 
                            src={receiver.userPP} 
                            alt={receiver.username}
                            className={styles.messageAvatar} 
                        />
                    ) : (
                        <div className={styles.messageAvatarPlaceholder}>
                            {receiver.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}
            <div className={`
                ${styles.messageBubble} 
                ${isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble}
                ${item.pending ? styles.pendingMessage : ''}
            `}>
                <p className={`${styles.messageText} ${isMyMessage ? styles.myMessageText : styles.otherMessageText}`}>
                    {item.message}
                </p>
                <div className={styles.messageMeta}>
                    <span className={`${styles.messageTime} ${isMyMessage ? styles.myMessageTime : styles.otherMessageTime}`}>
                        {formatTime(item.createdAt)}
                    </span>
                </div>
            </div>
            {isMyMessage && (
                <div className={styles.checkIcon}>
                    {item.pending ? (
                        <FaClock className={styles.iconPending} />
                    ) : item.isRead ? (
                        <img 
                            src={receiver.userPP} 
                            alt={receiver.username}
                            className={styles.readMsg} 
                        />
                    ) : (
                        <FaCheck className={styles.iconSent} />
                    )}
                </div>
            )}
        </div>
    </div>
));

const Chat = ({ receiver, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const textareaRef = useRef(null);
    
    const token = useMemo(() => localStorage.getItem('token'), []);

    // --- DÉTECTION MOBILE/DESKTOP ---
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

    // --- FORMATAGE OPTIMISÉ ---
    const formatMessageTime = useCallback((date) => {
        const d = new Date(date);
        return isNaN(d.getTime()) ? "" : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const getDateSeparatorText = useCallback((date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today) return "Aujourd'hui";
        if (d.toDateString() === yesterday.toDateString()) return "Hier";
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }, []);

    // --- LOGIQUE API OPTIMISÉE ---
    const fetchMessages = useCallback(async (isFirstLoad = false) => {
        try {
            if (!token) return;
            const response = await axios.get(`${API_URL}/conversations/${receiver._id}`, {
                headers: { Authorization: `Bearer${token}` }
            });
            const newMessages = response.data || [];
            
            setMessages(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
                    return newMessages;
                }
                return prev;
            });

            if (newMessages.length > 0) {
                socket.emit('message:read', { ortherId: receiver._id, API_URL, token });
            }
        } catch (error) {
            console.error("❌ fetchMessages:", error);
        } finally {
            if (isFirstLoad) setIsLoading(false);
        }
    }, [receiver._id, token]);

    // --- INITIALISATION ---
    useEffect(() => {
        const initialize = async () => {
            try {
                const res = await axios.get(`${API_URL}/user_data`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                setCurrentUser(res.data);
                await fetchMessages(true);
            } catch (e) {
                console.error("Error initializing chat:", e);
                setIsLoading(false);
            }
        };
        
        initialize();
        
        // Polling pour les nouveaux messages
        pollIntervalRef.current = setInterval(() => fetchMessages(false), 4000);
        
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [fetchMessages, token]);

    // --- AUTO-SCROLL ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- ÉCOUTE DES NOUVEAUX MESSAGES VIA SOCKET ---
    useEffect(() => {
        const handleNewMessage = (data) => {
            console.log('Nouveau message reçu:', data);
            setMessages(prev => {
                // Éviter les doublons
                const exists = prev.some(msg => msg._id === data._id);
                if (exists) return prev;
                return [...prev, data];
            });
        };

        socket.on('newMsg', handleNewMessage);

        return () => {
            socket.off('newMsg', handleNewMessage);
        };
    }, []);

    // --- ENVOI DE MESSAGE OPTIMISÉ ---
    const sendMessage = useCallback(async (e) => {
        e?.preventDefault();
        if (!messageText.trim() || !currentUser) return;

        const content = messageText.trim();
        setMessageText("");

        // Réinitialiser la hauteur du textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const backendData = {
            participants: [currentUser.userId, receiver._id],
            receiverId: receiver._id,
            text: content
        };
        
        const metaData = {
            backendUrl: API_URL, 
            token,
        };
        
        socket.emit('sendMessage', { backendData, metaData });
        socket.emit('message', {receiverId: receiver._id});
    }, [messageText, currentUser, receiver._id, token]);

    // --- GESTION CLAVIER ---
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    }, [sendMessage]);

    // --- AUTO-RESIZE TEXTAREA ---
    const handleTextareaChange = useCallback((e) => {
        setMessageText(e.target.value);
        
        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    // --- RENDU MESSAGES ---
    const renderedMessages = useMemo(() => {
        if (messages.length === 0) return null;

        return messages.map((item, index) => {
            const isMyMessage = item.senderId === currentUser?.userId;
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            const showDate = !prevMsg || new Date(item.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
            const showAvatar = !nextMsg || nextMsg.senderId !== item.senderId;

            return (
                <MessageBubble 
                    key={item._id || index}
                    item={item} 
                    isMyMessage={isMyMessage} 
                    showAvatar={showAvatar}
                    showDate={showDate} 
                    receiver={receiver} 
                    formatTime={formatMessageTime}
                    dateText={getDateSeparatorText(item.createdAt)}
                />
            );
        });
    }, [messages, currentUser?.userId, receiver, formatMessageTime, getDateSeparatorText]);

    // --- LOADING STATE ---
    if (isLoading) {
        return (
            <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={onClose} className={styles.headerBackButton} aria-label="Retour">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                
                <div className={styles.headerInfo}>
                    {receiver?.userPP ? (
                        <img src={receiver.userPP} alt={receiver.username} className={styles.headerAvatar} />
                    ) : (
                        <div className={styles.headerAvatarPlaceholder}>
                            {receiver?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                    <div className={styles.headerText}>
                        <p className={styles.headerName}>{receiver?.username || 'Utilisateur'}</p>
                        <p className={styles.headerStatus}>
                            {receiver?.socketId ? (
                                <>
                                    <span className={styles.onlineDot}></span>
                                    En ligne
                                </>
                            ) : (
                                "Hors ligne"
                            )}
                        </p>
                    </div>
                </div>
                
                {!isMobile && (
                    <button className={styles.headerMenuButton} aria-label="Menu">
                        <FaEllipsisV />
                    </button>
                )}
            </div>

            {/* Messages Container */}
            <div className={styles.messagesContainer}>
                <div className={styles.messagesList}>
                    {messages.length === 0 ? (
                        <div className={styles.emptyMessages}>
                            <div className={styles.emptyIcon}>💬</div>
                            <p className={styles.emptyTitle}>Aucun message pour le moment</p>
                            <span className={styles.emptySubtitle}>Commencez la conversation !</span>
                        </div>
                    ) : (
                        renderedMessages
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Zone */}
            <div className={styles.inputWrapper}>
                <div className={styles.inputContainer}>
                    {!isMobile && (
                        <button className={styles.attachButton} aria-label="Joindre un fichier">
                            <FaPaperclip />
                        </button>
                    )}
                    
                    <div className={styles.textInputWrapper}>
                        <textarea
                            ref={textareaRef}
                            className={styles.textInput}
                            placeholder={isMobile ? "Message..." : "Écrivez votre message..."}
                            value={messageText}
                            onChange={handleTextareaChange}
                            onKeyPress={handleKeyPress}
                            rows={1}
                            maxLength={5000}
                        />
                    </div>

                    {!isMobile && !messageText.trim() && (
                        <button className={styles.emojiButton} aria-label="Émojis">
                            <FaSmile />
                        </button>
                    )}
                    
                    <button 
                        onClick={sendMessage} 
                        disabled={!messageText.trim()}
                        className={`${styles.sendButton} ${!messageText.trim() ? styles.sendButtonDisabled : ''}`}
                        aria-label="Envoyer"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
                
                {messageText.length > 4500 && (
                    <div className={styles.characterCount}>
                        {messageText.length}/5000
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;