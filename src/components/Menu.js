import { FaHome, FaUserFriends, FaMap, FaCog, FaCompass, FaBookmark, FaBell, FaUser, FaCommentDots, FaHistory } from "react-icons/fa";
import { useState, useEffect } from "react";
import styles from "./menu.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const Menu = ({ pp, userData, setActive, active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );
      const screenWidth = window.innerWidth <= 768;
      setIsMobile(userAgent || screenWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Synchroniser l'état actif avec la route actuelle
  useEffect(() => {
    const path = location.pathname;
    
    // Ne pas activer automatiquement d'élément pour /home
    if (path === "/home") {
      setActive('home')
    } else if (path === "/notifications") {
      setActive("notifications");
    } else if (path === "/saved") {
      setActive("saved");
    } else if (path === "/profile" || path === "/me") {
      setActive("profile");
    } else if (path === "/settings") {
      setActive("settings");
    }
  }, [location.pathname, setActive]);

  // Menu items pour desktop
  const desktopMenuItems = [
    { 
      id: "home", 
      label: "Accueil", 
      icon: <FaHome />, 
      link: "/home",
      badge: null 
    },
    { 
      id: "students", 
      label: "Étudiants", 
      icon: <FaMap />, 
      badge: null,
      // Pas de link pour que ça ne navigue pas
    },
    { 
      id: "messenger", 
      label: "Messenger", 
      icon: <FaCommentDots />, 
      badge: null 
    },
  ];

  // Menu items pour mobile (barre du bas)
  const mobileMenuItems = [
    { 
      id: "home", 
      label: "Accueil", 
      icon: <FaHome />, 
      link: "/home",
      badge: null 
    },
    { 
      id: "students", 
      label: "Carte", 
      icon: <FaMap />, 
      badge: null,
      // Pas de link pour que ça ne navigue pas
    },
    { 
      id: "messenger", 
      label: "Messages", 
      icon: <FaCommentDots />, 
      badge: null
    },
    { 
      id: "notifications", 
      label: "Notifs", 
      icon: <FaBell />, 
      badge: notificationCount 
    },
    { 
      id: "profile", 
      label: "Profil", 
      icon: pp ? <img src={pp} alt="Profil" className={styles.profilePic} /> : <FaUser />, 
      link: "/me",
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
    { 
      id: "appVersions", 
      label: "Mises à jour", 
      icon: <FaHistory />, 
      badge: null 
    },
  ];

  const handleNavigate = (item) => {
    // Pour les éléments qui changent de vue sans navigation (students, amis, messenger)
    if (!item.link) {
      setActive(item.id);
      return;
    }
    
    // Pour les éléments avec navigation
    setActive(item.id);
    navigate(item.link);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={styles.menu}>
          <div className={styles.menuContent}>
            <nav className={styles.mainNav}>
              {desktopMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.menuItem} ${active === item.id ? styles.active : ""}`}
                  onClick={() => handleNavigate(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={item.label}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigate(item);
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigate(item);
                    }
                  }}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className={styles.mobileNav}>
          {mobileMenuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.mobileNavItem} ${active === item.id ? styles.mobileActive : ""}`}
              onClick={() => handleNavigate(item)}
              aria-label={item.label}
            >
              <span className={styles.mobileIcon}>
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className={styles.mobileBadge}>{item.badge > 9 ? '9+' : item.badge}</span>
                )}
              </span>
              <span className={styles.mobileLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
};

export default Menu;