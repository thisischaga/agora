import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';
import logo from '../images/logo.png';
import { 
  FaSearch, FaTimes, FaBell, FaEnvelope, 
  FaHome, FaUsers, FaVideo, FaStore, FaGamepad 
} from 'react-icons/fa';

const Header = ({ pp, active, setActive, setShowPublishMenu, showPublishMenu }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mémoriser les données utilisateur
  const username = useMemo(() => localStorage.getItem('username') || 'Utilisateur', []);

  // Gestionnaires optimisés avec useCallback
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleNavigation = useCallback((item) => {
    setActive(item);
    setIsMobileSearchOpen(false);
    setShowNotifications(false);
    if (item === 'home') {
      navigate('/');
    }
  }, [setActive, navigate]);

  const toggleMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(prev => !prev);
    setShowNotifications(false);
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
    setIsMobileSearchOpen(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handlePublishToggle = useCallback(() => {
    setShowPublishMenu(prev => !prev);
    setShowNotifications(false);
    setIsMobileSearchOpen(false);
  }, [setShowPublishMenu]);

  // Navigation items mémorisés
  const navItems = useMemo(() => [
    { id: 'home', icon: FaHome, label: 'Accueil', color: '#1877f2' },
    { id: 'students', icon: FaUsers, label: 'Étudiants', color: '#42b72a' },
    { id: 'messenger', icon: FaEnvelope, label: 'Messages', color: '#0084ff' },
  ], []);

  return (
    <>
      <header className={styles.header}>
        {/* Desktop & Tablet Layout */}
        <div className={styles.desktopLayout}>
          {/* Section Gauche - Logo */}
          <div className={styles.leftSection}>
            <div className={styles.logo} onClick={() => handleNavigation('home')}>
              <img src={logo} alt='agora logo' />
              <h1>agora</h1>
            </div>
          </div>
          

          {/* Section Droite - Search & Actions */}
          <div className={styles.rightSection}>
            {/* Search */}
            <form className={styles.searchContainer} onSubmit={handleSearch}>
              <div className={styles.searchWrapper}>
                <FaSearch className={styles.searchIcon} />
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
                    onClick={clearSearch}
                    aria-label="Effacer"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>

            {/* Actions */}
            <div className={styles.actions}>
              <button 
                className={`${styles.actionBtn} ${showNotifications ? styles.actionBtnActive : ''}`}
                onClick={() => handleNavigation('notifications')}
                aria-label="Notifications"
                title="Notifications"
              >
                <FaBell />
                <span className={styles.badge}>3</span>
              </button>

              <button 
                className={styles.avatarBtn}
                onClick={() => navigate('/me')}
                aria-label="Profil"
                title="Mon profil"
              >
                <img src={pp} alt={username} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={styles.mobileLayout}>
          {/* Logo Mobile */}
          <div className={styles.logoMobile} onClick={() => handleNavigation('home')}>
            <img src={logo} alt='agora' />
            <h1>agora</h1>
          </div>

          {/* Mobile Actions */}
          <div className={styles.mobileActions}>
            <button 
              className={styles.mobileSearchBtn}
              onClick={toggleMobileSearch}
              aria-label="Rechercher"
            >
              <FaSearch />
            </button>

          </div>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
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
                  onClick={clearSearch}
                  aria-label="Effacer"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <button type="submit" className={styles.mobileSubmitBtn} aria-label="Rechercher">
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;