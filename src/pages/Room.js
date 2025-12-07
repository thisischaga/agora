import styles from './postPage.module.css';
import { FaRegThumbsUp, FaThumbsUp, FaEllipsisV, FaRegBookmark, FaRegCommentDots, FaShare } from "react-icons/fa";
import { useEffect, useState } from 'react';
import axios from 'axios';
//import { Friend } from '../components/Friend';
import { useParams } from 'react-router-dom';
import business from '../images/business.jpg';

const Room = () => {
    const {id} = useParams();
    const [room, setRoom] = useState(null);

    const token = localStorage.getItem('token');


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/room/${id}`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                setRoom(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des posts :', error);
            }
        };
        fetchPosts();
    }, [id]);
    console.log(room)
    if(!room) return <p>No room</p>;
    return (
        <div className={styles.postPage}>
            <h1>Room</h1>
        </div>
    );
};

export default Room;
