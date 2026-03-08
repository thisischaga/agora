import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Posts from "../components/Posts";
import Text from "../components/Text";
import Notifs from "../components/Notifs";
import PublishInfo from "../components/PublishInfo";
import CreateEvent from "../components/CreateEvent";
import AskQuestion from "../components/AskQuestion";
import Amis from "../components/Amis";
import Toast from "../components/Toast";
import MessageBox from "../components/MessageBox";
import Chat from "../components/Chat";
import ImagePosting from "../components/ImagePosting";
import Messenger from "../components/Messenger";
import StudentMap from "../components/StudentMap";
import AppVersions from "../components/App.versions";
import styles from './home.module.css';
import socket from '../Utils/socket';
import { API_URL } from '../Utils/api';
import axios from "axios";
import { FaTimes, FaImage, FaCalendar, FaQuestionCircle, FaInfo, FaSmile } from "react-icons/fa";

const MODALS = {
  text: Text, imgPosting: ImagePosting,
  publishInfo: PublishInfo, createEvent: CreateEvent, askQuestion: AskQuestion
};
const FULLSCREEN = ['publishInfo', 'createEvent', 'askQuestion'];

const PUBLISH_CHOICES = [
  { icon: FaSmile,          bg: '#1d9bf0', m: 'text',        label: 'Texte',      desc: 'Partager vos pensées'           },
  { icon: FaImage,          bg: '#06b6d4', m: 'imgPosting',  label: 'Photo',       desc: 'Partager une image'             },
  { icon: FaInfo,           bg: '#45bd62', m: 'publishInfo', label: 'Information', desc: 'Publier une annonce importante' },
  { icon: FaCalendar,       bg: '#f3425f', m: 'createEvent', label: 'Événement',   desc: 'Créer un événement'             },
  { icon: FaQuestionCircle, bg: '#f59e0b', m: 'askQuestion', label: 'Question',    desc: 'Poser une question à la commu'  },
];

const Home = () => {
  const navigate = useNavigate();

  const [userData, setUserData]               = useState({});
  const [active, setActive]                   = useState('home');
  const [toast, setToast]                     = useState(null);
  const [refresh, setRefresh]                 = useState(false);
  const [modal, setModal]                     = useState(null);
  const [showPublishChoice, setShowPublishChoice] = useState(false);
  const [chat, setChat]                       = useState(null);
  const [showMessBox, setShowMessBox]         = useState(false);
  const [isMobile, setIsMobile]               = useState(() =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768
  );
  const [isDesktop, setIsDesktop]             = useState(() => window.innerWidth > 1024);

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    const check = () => {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);
      setIsDesktop(window.innerWidth > 1024);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/user_data`, { headers: { Authorization: `Bearer${token}` } })
      .then(r => r.json())
      .then(d => {
        setUserData(d);
        localStorage.setItem('userId', d.userId);
        localStorage.setItem('pp', d.userPP);
        localStorage.setItem('username', d.username);
      })
      .catch(() => setToast("Erreur lors de la récupération des données."));

    socket.connect();
    socket.on("connect", async () => {
      try { await axios.post(`${API_URL}/socket/getSocketId`, { socketId: socket.id }, { headers: { Authorization: `Bearer${token}` } }); }
      catch { setToast("Socket connection error."); }
    });
    socket.on('notif', () => setRefresh(p => !p));
    return () => { socket.off('notif'); socket.disconnect(); };
  }, [token]);

  const back      = useCallback(() => { setModal(null); setRefresh(p => !p); }, []);
  const openModal = useCallback((name) => { setShowPublishChoice(false); setModal(name); }, []);
  const openChat  = useCallback((receiver) => {
    if (isMobile) navigate(`/chat/${receiver._id}`);
    else setChat({ receiver });
  }, [isMobile, navigate]);

  const base = useMemo(() => ({
    setActive, active, pp: userData.userPP,
    userId: userData.userId, setRefresh, refresh
  }), [active, userData, refresh]);

  const renderActive = useMemo(() => {
    switch (active) {
      case 'notifications': return <Notifs {...base} />;
      case 'messenger':     return <Messenger {...base} setShowMessBox={setShowMessBox} onOpenChat={openChat} showChat={!!chat} />;
      case 'students':      return <StudentMap {...base} username={userData.username} onOpenChat={openChat} />;
      case 'amis':          return <Amis pp={userData.userPP} setRefresh={setRefresh} refresh={refresh} />;
      case 'appVersions':   return <AppVersions />;
      default:              return isDesktop ? <AppVersions /> : null;
    }
  }, [active, base, userData, chat, isDesktop, refresh, openChat]);

  const Modal = modal ? MODALS[modal] : null;

  return (
    <div>
      {/* Active modal */}
      {Modal && (
        <div className={styles.modalOverlay} onClick={back}>
          <div
            className={FULLSCREEN.includes(modal) ? styles.modalFullscreen : styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <Modal back={back} />
          </div>
        </div>
      )}

      {/* Publish choice modal */}
      {showPublishChoice && (
        <div className={styles.publishChoiceOverlay} onClick={() => setShowPublishChoice(false)}>
          <div className={styles.publishChoiceModal} onClick={e => e.stopPropagation()}>
            <div className={styles.publishChoiceHeader}>
              <h3>Que voulez-vous publier ?</h3>
              <button className={styles.publishChoiceClose} onClick={() => setShowPublishChoice(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.publishChoiceList}>
              {PUBLISH_CHOICES.map(({ icon: Icon, bg, m, label, desc }) => (
                <button key={m} className={styles.publishChoiceItem} onClick={() => openModal(m)}>
                  <div className={styles.publishChoiceIcon} style={{ background: bg }}>
                    <Icon />
                  </div>
                  <div className={styles.publishChoiceText}>
                    <strong>{label}</strong>
                    <span>{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat overlay — desktop only */}
      {!isMobile && chat && (
        <div className={styles.chatOverlay} onClick={() => setChat(null)}>
          <div className={styles.chatContainer} onClick={e => e.stopPropagation()}>
            <Chat receiver={chat.receiver} onClose={() => setChat(null)} />
          </div>
        </div>
      )}

      {!modal && (
        <>
          <Header pp={userData.userPP} active={active} setActive={setActive} />

          <main>
            <Menu
              pp={userData.userPP}
              active={active}
              setActive={setActive}
              onPublish={() => setShowPublishChoice(true)}
            />

            {(isDesktop || active === 'home') && (
              <div className={styles.postSpace}>
                <Posts userId={userData.userId} setRefresh={setRefresh} refresh={refresh} />
              </div>
            )}

            {toast && <Toast message={toast} />}
            {renderActive}
            {showMessBox && <MessageBox setShowMessBox={setShowMessBox} />}
          </main>
        </>
      )}
    </div>
  );
};

export default Home;