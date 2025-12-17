import { FaCalendarAlt, FaEnvelope, FaHome, FaRegBell, FaCog, FaUserFriends, FaGraduationCap, FaForumbee, FaGlobe } from "react-icons/fa";
import styles from "./menu.module.css";
import { useNavigate } from "react-router-dom";

const Menu = ({ pp, active, setActive, setRefresh, refresh }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "profile", label: "Profil", img: pp, link: "/me" }, // <-- ajoute link
    { id: "home", label: "Fil d'actualité", icon: <FaHome />, link: "/" },
    { id: "notifications", label: "Notifications", icon: <FaRegBell />, },
    { id: "amis", label: "Amis", icon: <FaUserFriends />, },
    { id: "forums", label: "Communautés", icon: <FaGlobe />,  },
    { id: "settings", label: "Paramètres", icon: <FaCog />, link: "/settings" },
  ];

  const handleOption = (item) => {
    setActive(item.id);
    setRefresh(prev => !prev);
    if (item.link) {
      navigate(item.link); // <-- redirection vers le lien
    }
  }

  return (
    <div className={styles.menu}>
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`${styles.menuItem} ${active === item.id ? styles.active : ""}`}
          onClick={() => handleOption(item)}
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
