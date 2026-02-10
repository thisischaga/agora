import { useState, useEffect, useCallback, useMemo } from "react";
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
    FaImage, FaQuestionCircle, FaBullhorn, 
    FaCalendar, FaTimes, FaVideo, FaSmile, FaMapMarkerAlt, 
    FaInfo
} from "react-icons/fa";
import ImagePosting from "../components/ImagePosting";
import Messenger from "../components/Messenger";
import StudentMap from "../components/StudentMap";
import AppVersions from "../components/App.versions";

const Home = () => {
    const location = useLocation();
    
    // ── États principaux ──
    const [userData, setUserData] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [active, setActive] = useState('home');
    const [toast, setToast] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    // Token mémorisé
    const token = useMemo(() => localStorage.getItem('token'), []);

    // ── Fonctions de navigation dans les modaux - optimisées ──
    const goToEditor = useCallback(() => setInEditing(true), []);
    
    const goToText = useCallback(() => {
        setInText(true);
        setShowPublishMenu(false);
    }, []);
    
    const goImagePosting = useCallback(() => {
        setInImgPosting(true);
        setShowPublishMenu(false);
    }, []);
    
    const goToPublishInfo = useCallback(() => {
        setInPublishInfo(true);
        setShowPublishMenu(false);
    }, []);
    
    const goToCreateEvent = useCallback(() => {
        setInCreateEvent(true);
        setShowPublishMenu(false);
    }, []);
    
    const goToAskQuestion = useCallback(() => {
        setInAskQuestion(true);
        setShowPublishMenu(false);
    }, []);

    const back = useCallback(() => {
        setInText(false);
        setInEditing(false);
        setInImgPosting(false);
        setInPublishInfo(false);
        setInCreateEvent(false);
        setInAskQuestion(false);
        setRefresh(prev => !prev);
    }, []);

    const togglePublishMenu = useCallback(() => {
        setShowPublishMenu(prev => !prev);
    }, []);

    // ── Fonction pour ouvrir le chat ──
    const handleOpenChat = useCallback((receiver) => {
        console.log('Ouverture du chat avec:', receiver);
        setSelectedReceiver(receiver);
        setShowChat(true);
    }, []);

    // ── Fonction pour fermer le chat ──
    const handleCloseChat = useCallback(() => {
        setShowChat(false);
        setSelectedReceiver(null);
    }, []);

    // ── Socket et récupération des données utilisateur ──
    useEffect(() => {
        setIsLoading(true);
        
        fetch(`${API_URL}/user_data`, {
            headers: { Authorization: `Bearer${token}` },
        })
        .then(response => response.json())
        .then(data => {
            setUserData(data);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('pp', data.userPP);
            localStorage.setItem('username', data.username);
            setNotifications(data.notifications || []);
        })
        .catch(error => {
            console.error(error);
            setToast("Erreur lors de la récupération des données.");
        })
        .finally(() => {
            setIsLoading(false);
        });

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
        
        socket.on('notif', () => {
            setRefresh(prev => !prev);
        });
        
        return () => {
            socket.off('notif');
            socket.disconnect();
        };
    }, [token]);

    // ── États pour le responsive ──
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Choix du composant actif - mémorisé ──
    const renderActiveComponent = useMemo(() => {
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
                        showChat={showChat}
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
                return isDesktop ? <AppVersions /> : null;
        }
    }, [active, userData, connectedUsers, refresh, handleOpenChat, showChat, isDesktop]);

    // Vérifier si on doit afficher le feed principal
    const shouldShowMainFeed = isDesktop || active === 'home';

    const handleHomeClick = useCallback(() => {
        setActive('home');
    }, []);

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
                        setShowPublishMenu={setShowPublishMenu}
                        showPublishMenu={showPublishMenu}
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

                        {/* Afficher le feed principal */}
                        {shouldShowMainFeed && (
                            <div className={styles.postSpace}>
                                {userData?.userPP && (
                                    <div className={styles.userProfilBox}>
                                        {/* Section Profil */}
                                        <div className={styles.createPostSection}>
                                            <img 
                                                src={userData.userPP} 
                                                alt="mon profil"
                                                className={styles.userAvatar}
                                            />
                                            <input
                                                type="text"
                                                placeholder={`C'est quoi l'actualité, ${userData.username?.split(' ')[0]} ?`}
                                                onClick={goToPublishInfo}
                                                readOnly
                                                className={styles.createPostInput}
                                            />
                                        </div>

                                        <div className={styles.divider}></div>

                                        {/* Boutons d'actions style Facebook */}
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={styles.actionButton}
                                                onClick={goToPublishInfo}
                                            >
                                                <FaInfo className={styles.actionButtonIcon} style={{ color: '#45bd62' }} />
                                                <span>Information</span>
                                            </button>

                                            <button 
                                                className={styles.actionButton}
                                                onClick={goToCreateEvent}
                                            >
                                                <FaCalendar className={styles.actionButtonIcon} style={{ color: '#f3425f' }} />
                                                <span>Événement</span>
                                            </button>

                                            <button 
                                                className={styles.actionButton}
                                                onClick={goToAskQuestion}
                                            >
                                                <FaQuestionCircle className={styles.actionButtonIcon} style={{ color: '#1877f2' }} />
                                                <span>Question</span>
                                            </button>
                                        </div>

                                        {/* Menu étendu si ouvert */}
                                        {showPublishMenu && (
                                            <div className={styles.extendedMenu}>
                                                <div className={styles.divider}></div>
                                                <div className={styles.publishMenu}>
                                                    <button 
                                                        className={styles.publishMenuItem}
                                                        onClick={goToPublishInfo}
                                                    >
                                                        <div className={styles.publishMenuIcon} style={{ backgroundColor: '#f59e0b' }}>
                                                            <FaBullhorn />
                                                        </div>
                                                        <div className={styles.publishMenuText}>
                                                            <strong>Publier une info</strong>
                                                            <span>Partager une annonce importante</span>
                                                        </div>
                                                    </button>

                                                    <button 
                                                        className={styles.publishMenuItem}
                                                        onClick={goToText}
                                                    >
                                                        <div className={styles.publishMenuIcon} style={{ backgroundColor: '#06b6d4' }}>
                                                            <FaSmile />
                                                        </div>
                                                        <div className={styles.publishMenuText}>
                                                            <strong>Statut</strong>
                                                            <span>Partager vos pensées</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Posts userId={userData.userId} setRefresh={setRefresh} refresh={refresh} />
                            </div>
                        )}

                        {toast && <Toast message={toast} />}

                        {/* Afficher le composant actif */}
                        {renderActiveComponent}

                        {showMessBox && <MessageBox setShowMessBox={setShowMessBox} />}
                    </main>
                </>
            )}
        </div>
    );
};

export default Home;