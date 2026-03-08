import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';
import logo from '../images/logo.png';
import { FaSearch, FaTimes, FaBell, FaHome, FaUsers, FaEnvelope } from 'react-icons/fa';


const Header = ({ pp, active, setActive, setShowPublishMenu }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);
  const username = localStorage.getItem('username') || 'Utilisateur';
  const [isMobile, setIsMobile] = useState(null);

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

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setMobileSearch(false);
  }, [searchQuery, navigate]);

  const handleNav = useCallback((id) => {
    setActive(id);
    setMobileSearch(false);
    if (id === 'home') navigate('/');
  }, [setActive, navigate]);

  const SearchInput = () => (
    <form className={styles.searchContainer} onSubmit={handleSearch}>
      <FaSearch className={styles.searchIcon} />
      <input
        type="text"
        placeholder="Rechercher sur agora..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus={mobileSearch}
        aria-label="Rechercher"
      />
      {searchQuery && (
        <button type="button" onClick={() => setSearchQuery('')} aria-label="Effacer">
          <FaTimes />
        </button>
      )}
    </form>
  );

  return (
    <>
      <header className={styles.header}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => handleNav('home')}>
          <h2>agora</h2>
        </div>

        {/* Search - caché sur mobile */}
        <div className={styles.searchDesktop}>
          <SearchInput />
        </div>



        {/* Actions droite */}
        <div className={styles.actions}>
          {/* Search mobile */}
          <button className={styles.mobileOnly} onClick={() => setMobileSearch(v => !v)} aria-label="Rechercher">
            <FaSearch />
          </button>

          
          <button className={styles.avatarBtn} onClick={() => navigate('/me')} aria-label="Profil">
            <img src={pp} alt={username} />
          </button>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearch && (
        <div className={styles.mobileSearchOverlay}>
          <button onClick={() => setMobileSearch(false)} aria-label="Retour">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <SearchInput />
        </div>
      )}
    </>
  );
};

export default Header;