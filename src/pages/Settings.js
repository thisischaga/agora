import { useState } from "react";
import styles from "./settings.module.css";
import { FaUserCircle, FaLock, FaBell, FaGlobe } from "react-icons/fa";

const Settings = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return (
    <div className={styles.settingsPage}>
      <h2>Paramètres</h2>

      {/* Profil */}
      <div className={styles.settingSection}>
        <h3>Profil</h3>
        <div className={styles.option} onClick={() => openModal("profile")}>
          <FaUserCircle className={styles.icon} />
          <span>Modifier le profil</span>
        </div>
      </div>

      {/* Sécurité */}
      <div className={styles.settingSection}>
        <h3>Sécurité</h3>
        <div className={styles.option} onClick={() => openModal("security")}>
          <FaLock className={styles.icon} />
          <span>Changer le mot de passe</span>
        </div>
      </div>

      {/* Notifications */}
      <div className={styles.settingSection}>
        <h3>Notifications</h3>
        <div className={styles.option} onClick={() => openModal("notifications")}>
          <FaBell className={styles.icon} />
          <span>Préférences de notifications</span>
        </div>
      </div>

      {/* Langue */}
      <div className={styles.settingSection}>
        <h3>Langue & Région</h3>
        <div className={styles.option} onClick={() => openModal("language")}>
          <FaGlobe className={styles.icon} />
          <span>Langue et fuseau horaire</span>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {activeModal === "profile" && (
              <>
                <h3>Modifier le profil</h3>
                <p>Changez votre photo de profil, nom et bio ici.</p>
              </>
            )}
            {activeModal === "security" && (
              <>
                <h3>Changer le mot de passe</h3>
                <p>Modifiez votre mot de passe pour sécuriser votre compte.</p>
              </>
            )}
            {activeModal === "notifications" && (
              <>
                <h3>Notifications</h3>
                <p>Activez ou désactivez les notifications par email ou push.</p>
              </>
            )}
            {activeModal === "language" && (
              <>
                <h3>Langue & Fuseau horaire</h3>
                <p>Sélectionnez votre langue préférée et votre fuseau horaire.</p>
              </>
            )}
            <button className={styles.closeBtn} onClick={closeModal}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
