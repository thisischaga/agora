import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';
import logo from '../images/logo.png';

const Header = ({ pp, active, setActive, setInImgPosting, setInText }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogoClick = (item) => {
    setActive(item);
  };

  const handleAddClick = () => {
    setShowAddOptions(!showAddOptions);
  } 

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => handleLogoClick('home')}>
        <img src={logo} alt='agora logo' />
        <h1>agora</h1>
      </div>

      {/* Search desktop */}
      <form className={styles.searchContainer} onSubmit={handleSearch}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className={styles.searchBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span className={styles.searchBtnText}>Rechercher</span>
        </button>
      </form>

      {/* Navigation icons */}
      <nav className={styles.navIcons}>
        <button 
          className={styles.iconBtn}
          onClick={() => handleAddClick()}
          aria-label="Créer un post"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {showAddOptions && (
            <div className={styles.addOptions}>
              <button onClick={() => setInText(true)}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Publier du texte</span>
              </button>

              <button onClick={() => setInImgPosting(true)}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Partager une photo</span>
              </button>

            </div>
          )}

        </button>

        <button 
          className={styles.iconBtn}
          onClick={() => handleLogoClick('notifications')}
          aria-label="Notifications"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className={styles.notificationBadge}>3</span>
        </button>

        <button 
          className={styles.iconBtn}
          onClick={() => handleLogoClick('messenger')}
          aria-label="Messages"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        {/* Mobile search toggle */}
        <button 
          className={`${styles.iconBtn} ${styles.mobileSearchToggle}`}
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          aria-label="Rechercher"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
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

      {/* Mobile search overlay */}
      {/*isMobileSearchOpen && (
        <div className={styles.mobileSearchOverlay}>
          <form className={styles.mobileSearchForm} onSubmit={handleSearch}>
            <button 
              type="button"
              className={styles.backBtn}
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.mobileSubmitBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>
        </div>
      )*/}
    </header>
  );
};

export default Header;
