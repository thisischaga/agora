import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import styles from './notifs.module.css';
import { API_URL } from '../Utils/api';
import Menu from './Menu';

const Notifs = ({ refresh, setRefresh, userId, pp, active, setActive }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const token = useMemo(() => localStorage.getItem('token'), []);
  const notificationsEndRef = useRef(null);

  // Responsive detection optimisé
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );
      setIsMobile(userAgent || window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications optimisé
  const fetchNotifications = useCallback(async () => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/user/notifs/${userId}`, {
        headers: { Authorization: `Bearer${token}` }
      });
      
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Erreur notifications:', error);
      setError(error.response?.data?.message || 'Erreur de chargement');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Effet de chargement
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, refresh]);

  // Auto-scroll vers le bas
  useEffect(() => {
    notificationsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notifications]);

  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Notifications triées et filtrées
  const processedNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(notif => ({
        ...notif,
        unread: !notif.read
      }));
  }, [notifications]);

  const unreadCount = useMemo(() => 
    processedNotifications.filter(n => n.unread).length, 
    [processedNotifications]
  );

  const handleNotificationClick = useCallback(async (notif) => {
    if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    } else if (notif.userId) {
      navigate(`/profile/${notif.userId}`);
    }

    try {
      await axios.put(`${API_URL}/notifications/read`, { notifId: notif._id }, {
        headers: { Authorization: `Bearer${token}` }
      });

    } catch (error) {
      console.error('Erreur markAsRead:', error);
    }
  }, [navigate]);

  const markAllAsRead = useCallback(async () => {
    if (markingAllRead || unreadCount === 0) return;

    setMarkingAllRead(true);
    try {
      const unreadIds = notifications
        .filter(n => !(n.read))
        .map(n => n.id || n._id);

      if (unreadIds.length > 0) {
        await axios.put(`${API_URL}/notifications/read-all`, { notifIds: unreadIds }, {
          headers: { Authorization: `Bearer${token}` }
        });
        
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Erreur markAllAsRead:', error);
    } finally {
      setMarkingAllRead(false);
    }
  }, [notifications, token, unreadCount, markingAllRead]);

  const refreshNotifications = useCallback(() => {
    setRefresh?.(Date.now());
  }, [setRefresh]);

  // États d'affichage
  if (loading) {
    return (
      <div className={`${styles.notifs} ${styles.loadingState}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des notifications...</p>
        </div>
        {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.notifs} ${styles.errorState}`}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchNotifications}>
            Réessayer
          </button>
        </div>
        {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.notifs} ${styles.ready}`}>
        {/* Header amélioré */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Notifications</h2>
            <span className={styles.badge}>{unreadCount}</span>
          </div>
          {unreadCount > 0 && (
            <button 
              className={styles.markAllBtn} 
              onClick={markAllAsRead}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <>
                  <span className={styles.spinnerSmall}></span>
                  Marque...
                </>
              ) : (
                'Tout marquer'
              )}
            </button>
          )}
          <button className={styles.refreshBtn} onClick={refreshNotifications}>
            ⟳
          </button>
        </div>

        {/* Liste des notifications */}
        <div className={styles.notificationsList}>
          {processedNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <h3 className={styles.emptyTitle}>Aucune notification</h3>
              <p className={styles.emptySubtitle}>
                Vous serez notifié ici dès qu'il y aura du nouveau
              </p>
            </div>
          ) : (
            <>
              {processedNotifications.map((notif, index) => (
                <div
                  key={`${notif.id || notif._id}-${index}`}
                  className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNotificationClick(notif);
                    }
                  }}
                >
                  <img
                    src={notif.userPP || '/default-avatar.png'}
                    alt={`${notif.username}'s profile`}
                    className={styles.pp}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${notif.username}&size=64&background=f3f4f6&color=6b7280`;
                    }}
                  />

                  <div className={styles.content}>
                    <div className={styles.messageContainer}>
                      <p className={styles.message}>
                        <strong className={styles.username}>{notif.username}</strong>
                        <span className={styles.text}> {notif.message}</span>
                      </p>
                      <span className={styles.time}>{formatTime(notif.createdAt)}</span>
                    </div>
                  </div>

                  {!notif.isRead && <span className={styles.unreadDot} />}
                </div>
              ))}
              <div ref={notificationsEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {isMobile && <Menu pp={pp} active={active} setActive={setActive}/>}
    </>
  );
};

export default Notifs;
