import styles from './posts.module.css';
import profile from '../images/batimat.png'
import avion from '../images/avion.png';
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
//import { FaUserCircle} from "react-icons/fa";
import { FaShare } from "react-icons/fa";
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { API_URL } from '../Utils/api';


const TextPosts = ()=>{

    const token = localStorage.getItem('token');
    
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        try {
            axios.get(`${API_URL}/posts`, {
                headers: {Authorization: `Bearer${token}`}
            })
            .then(response => 
                setPosts(response.data)
            )
            .catch(error => console.error(error)
            );

        } catch (error) {
            console.log('Erreur', error);
        };
    }, [token])

    return(
        <div className={styles.postsContainer}>
            {posts.map(post =>
            (
                <div className={post.postPicture?'hidden': styles.textPost} key={post._id}>
                    <div className={styles.container}>
                        <div className={styles.auteur}>
                            <div className={styles.profil}>
                                <img src={profile} alt="mon-profile"/>
                                <p>Thisis_cha</p>
                                <button>suivre</button>
                            </div>
                            <p>Il y a 2s</p>
                        </div>
                        <div className={styles.content}>
                            {post.postPicture && <img src={post.postPicture} alt="postPicture"/>}

                            <div dangerouslySetInnerHTML={{__html: post.post}} className={styles.contenu} />
                        </div>
                        
                        <div className={styles.postActions}>
                            <div className={styles.action}>
                                <p><FaRegThumbsUp /> 24k</p>
                            </div>
                            <div className={styles.action}>
                                <p> <FaRegCommentDots /> 12k</p>
                            </div>
                            <div className={styles.action}>
                                <p><FaShare /> 2k</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
            )}
        </div>
    );
};

export default TextPosts;