import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import styles from "./chat.module.css";
import { API_URL } from '../Utils/api';

const AVATAR_SIZE = 32;

// --- COMPOSANT BULLE DE MESSAGE ---
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
                    {isMyMessage && (
                        <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                            className={`${styles.checkIcon} ${item.isRead ? styles.checkIconRead : ''}`}
                        >
                            {item.pending ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            ) : item.isRead ? (
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            ) : (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            )}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    </div>
));

const Chat = ({ receiver, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // --- FORMATAGE ---
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

    console.log("Rendering Chat with receiver:", receiver);

    // --- LOGIQUE API ---
    const fetchMessages = useCallback(async (isFirstLoad = false) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axios.get(`${API_URL}/conversations/${receiver._id}`, {
                headers: { Authorization: `Bearer${token}` }
            });
            const newMessages = response.data || [];
            setMessages(response.data);
            setMessages(prev => JSON.stringify(prev) !== JSON.stringify(newMessages) ? newMessages : prev);
        } catch (error) {
            console.error("❌ fetchMessages:", error);
        } finally {
            if (isFirstLoad) setIsLoading(false);
        }
    }, [receiver?._id]);

    useEffect(() => {
        const initialize = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await axios.get(`${API_URL}/user_data`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                setCurrentUser(res.data);
                await fetchMessages(true);
            } catch (e) {
                console.error("Error initializing chat:", e);
            }
        };
        initialize();
        pollIntervalRef.current = setInterval(() => fetchMessages(false), 4000);
        return () => clearInterval(pollIntervalRef.current);
    }, [fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = useCallback(async (e) => {
        e?.preventDefault();
        if (!messageText.trim() || !currentUser) return;

        const content = messageText.trim();
        const now = new Date().toISOString();
        setMessageText("");

        const optimisticId = `temp-${Date.now()}`;
        const optimisticMsg = {
            _id: optimisticId,
            message: content,
            senderId: currentUser.userId,
            createdAt: now,
            pending: true
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_URL}/messages/send`, {
                participants: [currentUser.userId, receiver._id],
                receiverId: receiver._id,
                text: content
            }, {
                headers: { Authorization: `Bearer${token}` }
            });
            setMessages(prev => prev.map(m => m._id === optimisticId ? response.data : m));
        } catch (error) {
            setMessages(prev => prev.filter(m => m._id !== optimisticId));
            setMessageText(content);
            alert("Erreur lors de l'envoi du message");
        }
    }, [messageText, currentUser, receiver?._id]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={onClose} className={styles.headerButton}>
                    <svg width="28" height="28" viewBox="0 0 20 20" fill="currentColor">
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
                    <div>
                        <p className={styles.headerName}>{receiver?.username || 'Utilisateur'}</p>
                        <p className={styles.headerStatus}>
                            {receiver?.socketId ? "En ligne" : "Hors ligne"}
                        </p>
                    </div>
                </div>
                <button className={styles.headerButton}>
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
                <div className={styles.messagesList}>
                    {messages.length === 0 ? (
                        <div className={styles.emptyMessages}>
                            <p>Aucun message pour le moment</p>
                            <span>Commencez la conversation !</span>
                        </div>
                    ) : (
                        messages.map((item, index) => {
                            const isMyMessage = item.senderId === currentUser?.userId;
                            const prevMsg = messages[index - 1];
                            const nextMsg = messages[index + 1];
                            const showDate = !prevMsg || new Date(item.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                            const showAvatar = !nextMsg || nextMsg.senderId !== item.senderId;

                            return (
                                <MessageBubble 
                                    key={item._id}
                                    item={item} 
                                    isMyMessage={isMyMessage} 
                                    showAvatar={showAvatar}
                                    showDate={showDate} 
                                    receiver={receiver} 
                                    formatTime={formatMessageTime}
                                    dateText={getDateSeparatorText(item.createdAt)}
                                />
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className={styles.inputWrapper}>
                <div className={styles.inputInner}>
                    <button className={styles.attachButton}>
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <textarea
                        className={styles.textInput}
                        placeholder="Message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <button 
                        onClick={sendMessage} 
                        disabled={!messageText.trim()}
                        className={`${styles.sendButton} ${!messageText.trim() ? styles.sendButtonDisabled : ''}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;