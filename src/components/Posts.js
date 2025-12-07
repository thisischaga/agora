import styles from './posts.module.css';
import { FaRegThumbsUp, FaThumbsUp, FaEllipsisV, FaRegBookmark, FaRegCommentDots, FaShare } from "react-icons/fa";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Friend } from './Friend';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const Posts = ({ userId, setRefresh, refresh }) => {
    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem('token');

    const manageTime = (postDate) => {
    const now = new Date();
    const givenDate = new Date(postDate);
    const diffMs = now - givenDate;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return <p>Il y a {seconds}s <FaEllipsisV /></p>;
    if (minutes < 60) return <p>Il y a {minutes}min <FaEllipsisV /></p>;
    if (hours < 24) return <p>Il y a {hours}h <FaEllipsisV /></p>;
    if (days < 7) return <p>Il y a {days}j <FaEllipsisV /></p>;
    if (days < 30) return <p>Il y a {Math.floor(days / 7)} sem <FaEllipsisV /></p>;
    if (months < 12) return <p>Il y a {months} mois <FaEllipsisV /></p>;
    return <p>Il y a {years} an{years > 1 ? 's' : ''} <FaEllipsisV /></p>;
};



    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/posts', {
                    headers: { Authorization: `Bearer${token}` }
                });
                setPosts(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des posts :', error);
            }
        };
        fetchPosts();
    }, [refresh, token]);

    const handleLike = async (postId, authorId) => {
        try {
            const response = await axios.put(
                'http://localhost:8000/post/like',
                { postId, authorId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            const updatedLikes = response.data.likes;
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId ? { ...post, postLike: updatedLikes } : post
                )
            );
            setToast(response.data.message);
        } catch (error) {
            setToast(error.response.data.message);
            console.error('Erreur lors du like :', error);
        }
    };

    const handleComment = async (authorId) => {
        if (!textContent.trim()) return;
        setIsLoading(true);
        try {
            const response = await axios.put(
                'http://localhost:8000/post/comment',
                { commentary: textContent, currentPostId: selectedPostId, userId, authorId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            const updatedComment = response.data.commentaires;
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === selectedPostId
                        ? { ...post, postComment: updatedComment }
                        : post
                )
            );
            setToast(response.data.message);
        } catch (error) {
            console.error('Erreur lors du commentaire :', error);
            setToast(error.response.data.message);
        } finally {
            setIsLoading(false);
            setTextContent('');
            setSelectedPostId(null);
        }
    };

    const handleShare = async (post) => {
        const shareData = {
            title: post.title,
            text: post.postText,
            url: `${window.location.origin}/post/${post._id}`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Erreur de partage :', error);
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert('Lien copié dans le presse-papiers !');
        }

        try {
            const response = await axios.put(
                'http://localhost:8000/post/sharing',
                { currentPostId: post._id, userId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            const updatedSharing = response.data.sharing;
            setPosts((prev) =>
                prev.map((p) =>
                    p._id === post._id ? { ...p, sharing: updatedSharing } : p
                )
            );
            setToast(response.data.message);
        } catch (error) {
            setToast(error.response.data.message);
            console.error('Erreur lors du partage :', error);
        }
    };

    const truncate = (maxLength, text)=>{
        if(!text) return '';
        return text.length > maxLength? text.substring(0, maxLength)+ '...': text;
    }
    const navigate = useNavigate()
    const toThePost = (id)=>{
        navigate(`/post/${id}`)
    }
    return (
        <div className={styles.postsContainer}>
            {toast && <Toast message={toast} setToast={setToast}/>}
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div className={post.postPicture ? styles.post : styles.textPost} key={post._id}>
                        <div className={styles.header}>
                            <div className={styles.author}>
                                <img src={post.userPP} alt="author-profile" />
                                <p>{post.username}</p>
                                <Friend
                                    userId={userId}
                                    authorId={post.userId}
                                    authorFollowers={post.followers}
                                    setRefresh={setRefresh}
                                    refresh={refresh}
                                />
                                {post.title && <strong className={styles.articleLabel}>/ Article</strong>}
                            </div>
                            {manageTime(post.createdAt)}
                        </div>

                        <div className={styles.content} >
                            {post.postText && <p className={styles.postText}>{post.postText}</p>}
                            {post.postPicture && (
                                <div className={styles.imageWrapper}>
                                    <img src={post.postPicture} alt="post" onClick={()=>toThePost(post._id)}/>
                                    {post.title && (
                                    <div className={styles.articleContent}>
                                        <h2>{post.title}</h2>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: truncate(80, post.post) }}
                                            className={styles.htmlContent}
                                        />
                                    </div>
                                )}
                                </div>
                            )}
                            
                        </div>

                        <div className={styles.actions}>
                            {selectedPostId !== post._id && (<div className={styles.action}>
                                {post.postLike.includes(userId) ? (
                                    <FaThumbsUp
                                        className={styles.iconActive}
                                        onClick={() => handleLike(post._id, post.userId)}
                                    />
                                    
                                ) : (
                                    <FaRegThumbsUp
                                        className={styles.icon}
                                        onClick={() => handleLike(post._id, post.userId)}
                                    />
                                    
                                )}
                                <span>{post.postLike?.length || 0}</span>
                            </div>)}

                            {selectedPostId !== post._id && (<div className={styles.action}>
                                <FaRegCommentDots
                                    className={styles.icon}
                                    onClick={() =>
                                        setSelectedPostId(
                                            selectedPostId === post._id ? null : post._id
                                        )
                                    }
                                />
                                <span>{post.postComment?.length || 0}</span>
                            </div>)}

                            {selectedPostId !== post._id && (<div className={styles.action}>
                                <FaShare
                                    className={styles.icon}
                                    onClick={() => handleShare(post)}
                                />
                                <span>{post.sharing?.length || 0}</span>
                            </div>)}
                        </div>

                        {selectedPostId === post._id && (
                            <div className={styles.commentBox}>
                                <input
                                    type="text"
                                    placeholder="Votre commentaire..."
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                />
                                <button onClick={()=> handleComment(post.userId)} disabled={isLoading}>
                                    {isLoading ? '...' : 'Publier'}
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p style={{textAlign: 'center'}}>Aucune publication</p>
            )}
        </div>
    );
};

export default Posts;
