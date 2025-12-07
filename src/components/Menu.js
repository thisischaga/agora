import { FaCalendarAlt, FaEnvelope, FaHome, FaRegBell, FaCog, FaUserFriends, FaGraduationCap, FaForumbee } from "react-icons/fa";
import styles from "./menu.module.css";

const Menu = ({ pp, active, setActive, setRefresh, refresh }) => {
  const menuItems = [
    { id: "profile", label: "Profil", img: pp },
    { id: "home", label: "Fil d'actualité", icon: <FaHome /> },
    { id: "messagerie", label: "Messagerie", icon: <FaEnvelope /> },
    { id: "notifications", label: "Notifications", icon: <FaRegBell /> },
    { id: "amis", label: "Amis", icon: <FaUserFriends /> },
    //{ id: "evenement", label: "Évènements", icon: <FaCalendarAlt /> },
    { id: "forums", label: "Forums", icon: <FaForumbee /> },
    { id: "settings", label: "Paramètres", icon: <FaCog /> },
  ];
  const handleOption = (itemId)=>{
    setActive(itemId);
    setRefresh(prev => !prev);
  }
  return (
    <div className={styles.menu}>
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`${styles.menuItem} ${active === item.id ? styles.active : ""}`}
          onClick={() =>{handleOption(item.id)}}
        >
          {item.img ? (
            <img src={item.img} alt="Profil" className={styles.profileImg} />
          ) : (
            <span className={styles.icon}>{item.icon}</span>
          )}
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Menu;
