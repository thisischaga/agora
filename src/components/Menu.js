import { FaHome, FaUserFriends, FaCog, FaBell, FaEnvelope, FaPlus, FaPen } from "react-icons/fa";
import { useState, useEffect } from "react";
import styles from "./menu.module.css";
import { useNavigate } from "react-router-dom";

const Menu = ({ pp, setActive, active, onPublish }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768
  );

  useEffect(() => {
    const check = () =>
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const desktopItems = [
    { id: 'home',          label: 'Accueil',  icon: <FaHome />         },
    { id: 'messenger',     label: 'Messages', icon: <FaEnvelope />     },
    { id: 'amis',          label: 'Amis',     icon: <FaUserFriends />  },
    { id: 'notifications', label: 'Notifs',   icon: <FaBell />         },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Paramètres', icon: <FaCog />, link: '/settings' },
  ];

  const mobileItems = [
    { id: 'home',          label: 'Accueil',  icon: <FaHome />,        link: '/home'          },
    { id: 'amis',          label: 'Amis',     icon: <FaUserFriends />, link: '/friends'       },
    { id: 'messenger',     label: 'Messages', icon: <FaEnvelope />,    link: '/messenger'     },
    { id: 'notifications', label: 'Notifs',   icon: <FaBell />,        link: '/notifications' },
  ];

  const handleNav = (item) => {
    if (!setActive) return;
    if (isMobile && item.link) { navigate(item.link); }
    setActive(item.id);
  };

  const renderNavItem = (item) => (
    <div
      key={item.id}
      className={`${styles.menuItem} ${active === item.id ? styles.active : ''}`}
      onClick={() => handleNav(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleNav(item)}
    >
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.label}>{item.label}</span>
    </div>
  );

  const publishBtn = (
    <button className={styles.publishButton} onClick={onPublish} title="Publier">
      <FaPen />
      <span className={styles.publishButtonLabel}>&nbsp;Publier</span>
    </button>
  );

  if (!isMobile) return (
    <aside className={styles.menu}>
      <div className={styles.menuContent}>
        <nav className={styles.mainNav}>
          {renderNavItem(desktopItems[0])}
          {renderNavItem(desktopItems[1])}
          {renderNavItem(desktopItems[2])}
          {renderNavItem(desktopItems[3])}
          {publishBtn}
        </nav>



        <nav className={styles.bottomNav}>
          {bottomItems.map(item => (
            <div
              key={item.id}
              className={`${styles.menuItem} ${active === item.id ? styles.active : ''}`}
              onClick={() => handleNav(item)}
              role="button"
              tabIndex={0}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );

  return (
    <nav className={styles.mobileNav}>
      {mobileItems.slice(0, 2).map(item => (
        <button
          key={item.id}
          className={`${styles.mobileNavItem} ${active === item.id ? styles.mobileActive : ''}`}
          onClick={() => handleNav(item)}
        >
          <span className={styles.mobileIcon}>{item.icon}</span>
          <span className={styles.mobileLabel}>{item.label}</span>
        </button>
      ))}
      <button className={styles.mobilePublishBtn} onClick={onPublish} title="Publier">
        <FaPlus />
      </button>
      {mobileItems.slice(2).map(item => (
        <button
          key={item.id}
          className={`${styles.mobileNavItem} ${active === item.id ? styles.mobileActive : ''}`}
          onClick={() => handleNav(item)}
        >
          <span className={styles.mobileIcon}>{item.icon}</span>
          <span className={styles.mobileLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Menu;