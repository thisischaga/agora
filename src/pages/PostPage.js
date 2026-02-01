import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './postPage.module.css';
import { API_URL } from '../Utils/api';
import { FaArrowLeft, FaHeart, FaComment, FaShare, FaClock, FaUser } from 'react-icons/fa';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const token = useMemo(() => localStorage.getItem('token'), []);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`${API_URL}/post/${id}`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                
                setPost(response.data);
                setLikeCount(response.data.likes || 0);
                setLiked(response.data.isLiked || false);
            } catch (error) {
                console.error('Erreur lors du chargement du post:', error);
                setError('Impossible de charger le post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, token]);

    const formatDate = useCallback((date) => {
        if (!date) return '';
        
        const postDate = new Date(date);
        const now = new Date();
        const diffMs = now - postDate;
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 24) {
            return `Il y a ${diffHours}h`;
        }
        if (diffDays < 7) {
            return `Il y a ${diffDays}j`;
        }
        
        return postDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }, []);

    const handleLike = useCallback(async () => {
        try {
            // Optimistic update
            setLiked(!liked);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
            
            await axios.post(`${API_URL}/post/${id}/like`, {}, {
                headers: { Authorization: `Bearer${token}` }
            });
        } catch (error) {
            // Revert on error
            setLiked(liked);
            setLikeCount(prev => liked ? prev + 1 : prev - 1);
            console.error('Erreur lors du like:', error);
        }
    }, [id, token, liked]);

    const handleShare = useCallback(() => {
        if (navigator.share) {
            navigator.share({
                title: post?.title,
                text: post?.title,
                url: window.location.href,
            }).catch(err => console.error('Erreur partage:', err));
        } else {
            // Fallback: copier l'URL
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié !');
        }
    }, [post]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // Loading state
    if (loading) {
        return (
            <div className={styles.postPage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.postPage}>
                <div className={styles.errorContainer}>
                    <h2>Oups !</h2>
                    <p>{error}</p>
                    <button onClick={handleBack} className={styles.backBtn}>
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    // No post
    if (!post) {
        return (
            <div className={styles.postPage}>
                <div className={styles.errorContainer}>
                    <h2>Post introuvable</h2>
                    <p>Ce post n'existe pas ou a été supprimé</p>
                    <button onClick={handleBack} className={styles.backBtn}>
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.postPage}>
            {/* Header mobile avec bouton retour */}
            <div className={styles.mobileHeader}>
                <button onClick={handleBack} className={styles.backButton}>
                    <FaArrowLeft />
                </button>
                <span>Article</span>
            </div>

            <article className={styles.content}>
                {/* Header du post */}
                <header className={styles.postHeader}>
                    <button onClick={handleBack} className={styles.backButtonDesktop}>
                        <FaArrowLeft />
                        <span>Retour</span>
                    </button>
                    
                    <h1 className={styles.title}>{post.title}</h1>
                    
                    <div className={styles.metadata}>
                        <div className={styles.author}>
                            {post.userPP ? (
                                <img 
                                    src={post.userPP} 
                                    alt={post.username}
                                    className={styles.authorAvatar}
                                />
                            ) : (
                                <div className={styles.authorAvatarPlaceholder}>
                                    <FaUser />
                                </div>
                            )}
                            <div className={styles.authorInfo}>
                                <p className={styles.authorName}>Par {post.username}</p>
                                <p className={styles.publishDate}>
                                    <FaClock />
                                    {formatDate(post.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Image du post */}
                {post.postPicture && (
                    <div className={styles.imageContainer}>
                        <img 
                            src={post.postPicture} 
                            alt={post.title}
                            className={styles.postImage}
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Contenu du post */}
                <div className={styles.postContent}>
                    <div
                        dangerouslySetInnerHTML={{ __html: post.post }}
                        className={styles.htmlContent}
                    />
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button 
                        className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
                        onClick={handleLike}
                        aria-label="J'aime"
                    >
                        <FaHeart />
                        <span>{likeCount}</span>
                    </button>

                    <button 
                        className={styles.actionBtn}
                        aria-label="Commenter"
                    >
                        <FaComment />
                        <span>{post.comments || 0}</span>
                    </button>

                    <button 
                        className={styles.actionBtn}
                        onClick={handleShare}
                        aria-label="Partager"
                    >
                        <FaShare />
                        <span>Partager</span>
                    </button>
                </div>

                {/* Section commentaires (à implémenter) */}
                <div className={styles.commentsSection}>
                    <h2>Commentaires</h2>
                    <p className={styles.noComments}>Aucun commentaire pour le moment</p>
                </div>
            </article>
        </div>
    );
};

export default PostPage;