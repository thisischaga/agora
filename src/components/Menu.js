import { FaHome, FaUserFriends, FaMap, FaCog, FaCompass, FaBookmark, FaBell, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import styles from "./menu.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const Menu = ({ pp, userData, setActive, active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(5);

  // Sync active state with current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/home") setActive("students");
    //else if (path === "/notifications") setActive("notifications");
    else if (path === "/saved") setActive("saved");
    else if (path === "/profile" || path === "/me") setActive("profile");
    else if (path === "/settings") setActive("settings");
  }, [location]);

  const menuItems = [
    { 
      id: "home", 
      label: "Accueil", 
      icon: <FaHome />, 
      link: "/home",
      badge: null 
    },
    /**{ 
      id: "explore", 
      label: "Explorer", 
      icon: <FaCompass />, 
      link: "/explore",
      badge: null 
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: <FaBell />, 
      link: "/notifications",
      badge: notificationCount 
    }, */
    { 
      id: "amis", 
      label: "Amis", 
      icon: <FaUserFriends />, 
      //link: "/amis",
      badge: null 
    },
    { 
      id: "saved", 
      label: "Enregistrés", 
      icon: <FaBookmark />, 
      link: "/saved",
      badge: null 
    },
    { 
      id: "students", 
      label: "Étudiants", 
      icon: <FaMap />, 
      //link: "/students",
      badge: null 
    },
  ];

  const bottomMenuItems = [
    { 
      id: "settings", 
      label: "Paramètres", 
      icon: <FaCog />, 
      link: "/settings",
      badge: null 
    },
  ];

  const handleNavigate = (item) => {
    setActive(item.id);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.menu}>
        <div className={styles.menuContent}>
          <nav className={styles.mainNav}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.menuItem} ${active === item.id ? styles.active : ""}`}
                onClick={() => handleNavigate(item)}
                role="button"
                tabIndex={0}
                aria-label={item.label}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </div>
            ))}
          </nav>

          <div className={styles.divider}></div>

          <nav className={styles.bottomNav}>
            {bottomMenuItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.menuItem} ${active === item.id ? styles.active : ""}`}
                onClick={() => handleNavigate(item)}
                role="button"
                tabIndex={0}
                aria-label={item.label}
              >
                {item.img ? (
                  <img src={item.img} alt="Profil" className={styles.profileImg} />
                ) : (
                  <span className={styles.icon}>{item.icon}</span>
                )}
                <span className={styles.label}>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {[
          menuItems[0], // Home
          { id: "explore", label: "Explorer", icon: <FaCompass />, link: "/explore" },
          { id: "profile", label: "Profil", icon: null, img: pp || userData?.userPP, link: "/profile" },
        ].map((item) => (
          <button
            key={item.id}
            className={`${styles.mobileNavItem} ${active === item.id ? styles.mobileActive : ""}`}
            onClick={() => handleNavigate(item)}
            aria-label={item.label}
          >
            {item.img ? (
              <img src={item.img} alt="Profil" className={styles.mobileProfileImg} />
            ) : (
              <span className={styles.mobileIcon}>{item.icon}</span>
            )}
            {item.badge && item.badge > 0 && (
              <span className={styles.mobileBadge}>{item.badge > 9 ? '9+' : item.badge}</span>
            )}
            <span className={styles.mobileLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Menu;
