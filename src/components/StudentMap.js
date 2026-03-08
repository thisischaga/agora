import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./StudentMap.module.css";
import { API_URL } from "../Utils/api";
import Menu from "./Menu";

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth <= 768;

const getStatus = (socketId) =>
  socketId ? { color: "#10b981", text: "En ligne" } : { color: "#6b7280", text: "Hors ligne" };

const getInitials = (u) => u?.charAt(0).toUpperCase() || "?";

const StudentCard = ({ user, onOpenChat }) => {
  const status = getStatus(user.socketId);
  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.avatarWrap}>
          {user.userPP
            ? <img src={user.userPP} alt={user.username} className={styles.avatar} />
            : <div className={styles.avatarFallback}>{getInitials(user.username)}</div>}
          <span className={styles.dot} style={{ background: status.color }} />
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{user.username}</p>
          {user.locationName && <p className={styles.location}>{user.locationName}</p>}
          <p className={styles.status} style={{ color: status.color }}>
            {status.text}{user.distance && <span> • {user.distance} km</span>}
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={() => onOpenChat(user)} title="Message">💬</button>
        <button className={styles.btn} title="Appeler">📞</button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} title="Localiser">📍</button>
      </div>
    </div>
  );
};

const StudentMap = ({ onOpenChat, setActive, pp, active }) => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile]     = useState(isMobileDevice);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/all-users`, {
        headers: { Authorization: `Bearer${token}` }
      });
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchUsers();
    const fn = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [fetchUsers]);

  const handleOpenChat = (user) => onOpenChat?.({
    _id: user._id, username: user.username, userPP: user.userPP,
    socketId: user.socketId, locationName: user.locationName, distance: user.distance
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>À proximité</h3>
        <button className={styles.refreshBtn} onClick={() => { setRefreshing(true); fetchUsers(); }} disabled={refreshing}>
          ↻
        </button>
      </div>

      <div className={styles.legend}>
        {[["#10b981", "En ligne"], ["#6b7280", "Hors ligne"]].map(([color, label]) => (
          <div key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className={styles.center}><div className={styles.spinner} /></div>
      ) : users.length === 0 ? (
        <p className={styles.empty}>Aucun étudiant trouvé à proximité.</p>
      ) : (
        <div className={styles.list}>
          {users.map(u => <StudentCard key={u._id || u.id} user={u} onOpenChat={handleOpenChat} />)}
        </div>
      )}

      {isMobile && <Menu pp={pp} setActive={setActive} active={active} />}
    </div>
  );
};

export default StudentMap;