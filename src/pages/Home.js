import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Header from "../components/Header";
import Menu from "../components/Menu";
import Posts from "../components/Posts";
import ArticleEditor from "../components/ArticleEditor";
import Text from "../components/Text";
import Notifs from "../components/Notifs";
import Messenger from "../components/Messenger";
import Forums from "../components/Forums";
import Amis from "../components/Amis";
import Toast from "../components/Toast";
import MessageBox from "../components/MessageBox";

import styles from './home.module.css';
import socket from '../Utils/socket';
import { FaCamera } from "react-icons/fa";
import ImagePosting from "../components/ImagePosting";

const Home = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // ── États principaux ──
    const [userData, setUserData] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [active, setActive] = useState('home');
    const [toast, setToast] = useState(null);
    const [refresh, setRefresh] = useState(false);

    // ── États UI modaux ──
    const [inText, setInText] = useState(false);
    const [inEditing, setInEditing] = useState(false);
    const [inImgPosting, setInImgPosting] = useState(false);
    const [showMessBox, setShowMessBox] = useState(false);

    // ── Fonctions de navigation dans les modaux ──
    const goToEditor = () => setInEditing(true);
    const goToText = () => setInText(true);
    const goImagePosting = () => setInImgPosting(true);
    const back = () => {
        setInText(false);
        setInEditing(false);
        setInImgPosting(false);
    };

    // ── Socket et récupération des données utilisateur ──
    useEffect(() => {
        socket.connect();

        socket.on("connect", async () => {
            try {
                await axios.post(
                    "http://localhost:8000/socket/getSocketId",
                    { socketId: socket.id },
                    { headers: { Authorization: `Bearer${token}` } }
                );
                const response = await axios.get("http://localhost:8000/user_data", {
                    headers: { Authorization: `Bearer${token}` },
                });
                setUserData(response.data);
                setNotifications(response.data.notifications || []);
            } catch (err) {
                console.error(err);
                setToast("Erreur lors de la récupération des données.");
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [location.pathname]);

    // ── Choix du composant actif ──
    const renderActiveComponent = () => {
        switch(active) {
            case 'home':
            case 'notifications':
                return <Notifs pp={userData.userPP} notifications={notifications} setRefresh={setRefresh} refresh={refresh} />;
            case 'messagerie':
                return <Messenger pp={userData.userPP} setShowMessBox={setShowMessBox} setRefresh={setRefresh} refresh={refresh} />;
            case 'forums':
                return <Forums pp={userData.userPP} userId={userData.userId} username={userData.username} setRefresh={setRefresh} refresh={refresh} />;
            case 'amis':
                return <Amis pp={userData.userPP} connectedUsers={connectedUsers} setRefresh={setRefresh} refresh={refresh} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Modaux */}
            {inEditing && <ArticleEditor back={() => setInEditing(false)} />}
            {inText && <Text back={() => setInText(false)} />}
            {inImgPosting && <ImagePosting back={() => setInImgPosting(false)} />}


            {/* Main UI */}
            {!(inEditing || inText || inImgPosting) && (
                <>
                    <Header />
                    <main>
                        <Menu pp={userData.userPP} active={active} setActive={setActive} setRefresh={setRefresh} refresh={refresh} />

                        <div className={styles.postSpace}>
                            {userData?.userPP && (
                                <div className={styles.userProfilBox}>
                                    <div className={styles.user}>
                                        <img src={userData.userPP} alt="mon profil" />
                                        <p>{userData.username}</p>
                                    </div>
                                    <div className={styles.actions}>
                                        <input
                                            type="text"
                                            placeholder="Exprime-toi..."
                                            onClick={goToText}
                                        />
                                        <div className={styles.iconContainer}>
                                            <div className={styles.articleBtn}>
                                                <button onClick={goToEditor}>Rédige ton article</button>
                                            </div>
                                            <div className={styles.photoBtn} onClick={goImagePosting}>
                                                <FaCamera size={22} color="#fff" />
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            )}

                            <Posts userId={userData.userId} setRefresh={setRefresh} refresh={refresh} />
                        </div>

                        {toast && <Toast message={toast} />}

                        {renderActiveComponent()}

                        {showMessBox && <MessageBox setShowMessBox={setShowMessBox} />}
                    </main>
                </>
            )}
        </div>
    );
};

export default Home;
