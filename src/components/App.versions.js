import { useState, useEffect } from "react";
import axios from "axios";
import { FaDownload, FaHistory, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_URL } from '../Utils/api';
import styles from "./appVersions.module.css";

const AppVersions = () => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const response = await axios.get(`${API_URL}/app/versions`);
                setVersions(response.data);
            } catch (err) {
                // Mock data pour la démonstration
                setVersions([
                    { id: 1, version: "2.1.0", date: "03 Fév. 2026", changes: ["Mode sombre amélioré", "Optimisation des performances"], isLatest: true, link: "#" },
                    { id: 2, version: "2.0.4", date: "20 Jan. 2026", changes: ["Correction bugs mineurs"], isLatest: false, link: "#" }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchVersions();
    }, []);

    return (
        <aside className={styles.versionCont}>
            <div className={styles.header}>
                <FaHistory className={styles.titleIcon} />
                <h3>Mises à jour</h3>
            </div>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.spinner}></div>
                ) : (
                    versions.map((v) => (
                        <div key={v.id} className={`${styles.versionCard} ${v.isLatest ? styles.latest : ""}`}>
                            <div className={styles.versionTop} onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                                <div className={styles.versionInfo}>
                                    <div className={styles.versionHeader}>
                                        <span className={styles.vNumber}>v{v.version}</span>
                                        {v.isLatest && <span className={styles.latestBadge}>Dernière</span>}
                                    </div>
                                    <span className={styles.vDate}>{v.date}</span>
                                </div>
                                {expandedId === v.id ? <FaChevronUp /> : <FaChevronDown />}
                            </div>

                            {expandedId === v.id && (
                                <div className={styles.versionDetails}>
                                    <ul className={styles.changeList}>
                                        {v.changes.map((change, i) => <li key={i}>{change}</li>)}
                                    </ul>
                                    <a href={v.link} className={styles.blueBtn}>
                                        <FaDownload size={14} /> Installer l'APK
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};

export default AppVersions;