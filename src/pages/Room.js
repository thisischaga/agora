import styles from './room.module.css'
import { FaImage, FaVideo } from "react-icons/fa"
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import Toast from '../components/Toast'
import socket from '../Utils/socket'

const Room = () => {
    const { id } = useParams()
    const token = localStorage.getItem('token')

    const [room, setRoom] = useState(null)
    const [image, setImage] = useState(null)
    const [toast, setToast] = useState(null)
    const [userData, setUserData] = useState(null)
    const [content, setContent] = useState('')
    const [messages, setMessages] = useState([])
    const [, forceUpdate] = useState(0)

    const formatTime = (date) => {
        const diff = Date.now() - new Date(date).getTime()
        const sec = Math.floor(diff / 1000)
        if (sec < 60) return `Il y a ${sec}s`
        const min = Math.floor(sec / 60)
        if (min < 60) return `Il y a ${min} min`
        const h = Math.floor(min / 60)
        if (h < 24) return `Il y a ${h} h`
        const j = Math.floor(h / 24)
        if (j < 7) return `Il y a ${j} j`
        const sem = Math.floor(j / 7)
        if (j < 30) return `Il y a ${sem} sem`
        const mois = Math.floor(j / 30)
        if (mois < 12) return `Il y a ${mois} mois`
        const ans = Math.floor(j / 365)
        return `Il y a ${ans} an${ans > 1 ? 's' : ''}`
    }

    const handleImgChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setImage(reader.result)
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate(v => v + 1)
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        socket.connect()

        const fetchData = async () => {
            try {
                const roomRes = await axios.get(
                    `http://localhost:8000/room/${id}`,
                    { headers: { Authorization: `Bearer${token}` } }
                )
                setRoom(roomRes.data)
            } catch {
                setToast('Erreur room')
            }

            try {
                const userRes = await axios.get(
                    'http://localhost:8000/user_data',
                    { headers: { Authorization: `Bearer${token}` } }
                )
                setUserData(userRes.data)
                socket.emit('newUser', userRes.data.username)
            } catch {
                setToast('Erreur user')
            }
        }

        fetchData()

        socket.on('newUser', setToast)
        socket.on('newMessage', msg => setMessages(p => [...p, msg]))
        socket.on('newMessageAll', msg => setMessages(p => [...p, msg]))
        socket.on('quitRoom', setToast)

        setToast('Vous avez rejoint le chat')

        return () => {
            socket.emit('quitRoom', userData?.username)
            socket.off('newUser')
            socket.off('newMessage')
            socket.off('newMessageAll')
            socket.off('quitRoom')
            socket.disconnect()
        }
    }, [id])

    const sendMessage = () => {
        if (!content.trim()) return
        socket.emit('sendMessage', {
            roomId: id,
            userId: userData?.userId,
            content,
            token
        })
        setContent('')
    }

    if (!room) return <p>Chargement...</p>

    return (
        <div className={styles.room}>
            
            <header className={styles.header}>
                <div className={styles.metaData}>
                    <img src={room.roomPP} alt="room" />
                    <div className={styles.headerText}>
                        <h2>{room.name}</h2>
                        <p><span>15 membres en ligne</span></p>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    <button className={styles.videoBtn}>
                        <FaVideo size={18} />
                    </button>
                </div>
            </header>


            <main>
                {toast && <Toast message={toast} setToast={setToast} />}

                <div className={styles.container}>
                    {messages.length === 0 && (
                        <p className={styles.noRecentDiss}><span>Aucune discussion récente</span></p>
                    )}

                    {messages.map(mess => (
                        <div
                            key={mess._id || mess.createdAt}
                            className={
                                mess.sender.userId === userData?.userId
                                    ? styles.meMess
                                    : styles.allMess
                            }
                        >
                            <div className={styles.author}>
                                <img src={mess.sender.userPP} alt="profil" />
                                <p className={styles.flexP}>
                                    <strong>
                                        {mess.sender.userId === userData?.userId ? 'Vous' : mess.sender.username}
                                    </strong>
                                    <span className={styles.time}>
                                        {formatTime(mess.createdAt)}
                                    </span>
                                </p>
                            </div>
                            <p>{mess.content}</p>
                        </div>
                    ))}
                </div>
            </main>

            <div className={styles.tools}>
                <div className={styles.toolsContent}>
                    <label htmlFor="fileInput" className={styles.imgLabel}>
                        <FaImage size={22} />
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleImgChange}
                        hidden
                    />
                    <textarea
                        placeholder="Votre message..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    <button onClick={sendMessage}>Envoyer</button>
                </div>
            </div>
        </div>
    )
}

export default Room
