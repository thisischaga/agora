import styles from './room.module.css'
import { FaImage, FaVideo } from "react-icons/fa"
import { useEffect, useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import socket from '../Utils/socket'
import { encryptData, decryptData } from '../Utils/CryptData'
import { API_URL } from '../Utils/api'

const API_BASE_URL = API_URL

const Room = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const [room, setRoom] = useState(null)
    const [image, setImage] = useState(null)
    const [toast, setToast] = useState(null)
    const [userData, setUserData] = useState(null)
    const [content, setContent] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSending, setIsSending] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([])

    const secretKeyRef = useRef(null)
    const messagesEndRef = useRef(null)
    const [, forceUpdate] = useState(0)

    useEffect(() => {
        if (!token) {
            navigate('/login')
        }
    }, [token, navigate])

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [token])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    const formatTime = useCallback((date) => {
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
    }, [])

    const handleImgChange = useCallback((e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            setToast('Image trop volumineuse (max 5MB)')
            return
        }

        if (!file.type.startsWith('image/')) {
            setToast('Format de fichier invalide')
            return
        }

        const reader = new FileReader()
        reader.onload = () => setImage(reader.result)
        reader.onerror = () => setToast('Erreur lors de la lecture du fichier')
        reader.readAsDataURL(file)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate(v => v + 1)
        }, 30000)
        return () => clearInterval(interval)
    }, [interval])

    useEffect(() => {
        if (!token || !id) return

        socket.connect()
        setIsLoading(true)

        const fetchData = async () => {
            try {
                const roomRes = await axios.get(
                    `${API_BASE_URL}/room/${id}`,
                    { 
                        headers: { Authorization: `Bearer${token}` },
                        timeout: 10000
                    }
                )

                setRoom(roomRes.data)

                if (roomRes.data.secretKey) {
                    secretKeyRef.current = roomRes.data.secretKey
                }

                const userRes = await axios.get(
                    `${API_BASE_URL}/user_data`,
                    { 
                        headers: { Authorization: `Bearer${token}` },
                        timeout: 10000
                    }
                )
                
                setUserData(userRes.data)
                socket.emit('newUser', { 
                    username: userRes.data.username, 
                    roomId: id 
                })

                setIsLoading(false)
            } catch (err) {
                console.error('Erreur lors du chargement:', err)
                setError(err.response?.data?.message || 'Erreur de chargement')
                setIsLoading(false)
                
                if (err.response?.status === 401) {
                    localStorage.removeItem('token')
                    navigate('/login')
                }
            }
        }

        fetchData()

        socket.emit('join', id)

        const handleNewUser = (data) => setToast(data)
        const handleNewMessage = (msg) => setMessages(prev => [...prev, msg])
        const handleQuitRoom = (data) => setToast(data)

        socket.on('newUser', handleNewUser)
        socket.on('updateOnlineUsers', (data) => {
            setOnlineUsers(data);
        })
        socket.on('newMessage', handleNewMessage)
        socket.on('newMessageAll', handleNewMessage)
        socket.on('quitRoom', handleQuitRoom)

        return () => {
            if (userData?.username) {
                socket.emit('quitRoom', { 
                    username: userData.username,
                    roomId: id
                })
            }
            socket.off('newUser', handleNewUser)
            socket.off('newMessage', handleNewMessage)
            socket.off('newMessageAll', handleNewMessage)
            socket.off('quitRoom', handleQuitRoom)
            socket.disconnect()
        }
    }, [id, token, navigate])

    const sendMessage = useCallback(async () => {
        if ((!content.trim() && !image) || !secretKeyRef.current || isSending) return

        setIsSending(true)

        try {
            const encryptedContent = content ? encryptData(content, secretKeyRef.current) : '';
            const encryptedImg = image ? encryptData(image, secretKeyRef.current) : null;
            
            socket.emit('sendMessage', {
                roomId: id,
                userId: userData?.userId,
                content: encryptedContent,
                image: encryptedImg, // Envoyer l'image chiffrée
                token
            })

            setContent('')
            setImage(null)
        } catch (err) {
            console.error('Erreur lors de l\'envoi:', err)
            setToast('Échec de l\'envoi du message')
        } finally {
            setIsSending(false)
        }
    }, [content, image, id, userData?.userId, token, isSending])

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }, [sendMessage])


    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Chargement de la room...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>Erreur : {error}</p>
                <button onClick={() => navigate('/rooms')}>
                    Retour aux rooms
                </button>
            </div>
        )
    }

    if (!room) return null

    return (
        <div className={styles.room}>
            <header className={styles.header}>
                <div className={styles.metaData}>
                    <img 
                        src={room.roomPP} 
                        alt={`Photo de ${room.name}`}
                        onError={(e) => {
                            e.target.src = '/default-room.png'
                        }}
                    />
                    <div className={styles.headerText}>
                        <h2>{room.name}</h2>
                        <p>
                            <span>{onlineUsers.length || 0} membres en ligne</span>
                        </p>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    <button 
                        className={styles.videoBtn}
                        aria-label="Appel vidéo"
                        onClick={() => setToast('Fonctionnalité à venir')}
                    >
                        <FaVideo size={18} />
                    </button>
                </div>
            </header>

            {toast && <Toast message={toast} setToast={setToast} />}

            <div className={styles.messagesWrapper}>
                <div className={styles.container}>
                    {messages.length === 0 ? (
                        <p className={styles.noRecentDiss}>
                            <span>Aucune discussion récente</span>
                        </p>
                    ) : (
                        messages.map((mess, index) => (
                            <div
                                key={mess._id || `${mess.createdAt}-${index}`}
                                className={
                                    mess.sender.userId === userData?.userId
                                        ? styles.meMess
                                        : styles.allMess
                                }
                            >
                                <div className={styles.author}>
                                    <img 
                                        src={mess.sender.userPP} 
                                        alt={`Photo de ${mess.sender.username}`}
                                        onError={(e) => {
                                            e.target.src = '/default-avatar.png'
                                        }}
                                    />
                                    <p className={styles.flexP}>
                                        <strong>
                                            {mess.sender.userId === userData?.userId
                                                ? 'Vous'
                                                : mess.sender.username}
                                        </strong>
                                        <span className={styles.time}>
                                            {formatTime(mess.createdAt)}
                                        </span>
                                    </p>
                                </div>
                                {mess.content && (
                                    <p className={styles.messageContent}>
                                        {secretKeyRef.current 
                                            ? decryptData(mess.content, secretKeyRef.current)
                                            : 'Message chiffré'}
                                    </p>
                                )}
                                {mess.image && (
                                    <img
                                        className={styles.messageImage}
                                        src={decryptData(mess.image, secretKeyRef.current)}
                                        alt="image"
                                        loading="lazy"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className={styles.tools}>
                {image && (
                    <div className={styles.imagePreview}>
                        <img src={image} alt="Preview" />
                        <button 
                            onClick={() => setImage(null)}
                            aria-label="Supprimer l'image"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                <div className={styles.toolsContent}>
                    <label 
                        htmlFor="fileInput" 
                        className={styles.imgLabel}
                        aria-label="Ajouter une image"
                    >
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
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                        aria-label="Message"
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={(!content.trim() && !image) || isSending}
                    >
                        {isSending ? 'Envoi...' : 'Envoyer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Room