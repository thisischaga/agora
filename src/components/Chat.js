import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import styles from "./chat.module.css";
import { API_URL } from '../Utils/api';
import socket from "../Utils/socket";
import { FaCheck, FaClock, FaEllipsisV, FaPaperclip, FaSmile } from "react-icons/fa";

/* ─── Avatar simple ──────────────────────────────────────────── */
const IGAvatar = ({ src, name, size = 40 }) => (
  <div className={styles.headerAvatarWrap} style={{ width: size, height: size }}>
    {src
      ? <img src={src} alt={name} className={styles.headerAvatar} />
      : <div className={styles.headerAvatarPlaceholder}>{name?.charAt(0).toUpperCase() || "?"}</div>
    }
  </div>
);

/* ─── MessageBubble ──────────────────────────────────────────── */
const MessageBubble = React.memo(({ item, isMyMessage, showAvatar, showDate, receiver, formatTime, dateText }) => (
  <div className={styles.messageWrapper}>
    {showDate && (
      <div className={styles.dateSeparator}>
        <span className={styles.dateSeparatorText}>{dateText}</span>
      </div>
    )}
    <div className={`${styles.messageRow} ${isMyMessage ? styles.myMessageRow : styles.otherMessageRow}`}>
      {!isMyMessage && (
        <div className={`${styles.avatarContainer} ${!showAvatar ? styles.avatarHidden : ""}`}>
          {receiver.userPP
            ? <img src={receiver.userPP} alt={receiver.username} className={styles.messageAvatar} />
            : <div className={styles.messageAvatarPlaceholder}>{receiver.username?.charAt(0).toUpperCase()}</div>
          }
        </div>
      )}

      <div className={`${styles.messageBubble} ${isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble} ${item.pending ? styles.pendingMessage : ""}`}>
        <p className={`${styles.messageText} ${isMyMessage ? styles.myMessageText : styles.otherMessageText}`}>
          {item.text || item.message}
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
            <img src={receiver.userPP} alt={receiver.username} className={styles.readMsg} />
          ) : (
            <FaCheck className={styles.iconSent} />
          )}
        </div>
      )}
    </div>
  </div>
));

/* ─── Chat ───────────────────────────────────────────────────── */
const Chat = ({ receiver, onClose }) => {
  const [messages, setMessages]       = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile]       = useState(
    () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768
  );

  const messagesEndRef = useRef(null);
  const pollRef        = useRef(null);
  const textareaRef    = useRef(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  /* ─ Mobile detection ─ */
  useEffect(() => {
    const check = () =>
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ─ Helpers ─ */
  const formatTime = useCallback((date) => {
    const d = new Date(date);
    return isNaN(d) ? "" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const getDateText = useCallback((date) => {
    const d = new Date(date);
    if (isNaN(d)) return "";
    const today     = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today)                    return "Aujourd'hui";
    if (d.toDateString() === yesterday.toDateString()) return "Hier";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }, []);

  /* ─ Fetch messages ─ */
  const fetchMessages = useCallback(async (first = false) => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/conversations/${receiver._id}`, {
        headers: { Authorization: `Bearer${token}` },
      });
      setMessages(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      if (data.length > 0)
        socket.emit("message:read", { ortherId: receiver._id, API_URL, token });
    } catch (e) {
      console.error(e);
    } finally {
      if (first) setIsLoading(false);
    }
  }, [receiver._id, token]);

  /* ─ Init ─ */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user_data`, {
          headers: { Authorization: `Bearer${token}` },
        });
        setCurrentUser(data);
        await fetchMessages(true);
      } catch (e) {
        console.error(e);
        setIsLoading(false);
      }
    })();
    pollRef.current = setInterval(() => fetchMessages(false), 4000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages, token]);

  /* ─ Socket ─ */
  useEffect(() => {
    const onNew = (data) =>
      setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, data]);
    socket.on("newMsg", onNew);
    return () => socket.off("newMsg", onNew);
  }, []);

  /* ─ Auto-scroll ─ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─ Send ─ */
  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !currentUser) return;
    const content = messageText.trim();
    setMessageText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    socket.emit("sendMessage", {
      backendData: { participants: [currentUser.userId, receiver._id], receiverId: receiver._id, text: content },
      metaData: { backendUrl: API_URL, token },
    });
    socket.emit("message", { receiverId: receiver._id });
  }, [messageText, currentUser, receiver._id, token]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
  }, [sendMessage]);

  const handleChange = useCallback((e) => {
    setMessageText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  /* ─ Rendered messages ─ */
  const renderedMessages = useMemo(() => messages.map((item, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    return (
      <MessageBubble
        key={item._id || i}
        item={item}
        isMyMessage={item.senderId === currentUser?.userId}
        showAvatar={!next || next.senderId !== item.senderId}
        showDate={!prev || new Date(item.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()}
        receiver={receiver}
        formatTime={formatTime}
        dateText={getDateText(item.createdAt)}
      />
    );
  }), [messages, currentUser?.userId, receiver, formatTime, getDateText]);

  /* ─ Loading ─ */
  if (isLoading) return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>

      {/* Header */}
      <div className={styles.header}>
        <button onClick={onClose} className={styles.headerBackButton} aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <IGAvatar src={receiver.userPP} name={receiver.username} size={44} />

        <div className={styles.headerInfo}>
          <p className={styles.headerName}>{receiver.username || "Utilisateur"}</p>
          <p className={styles.headerStatus}>
            {receiver.socketId
              ? <><span className={styles.onlineDot} />Actif maintenant</>
              : "Hors ligne"
            }
          </p>
        </div>

        {!isMobile && (
          <button className={styles.headerMenuButton} aria-label="Menu">
            <FaEllipsisV />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyTitle}>{receiver.username || "Utilisateur"}</p>
              <span className={styles.emptySubtitle}>Commencez à discuter</span>
            </div>
          ) : renderedMessages}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
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
              placeholder="Message..."
              value={messageText}
              onChange={handleChange}
              onKeyDown={handleKey}
              rows={1}
              maxLength={5000}
            />
          </div>
          {!messageText.trim() && !isMobile && (
            <button className={styles.emojiButton} aria-label="Émojis">
              <FaSmile />
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!messageText.trim()}
            className={`${styles.sendButton} ${!messageText.trim() ? styles.sendButtonDisabled : ""}`}
            aria-label="Envoyer"
          >
            Envoyer
          </button>
        </div>
        {messageText.length > 4500 && (
          <div className={styles.characterCount}>{messageText.length}/5000</div>
        )}
      </div>
    </div>
  );
};

export default Chat;