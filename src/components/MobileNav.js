import { FaHome, FaBell, FaUser, FaCommentDots, FaMapMarkedAlt } from "react-icons/fa";
import styles from "./mobileNav.module.css";
import { useNavigate } from "react-router-dom";

const MobileNav = ({ active, setActive }) => {
    const navigate = useNavigate();

    const navItems = [
        { id: "home", icon: <FaHome size={20} />, label: "Accueil" },
        { id: "students", icon: <FaMapMarkedAlt size={20} />, label: "Carte" },
        // Central generic action button could go here if needed, or just keep spacing
        { id: "messenger", icon: <FaCommentDots size={20} />, label: "Msg" },
        { id: "notifications", icon: <FaBell size={20} />, label: "Notifs" },
        { id: "profile", icon: <FaUser size={20} />, label: "Profil", link: "/profile" } // Direct link for profile likely
    ];

    const handleClick = (item) => {
        if (item.link) {
            navigate(item.link);
        } else {
            setActive(item.id);
        }
    };

    return (
        <nav className={styles.navBar}>
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`${styles.navItem} ${active === item.id ? styles.active : ''}`}
                    onClick={() => handleClick(item)}
                >
                    <div className={styles.iconWrapper}>
                        {item.icon}
                    </div>
                </button>
            ))}
        </nav>
    );
};

export default MobileNav;
