import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Header from "../components/Header";
import Menu from "../components/Menu";
import Posts from "../components/Posts";
import ArticleEditor from "../components/ArticleEditor";
import Text from "../components/Text";
import Notifs from "../components/Notifs";

import Forums from "../components/Forums";
import Amis from "../components/Amis";
import Toast from "../components/Toast";
import MessageBox from "../components/MessageBox";
import Chat from "../components/Chat";

import styles from './home.module.css';
import socket from '../Utils/socket';
import { API_URL } from '../Utils/api';
import { FaCamera } from "react-icons/fa";
import ImagePosting from "../components/ImagePosting";
import Messenger from "../components/Messenger";
import StudentMap from "../components/StudentMap";

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
    
    // ── État pour le chat ──
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [showChat, setShowChat] = useState(false);

    // ── Fonctions de navigation dans les modaux ──
    const goToEditor = () => setInEditing(true);
    const goToText = () => setInText(true);
    const goImagePosting = () => setInImgPosting(true);
    const back = () => {
        setInText(false);
        setInEditing(false);
        setInImgPosting(false);
    };

    // ── Fonction pour ouvrir le chat ──
    const handleOpenChat = (receiver) => {
        console.log('Ouverture du chat avec:', receiver);
        setSelectedReceiver(receiver);
        setShowChat(true);
    };

    // ── Fonction pour fermer le chat ──
    const handleCloseChat = () => {
        setShowChat(false);
        setSelectedReceiver(null);
    };

    // ── Socket et récupération des données utilisateur ──
    useEffect(() => {
        socket.connect();

        socket.on("connect", async () => {
            try {
                await axios.post(
                    `${API_URL}/socket/getSocketId`,
                    { socketId: socket.id },
                    { headers: { Authorization: `Bearer${token}` } }
                );
                const response = await axios.get(`${API_URL}/user_data`, {
                    headers: { Authorization: `Bearer${token}` },
                });
                setUserData(response.data);
                setNotifications(response.data.notifications || []);
            } catch (err) {
                console.error(err);
                setToast("Erreur lors de la récupération des données.");
            }
        });
        socket.on('notif', (data) => {
            setRefresh(prev => !prev);
        });
        return () => {
            socket.off('notif');
            socket.disconnect();
        };
    }, [location.pathname]);

    // ── Choix du composant actif ──
    const renderActiveComponent = () => {
        switch(active) {
            case 'home':
            case 'notifications':
                return <Notifs pp={userData.userPP} userId={userData.userId} setRefresh={setRefresh} refresh={refresh} />;
            case 'messenger':
                return <Messenger pp={userData.userPP} setShowMessBox={setShowMessBox} setRefresh={setRefresh} refresh={refresh} onOpenChat={handleOpenChat} />;
            case 'students':
                return <StudentMap pp={userData.userPP} userId={userData.userId} username={userData.username} setRefresh={setRefresh} refresh={refresh} onOpenChat={handleOpenChat} />;
            case 'amis':
                return <Amis pp={userData.userPP} connectedUsers={connectedUsers} setRefresh={setRefresh} refresh={refresh} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Modal Text */}
            {inText && (
                <div className={styles.modalOverlay} onClick={() => setInText(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setInText(false)}>Fermer</button>
                        <Text back={() => setInText(false)} />
                    </div>
                </div>
            )}

            {/* Modal Image Posting */}
            {inImgPosting && (
                <div className={styles.modalOverlay} onClick={() => setInImgPosting(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setInImgPosting(false)}>Fermer</button>
                        <ImagePosting back={() => setInImgPosting(false)} />
                    </div>
                </div>
            )}

            {/* Modal Chat */}
            {showChat && selectedReceiver && (
                <div className={styles.chatOverlay} onClick={handleCloseChat}>
                    <div className={styles.chatContainer} onClick={(e) => e.stopPropagation()}>
                        <Chat receiver={selectedReceiver} onClose={handleCloseChat} />
                    </div>
                </div>
            )}

            {/* Main UI */}
            {!(inEditing || inText || inImgPosting) && (
                <>
                    <Header pp={userData.userPP} 
                        active={active} setActive={setActive}
                        setInImgPosting={setInImgPosting}   setInText={setInText}/>
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
                                            {/*<div className={styles.articleBtn}>
                                                <button onClick={goToEditor}>Rédige ton article</button>
                                            </div>*/}
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
