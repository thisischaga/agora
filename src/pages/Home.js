//import React, { useState } from "react";
import Header from "../components/Header";
import styles from './home.module.css'
import profile from '../images/batimat.png'
import Posts from "../components/Posts";
import { useLayoutEffect, useState,} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArticleEditor from "../components/ArticleEditor";
import { FaCamera, FaEllipsisV, FaPen, FaCalendarAlt} from "react-icons/fa";
//import Text from "../components/Text";
import { useEffect } from "react";
import axios from "axios";
import Text from "../components/Text";
import ImagesPosting from "../components/ImagePosting";
import Comment from "../components/Comment";
import Login from "../authentification/Login";
import Menu from "../components/Menu";
import Notifs from "../components/Notifs";
import Messenger from "../components/Messenger";
import Forums from "../components/Forums";
import {io} from 'socket.io-client';
import Amis from "../components/Amis";
import Toast from "../components/Toast";
import MessageBox from "../components/MessageBox";




const Home = ()=>{
    //const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [socket, setSocket] = useState(null);
    
    const [userData, setUserData] = useState({});
    const [id, setId] = useState();
    const [notifications, setNotifications] = useState([]);
    const [active, setActive] = useState('home');
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [toast, setToast] = useState(null);

    const [showMessBox, setShowMessBox] = useState(false);

    const [inText, setInText] = useState(false);
    const [inEditing, setInEditing] = useState(false);
    const [inImgPosting, setInImgPosting] = useState(false);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const goToEditor = () =>{
        setInEditing(true);
    }
    const goToText = () =>{
        setInText(true);
    }
    const goImagePosting = () =>{
        setInImgPosting(true);
    }
    const goToComment = () =>{
        setShowCommentBox(true);
    }
    const back = ()=>{
        if (inText === true) {
            setInText(false);
        } else if (inEditing === true) {
            setInEditing(false);
        } else if (inImgPosting === true) {
            setInImgPosting(false);
        }
    }
    
    let newSocket;
    useEffect(() => {
        newSocket = io('http://localhost:8000', { withCredentials: true });
        setSocket(newSocket);
        
        newSocket.on('connect', async() => {
            try {
                await axios.post('http://localhost:8000/socket/getSocketId', {socketId: newSocket.id}, {
                    headers: {Authorization: `Bearer${token}`}
                })
            } catch (error) {
                console.log('Erreur', error);
            };  
            console.log('Socket connecté au serveur',);
        });
        
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchData = async ()=>{
            
            try {
                const response = await axios.get('http://localhost:8000/user_data', {
                    headers: {Authorization: `Bearer${token}`}
                })
                const data = response.data;
                setUserData(data);
                setNotifications(data.notifications)
            } catch (error) {
                setToast(error.response.data.message);
                console.log('Erreur', error);
            };  
        }
        fetchData();
        
    }, [socket, location.pathname]);
    
    return(
        <div>
            <div className={inEditing === true? 'visible':'hidden'}>
                <ArticleEditor back={() => setInEditing(false)} />
            </div>
            <div className={inText === true? 'visible':'hidden'}>
                <Text back={() => setInText(false)} />
            </div>
            <div className={inImgPosting === true? 'visible':'hidden'}>
                <ImagesPosting back={() => setInImgPosting(false)} />
            </div>
            
            <div className={inEditing === true || inText === true || inImgPosting === true? 'hidden': ''}>
                <Header/>
                <main>
                    <div >
                        <Menu pp={userData.userPP} active={active} setActive={setActive} setRefresh={setRefresh} refresh={refresh} />
                    </div>
                    <div className={styles.postSpace}>
                        
                        {userData?.userPP && (<div className={styles.userProfilBox}>
                            
                            <div className={styles.user}>
                                <img src={userData.userPP} alt="mon-profile"/>
                                <p>{userData.username}</p>
                            </div>
                            

                            <div className={styles.actions}>
                                <input type="text" name="textPost" placeholder="Exprime-toi..." onClick={goToText}/>
                                <div className={styles.iconContainer}>
                                    
                                    <div className={styles.articleBtn}>
                                        <button onClick={goToEditor}>Rédige ton article</button>
                                    </div>
                                    {/*<div ><FaCamera size={22} color="white" className={styles.actionIcon} onClick={goImagePosting}/></div>*/}
                                </div>
                            </div>
                            
                        </div>)}
                        <div >
                            <Posts userId={userData.userId} setRefresh={setRefresh} refresh={refresh}/>
                        </div>
                    </div>
                    {toast && <Toast message={toast}/>}
                    <div>
                        {active === 'home' || active === 'notifications' ? (
                        <Notifs pp={userData.userPP} notifications={notifications} />
                        ) : active === 'messagerie' ? (
                        <Messenger pp={userData.userPP} setShowMessBox={setShowMessBox} setRefresh={setRefresh} refresh={refresh} />
                        ) : active === 'forums' ? (
                        <Forums pp={userData.userPP} userId={userData.userId} username={userData.username}/>
                        ) : active === 'amis' ? (
                        <Amis pp={userData.userPP} connectedUsers={connectedUsers} setRefresh={setRefresh} refresh={refresh}/>): null}
                        {showMessBox == true && <MessageBox setShowMessBox={setShowMessBox}/>}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home;