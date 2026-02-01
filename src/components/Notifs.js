import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import styles from './notifs.module.css';
import { API_URL } from '../Utils/api';

const Notifs = ({ refresh, setRefresh, userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/user/notifs/${userId}`, {
          headers: { Authorization: `Bearer${token}` }
        });
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications :', error);
        setError('Impossible de charger les notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, refresh, token]);

  const formatTime = useCallback((date) => {
    const now = new Date();
    const givenDate = new Date(date);
    const diffMs = now - givenDate;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    if (days < 30) return `${weeks} sem`;
    if (months < 12) return `${months} mois`;

    return `${years} an${years > 1 ? 's' : ''}`;
  }, []);

  const sortedNotifications = useMemo(() => 
    [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications]
  );

  const handleNotificationClick = useCallback((notif) => {
    // Navigation selon le type de notification
    if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    } else if (notif.userId) {
      navigate(`/profile/${notif.userId}`);
    }
  }, [navigate]);

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className={styles.notifs}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.notifs}>
        <div className={styles.error}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <div className={styles.notifs}>
        <div className={styles.empty}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>Aucune notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.notifs}>
      <div className={styles.header}>
        <h2>Notifications</h2>
        <span className={styles.badge}>{sortedNotifications.length}</span>
      </div>

      <div className={styles.notificationsList}>
        {sortedNotifications.map((notif, index) => (
          <div
            key={notif.id || notif.createdAt || index}
            className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}
            onClick={() => handleNotificationClick(notif)}
          >
            <img
              src={notif.userPP || '/default-avatar.png'}
              alt={`${notif.username} profile`}
              className={styles.pp}
              loading="lazy"
            />

            <div className={styles.content}>
              <p className={styles.message}>
                <strong>{notif.username}</strong> {notif.message}
              </p>
              <span className={styles.time}>{formatTime(notif.createdAt)}</span>
            </div>

            {!notif.read && <span className={styles.unreadDot}></span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifs;