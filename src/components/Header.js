import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';
import logo from '../images/logo.png';
import { FaCog } from 'react-icons/fa';

// Composant Icon SVG réutilisable
const Icon = ({ name, size = 20 }) => {
  const icons = {
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    add: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    notification: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    text: <><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {icons[name]}
    </svg>
  );
};

const Header = ({ pp, active, setActive, setInImgPosting, setInText }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleLogoClick = useCallback((item) => {
    setActive(item);
    setIsMobileSearchOpen(false);
    setShowAddOptions(false);
  }, [setActive]);

  const handleAddClick = useCallback(() => {
    setShowAddOptions(!showAddOptions);
  }, [showAddOptions]);

  const handlePostType = useCallback((callback) => {
    callback(true);
    setShowAddOptions(false);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setShowAddOptions(false);
  }, [isMobileSearchOpen]);

  return (
    <>
      <header className={styles.header}>
        {/* Desktop & Tablet Layout */}
        <div className={styles.desktopLayout}>
          {/* Logo */}
          <div className={styles.logo} onClick={() => handleLogoClick('home')}>
            <img src={logo} alt='agora logo' />
            <h1>agora</h1>
          </div>

          {/* Search */}
          <form className={styles.searchContainer} onSubmit={handleSearch}>
            <div className={styles.searchWrapper}>
              <Icon name="search" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher sur agora..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Rechercher"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer"
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchBtn}>
              <Icon name="search" size={18} />
              <span className={styles.searchBtnText}>Rechercher</span>
            </button>
          </form>

          {/* Navigation */}
          <nav className={styles.navIcons}>
            

            <button 
              className={styles.iconBtn}
              onClick={() => handleLogoClick('notifications')}
              aria-label="Notifications"
            >
              <Icon name="notification" size={24} />
              {/**<span className={styles.notificationBadge}>3</span> */}
            </button>

            <button 
              className={styles.iconBtn}
              onClick={() => navigate('/me')}
              aria-label="Profil"
            >
              <div className={styles.avatar}>
                <img src={pp} alt="Profile" />
              </div>
            </button>
          </nav>
        </div>

        {/* Mobile Layout */}
        <div className={styles.mobileLayout}>
          {/* Logo Mobile */}
          <div className={styles.logoMobile} onClick={() => handleLogoClick('home')}>
            <h1 className={styles.logoText}>agora</h1>
          </div>

          {/* Mobile Navigation */}
          <nav className={styles.mobileNav}>
            <button 
              className={`${styles.iconBtn} ${isMobileSearchOpen ? styles.active : ''}`}
              onClick={toggleMobileSearch}
              aria-label="Rechercher"
            >
              <Icon name={isMobileSearchOpen ? "close" : "search"} size={22} />
            </button>

            <button 
              className={styles.iconBtn}
              onClick={() => navigate('/settings')}
              aria-label="paramètres"
            >
              <FaCog size={22} />
            </button>

          </nav>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className={styles.mobileSearchOverlay}>
          <form className={styles.mobileSearchForm} onSubmit={handleSearch}>
            <button 
              type="button"
              className={styles.backBtn}
              onClick={toggleMobileSearch}
              aria-label="Retour"
            >
              <Icon name="back" size={24} />
            </button>
            <div className={styles.searchWrapper}>
              <Icon name="search" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                aria-label="Rechercher"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer"
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.mobileSubmitBtn}>
              <Icon name="search" size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;