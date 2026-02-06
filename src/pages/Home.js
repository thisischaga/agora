import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Header from "../components/Header";
import Menu from "../components/Menu";
import Posts from "../components/Posts";
import ArticleEditor from "../components/ArticleEditor";
import Text from "../components/Text";
import Notifs from "../components/Notifs";
import PublishInfo from "../components/PublishInfo";
import CreateEvent from "../components/CreateEvent";
import AskQuestion from "../components/AskQuestion";

import Forums from "../components/Forums";
import Amis from "../components/Amis";
import Toast from "../components/Toast";
import MessageBox from "../components/MessageBox";
import Chat from "../components/Chat";

import styles from './home.module.css';
import socket from '../Utils/socket';
import { API_URL } from '../Utils/api';
import { 
    FaCamera, FaQuestionCircle, FaBullhorn, 
    FaCalendar, FaTimes 
} from "react-icons/fa";
import ImagePosting from "../components/ImagePosting";
import Messenger from "../components/Messenger";
import StudentMap from "../components/StudentMap";
import AppVersions from "../components/App.versions";

const Home = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // ── États principaux ──
    const [userData, setUserData] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [active, setActive] = useState('home'); // État 'home' par défaut
    const [toast, setToast] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading]= useState(false)

    // ── États UI modaux ──
    const [inText, setInText] = useState(false);
    const [inEditing, setInEditing] = useState(false);
    const [inImgPosting, setInImgPosting] = useState(false);
    const [inPublishInfo, setInPublishInfo] = useState(false);
    const [inCreateEvent, setInCreateEvent] = useState(false);
    const [inAskQuestion, setInAskQuestion] = useState(false);
    const [showMessBox, setShowMessBox] = useState(false);
    const [showPublishMenu, setShowPublishMenu] = useState(false);
    
    // ── État pour le chat ──
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [showChat, setShowChat] = useState(false);

    // ── Fonctions de navigation dans les modaux ──
    const goToEditor = () => setInEditing(true);
    const goToText = () => {
        setInText(true);
        setShowPublishMenu(false);
    };
    const goImagePosting = () => {
        setInImgPosting(true);
        setShowPublishMenu(false);
    };
    const goToPublishInfo = () => {
        setInPublishInfo(true);
        setShowPublishMenu(false);
    };
    const goToCreateEvent = () => {
        setInCreateEvent(true);
        setShowPublishMenu(false);
    };
    const goToAskQuestion = () => {
        setInAskQuestion(true);
        setShowPublishMenu(false);
    };

    const back = () => {
        setInText(false);
        setInEditing(false);
        setInImgPosting(false);
        setInPublishInfo(false);
        setInCreateEvent(false);
        setInAskQuestion(false);
        setRefresh(prev => !prev);
    };

    const togglePublishMenu = () => {
        setShowPublishMenu(!showPublishMenu);
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
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            fetch(`${API_URL}/user_data`, {
                headers: { Authorization: `Bearer${token}` },
            })
            .then(response => response.json())
            .then(data => {
                setUserData(data);
                localStorage.setItem('userId', data.userId);
                setNotifications(data.notifications || []);
            })
            .catch(error => {
                console.error(error);
                setToast("Erreur lors de la récupération des données.");
            });
        } catch (error) {
            console.error(error);
        }finally{
            setIsLoading(false)
        }
        socket.connect();

        socket.on("connect", async () => {
            try {
                await axios.post(
                    `${API_URL}/socket/getSocketId`,
                    { socketId: socket.id },
                    { headers: { Authorization: `Bearer${token}` } }
                );
                
            } catch (err) {
                console.error(err);
                setToast("Socket connection error.");
            }
        });
        
        socket.on('notif', (data) => {
            setRefresh(prev => !prev);
        });
        
        return () => {
            socket.off('notif');
            socket.disconnect();
        };
    }, [token]); // Enlevé location.pathname

    // ── États pour le responsive ──
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Choix du composant actif ──
    const renderActiveComponent = () => {
        switch(active) {
            case 'notifications':
                return (
                    <Notifs 
                        setActive={setActive}
                        active={active}
                        pp={userData.userPP}
                        userId={userData.userId} 
                        setRefresh={setRefresh} 
                        refresh={refresh} 
                    />
                );
            case 'messenger':
                return (
                    <Messenger 
                        setActive={setActive}
                        active={active}
                        pp={userData.userPP} 
                        setShowMessBox={setShowMessBox} 
                        setRefresh={setRefresh} 
                        refresh={refresh} 
                        onOpenChat={handleOpenChat}
                    />
                );
            case 'students':
                return (
                    <StudentMap 
                        setActive={setActive}
                        active={active}
                        pp={userData.userPP} 
                        userId={userData.userId} 
                        username={userData.username} 
                        setRefresh={setRefresh} 
                        refresh={refresh} 
                        onOpenChat={handleOpenChat}
                    />
                );
            case 'amis':
                return <Amis pp={userData.userPP} connectedUsers={connectedUsers} setRefresh={setRefresh} refresh={refresh} />;
            case 'appVersions':
                return <AppVersions />;
            case 'home':
            default:
                // Sur desktop, on affiche AppVersions quand on est sur l'accueil
                return isDesktop ? <AppVersions /> : null;
        }
    };

    // Vérifier si on doit afficher le feed principal (home ou aucun actif)
    // Sur desktop, le feed principal est toujours visible
    const shouldShowMainFeed = isDesktop || active === 'home';

    const handleHomeClick = () => {
        setActive('home');
    };

    return (
        <div>
            {/* Modal Text */}
            {inText && (
                <div className={styles.modalOverlay} onClick={() => setInText(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setInText(false)}>
                            <FaTimes /> Fermer
                        </button>
                        <Text back={() => setInText(false)} />
                    </div>
                </div>
            )}

            {/* Modal Image Posting */}
            {inImgPosting && (
                <div className={styles.modalOverlay} onClick={back}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <ImagePosting back={back} />
                    </div>
                </div>
            )}

            {/* Modal Publish Info */}
            {inPublishInfo && (
                <div className={styles.modalOverlay} onClick={back}>
                    <div className={styles.modalFullscreen} onClick={(e) => e.stopPropagation()}>
                        <PublishInfo back={back} />
                    </div>
                </div>
            )}

            {/* Modal Create Event */}
            {inCreateEvent && (
                <div className={styles.modalOverlay} onClick={back}>
                    <div className={styles.modalFullscreen} onClick={(e) => e.stopPropagation()}>
                        <CreateEvent back={back} />
                    </div>
                </div>
            )}

            {/* Modal Ask Question */}
            {inAskQuestion && (
                <div className={styles.modalOverlay} onClick={back}>
                    <div className={styles.modalFullscreen} onClick={(e) => e.stopPropagation()}>
                        <AskQuestion back={back} />
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
            {!(inEditing || inText || inImgPosting || inPublishInfo || inCreateEvent || inAskQuestion) && (
                <>
                    <Header 
                        pp={userData.userPP} 
                        active={active} 
                        setActive={setActive}
                        setInImgPosting={setInImgPosting}   
                        setInText={setInText}
                    />
                    <main>
                        <Menu 
                            pp={userData.userPP} 
                            active={active} 
                            setActive={setActive} 
                            setRefresh={setRefresh} 
                            refresh={refresh} 
                            onClick={handleHomeClick}
                        />

                        {/* Afficher le feed principal seulement si aucun composant spécial n'est actif */}
                        {shouldShowMainFeed && (
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
                                                onClick={togglePublishMenu}
                                                readOnly
                                            />

                                        </div>

                                        {/* Menu de publication étendu */}
                                        {showPublishMenu && (
                                            <div className={styles.publishMenu}>

                                                <button 
                                                    className={styles.publishMenuItem}
                                                    onClick={goToAskQuestion}
                                                >
                                                    <div className={styles.publishMenuIcon} style={{ backgroundColor: '#2563eb' }}>
                                                        <FaQuestionCircle />
                                                    </div>
                                                    <div className={styles.publishMenuText}>
                                                        <strong>Poser une question</strong>
                                                        <span>Obtenir des réponses</span>
                                                    </div>
                                                </button>

                                                <button 
                                                    className={styles.publishMenuItem}
                                                    onClick={goToPublishInfo}
                                                >
                                                    <div className={styles.publishMenuIcon} style={{ backgroundColor: '#f59e0b' }}>
                                                        <FaBullhorn />
                                                    </div>
                                                    <div className={styles.publishMenuText}>
                                                        <strong>Publier une info</strong>
                                                        <span>Partager une annonce</span>
                                                    </div>
                                                </button>

                                                <button 
                                                    className={styles.publishMenuItem}
                                                    onClick={goToCreateEvent}
                                                >
                                                    <div className={styles.publishMenuIcon} style={{ backgroundColor: '#06b6d4' }}>
                                                        <FaCalendar />
                                                    </div>
                                                    <div className={styles.publishMenuText}>
                                                        <strong>Créer un événement</strong>
                                                        <span>Organiser une activité</span>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Posts userId={userData.userId} setRefresh={setRefresh} refresh={refresh} />
                            </div>
                        )}

                        {toast && <Toast message={toast} />}

                        {/* Afficher le composant actif (students, messenger, etc.) */}
                        {renderActiveComponent()}

                        {showMessBox && <MessageBox setShowMessBox={setShowMessBox} />}
                    </main>
                </>
            )}
        </div>
    );
};

export default Home;