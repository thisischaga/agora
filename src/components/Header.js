import styles from './header.module.css';
import logo from '../images/logo.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} alt='app logo' />
        <h1>agora</h1>
      </div>
      <div className={styles.searchContainer}>
        <input type="text" placeholder="Rechercher..." />
        <button className={styles.searchBtn}>Rechercher</button>
      </div>
    </header>
  );
};

export default Header;
