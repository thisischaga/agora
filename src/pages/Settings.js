import styles from "./settings.module.css";
import { FaUserCircle, FaLock, FaBell, FaGlobe } from "react-icons/fa";

const Settings = () => {
  return (
    <div className={styles.settingsPage}>
      <h2>Paramètres</h2>

      <div className={styles.settingSection}>
        <h3>Profil</h3>
        <div className={styles.option}>
          <FaUserCircle className={styles.icon} />
          <span>Modifier le profil</span>
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>Sécurité</h3>
        <div className={styles.option}>
          <FaLock className={styles.icon} />
          <span>Changer le mot de passe</span>
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>Notifications</h3>
        <div className={styles.option}>
          <FaBell className={styles.icon} />
          <span>Préférences de notifications</span>
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>Langue & Région</h3>
        <div className={styles.option}>
          <FaGlobe className={styles.icon} />
          <span>Langue et fuseau horaire</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
