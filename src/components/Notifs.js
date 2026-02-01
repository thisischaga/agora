import { useNavigate, useParams } from 'react-router-dom';
import styles from './notifs.module.css';
import { FaThumbsUp } from "react-icons/fa";
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

const Notifs = ({ refresh, setRefresh, userId }) => {

    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/user/notifs/${userId}`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                setNotifications(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des notifications :', error);
            }
        };
        fetchPosts();
    }, [userId, refresh]);
    console.log(notifications)
    if (notifications.length === 0) {
      return <div className={styles.notifs}><p className={styles.empty}>Aucune notification</p></div>;
    }

    const formatTime = (date) => {
      const now = new Date();
      const givenDate = new Date(date);
      const diffMs = now - givenDate;

      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(diffMs / 60000);
      const hours   = Math.floor(diffMs / 3600000);
      const days    = Math.floor(diffMs / 86400000);
      const months  = Math.floor(days / 30);
      const years   = Math.floor(days / 365);

      if (seconds < 60) return `Il y a ${seconds}s`;
      if (minutes < 60) return `Il y a ${minutes}min`;
      if (hours < 24)   return `Il y a ${hours}h`;
      if (days < 7)     return `Il y a ${days}j`;
      if (days < 30)    return `Il y a ${Math.floor(days / 7)} sem`;
      if (months < 12)  return `Il y a ${months} mois`;

      return `Il y a ${years} an${years > 1 ? 's' : ''}`;
    };

    const sortedNotifications = [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
      <div className={styles.notifs}>
        {sortedNotifications.map((notif, index) => (
          <div key={notif.id || notif.createdAt || index} className={styles.notificationItem}>
            <div className='flexRow'>
              <img
                src={notif.userPP}
                alt={`${notif.username} profile`}
                className={styles.pp}
              />

              <p className={styles.text}>
                <strong>{notif.username}</strong> {notif.message}
                <span className={styles.time}> {formatTime(notif.createdAt)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    );
};

export default Notifs;
