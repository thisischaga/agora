import styles from './notifs.module.css';
import { FaThumbsUp } from "react-icons/fa";

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

const Notifs = ({ notifications = [] }) => {
  if (!notifications.length) {
    return <p className={styles.empty}>Aucune notification</p>;
  }

  return (
    <div className={styles.notifs}>
      {notifications.map((notif, index) => (
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
