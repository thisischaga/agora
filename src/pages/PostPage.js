import styles from './postPage.module.css';

import { useEffect, useState } from 'react';
import axios from 'axios';
//import { Friend } from '../components/Friend';
import { useParams } from 'react-router-dom';
import business from '../images/business.jpg';
import { API_URL } from '../Utils/api';

const PostPage = () => {
    const {id} = useParams();
    const [post, setPost] = useState(null);

    const token = localStorage.getItem('token');


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/post/${id}`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                setPost(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des posts :', error);
            }
        };
        fetchPosts();
    }, [id]);
    console.log(post)
    if(!post) return <p>No post</p>;
    return (
        <div className={styles.postPage}>
            <div className={styles.content}>
                <div>
                    <h1> {post.title} </h1>
                    <p>Par {post.username} <span>April 15, 2024</span></p>
                    <img src={post.postPicture} alt='business'/>
                </div>
                <div>
                    <div
                        dangerouslySetInnerHTML={{ __html: post.post }}
                        className={styles.htmlContent}
                    />
                </div>
            </div>
        </div>
    );
};

export default PostPage;
