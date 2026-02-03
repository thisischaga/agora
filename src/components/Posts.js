import styles from './posts.module.css';
import { 
    FaRegThumbsUp, FaThumbsUp, FaEllipsisV, FaRegBookmark, FaBookmark, 
    FaRegCommentDots, FaShare, FaTimes, FaHeart, FaRegHeart,
    FaQuestionCircle, FaExclamationTriangle, FaCalendar,
    FaBriefcase, FaNewspaper, FaLightbulb, FaMapMarkerAlt, FaUsers,
    FaClock, FaCheckCircle, FaPlusCircle
} from "react-icons/fa";
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Friend } from './Friend';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import { getNotif } from '../Utils/GetNotif';
import { API_URL } from '../Utils/api';

const Posts = ({ userId, setRefresh, refresh }) => {
    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [savedPosts, setSavedPosts] = useState([]);
    const [showComments, setShowComments] = useState({});
    const [processingActions, setProcessingActions] = useState({});
    const commentInputRef = useRef(null);

    const token = localStorage.getItem('token');
    const backendURL = API_URL;
    const navigate = useNavigate();

    const manageTime = (postDate) => {
        const now = new Date();
        const givenDate = new Date(postDate);
        const diffMs = now - givenDate;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (seconds < 60) return `${seconds}s`;
        if (minutes < 60) return `${minutes}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}j`;
        if (days < 30) return `${Math.floor(days / 7)} sem`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} mois`;
        return `${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
    };

    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${backendURL}/posts`, {
                    headers: { Authorization: `Bearer${token}` }
                });
                setPosts(response.data || []);
            } catch (error) {
                console.error('Erreur lors du chargement des posts :', error);
                setToast('Erreur lors du chargement des publications');
            }
        };
        fetchPosts();
    }, [refresh, token, backendURL]);

    useEffect(() => {
        if (selectedPostId && commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, [selectedPostId]);

    const handleLike = async (postId, authorId, like, post) => {
        if (processingActions[`like-${postId}`]) return;
        
        setProcessingActions(prev => ({ ...prev, [`like-${postId}`]: true }));

        try {
            const response = await axios.put(
                `${backendURL}/post/like`,
                { postId, authorId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            const updatedLikes = response.data.likes;
            setPosts((prev) =>
                prev.map((p) =>
                    p._id === postId ? { ...p, postLike: updatedLikes } : p
                )
            );
            if (userId !== authorId && !like.includes(userId)) {
                getNotif({
                    userId,
                    authorId,
                    message: "a aimé votre publication",
                    type: 'like',
                    post,
                    token
                });
            }
        } catch (error) {
            setToast(error.response?.data?.message || 'Erreur lors du like');
            console.error('Erreur lors du like :', error);
        } finally {
            setProcessingActions(prev => ({ ...prev, [`like-${postId}`]: false }));
        }
    };

    const handleComment = async (postId, authorId) => {
        if (!textContent.trim() || isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await axios.put(
                `${backendURL}/post/comment`,
                { commentary: textContent, currentPostId: postId, userId, authorId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            const updatedComment = response.data.commentaires;
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? { ...post, postComment: updatedComment }
                        : post
                )
            );
            setToast(response.data.message || 'Commentaire publié');
            if (userId !== authorId) {
                getNotif({ userId, authorId, message: "a commenté votre publication", token });
            }
        } catch (error) {
            console.error('Erreur lors du commentaire :', error);
            setToast(error.response?.data?.message || 'Erreur lors du commentaire');
        } finally {
            setIsLoading(false);
            setTextContent('');
            setSelectedPostId(null);
        }
    };

    const handleShare = async (post) => {
        const shareData = {
            title: post.title || post.post?.title || 'Publication',
            text: post.postText || post.post?.content || '',
            url: `${window.location.origin}/post/${post._id}`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erreur de partage :', error);
                }
                return;
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            setToast('Lien copié dans le presse-papiers !');
        }

        try {
            const response = await axios.put(
                `${backendURL}/post/sharing`,
                { currentPostId: post._id, userId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            const updatedSharing = response.data.sharing;
            setPosts((prev) =>
                prev.map((p) =>
                    p._id === post._id ? { ...p, sharing: updatedSharing } : p
                )
            );
        } catch (error) {
            console.error('Erreur lors du partage :', error);
        }
    };

    const handleSavePost = async (postId) => {
        if (processingActions[`save-${postId}`]) return;
        
        setProcessingActions(prev => ({ ...prev, [`save-${postId}`]: true }));
        
        try {
            const isSaved = savedPosts.includes(postId);
            if (isSaved) {
                setSavedPosts(prev => prev.filter(id => id !== postId));
                setToast('Publication retirée des enregistrements');
            } else {
                setSavedPosts(prev => [...prev, postId]);
                setToast('Publication enregistrée');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde :', error);
        } finally {
            setProcessingActions(prev => ({ ...prev, [`save-${postId}`]: false }));
        }
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const toThePost = (id) => {
        navigate(`/post/${id}`);
    };

    // Type configurations
    const typeConfig = {
        announcement: { icon: FaCalendar, color: '#3b82f6', label: 'Annonce' },
        alert: { icon: FaExclamationTriangle, color: '#ef4444', label: 'Alerte' },
        event: { icon: FaCalendar, color: '#10b981', label: 'Événement' },
        opportunity: { icon: FaBriefcase, color: '#2563eb', label: 'Opportunité' },
        news: { icon: FaNewspaper, color: '#f59e0b', label: 'Actualité' },
        tip: { icon: FaLightbulb, color: '#06b6d4', label: 'Astuce' },
    };

    const priorityConfig = {
        low: { color: '#6b7280', label: 'Basse' },
        normal: { color: '#3b82f6', label: 'Normale' },
        high: { color: '#f59e0b', label: 'Haute' },
        urgent: { color: '#ef4444', label: 'Urgente' },
    };

    const categoryColors = {
        academic: '#3b82f6',
        technical: '#2563eb',
        career: '#10b981',
        life: '#f59e0b',
        other: '#6b7280',
        sport: '#10b981',
        culture: '#2563eb',
        education: '#3b82f6',
        social: '#f59e0b',
        technology: '#06b6d4',
    };

    const renderPost = (post) => {
        const postData = post.post || {};
        
        // Question Post
        if (post.post.type === 'question') {
            return (
                <article className={styles.post} key={post._id}>
                    <div className={styles.header}>
                        <div className={styles.author}>
                            <img 
                                src={post.userPP || 'https://via.placeholder.com/40'} 
                                alt={post.username}
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            />
                            <div className={styles.authorInfo}>
                                <div className={styles.authorName}>
                                    <p onClick={() => navigate(`/profile/${post.userId}`)}>
                                        {post.username}
                                    </p>
                                    <span className={styles.typeBadge} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                                        <FaQuestionCircle /> Question
                                    </span>
                                </div>
                                <span className={styles.postTime}>{manageTime(post.createdAt)}</span>
                            </div>
                        </div>
                        <button className={styles.moreBtn} aria-label="Plus d'options">
                            <FaEllipsisV />
                        </button>
                    </div>

                    <div className={styles.questionContent}>
                        <h3 className={styles.questionTitle}>{postData.question}</h3>
                        {postData.details && (
                            <p className={styles.questionDetails}>{postData.details}</p>
                        )}
                        
                        {postData.category && (
                            <span 
                                className={styles.categoryBadge}
                                style={{ 
                                    backgroundColor: categoryColors[postData.category] + '20',
                                    color: categoryColors[postData.category]
                                }}
                            >
                                {postData.category}
                            </span>
                        )}
                        
                        {postData.tags && postData.tags.length > 0 && (
                            <div className={styles.tagsRow}>
                                {postData.tags.map((tag, index) => (
                                    <span key={index} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {renderActions(post)}
                    {renderCommentSection(post)}
                </article>
            );
        }

        // Info Post
        if (post.post.postType === 'info') {
            const config = typeConfig[postData.type] || typeConfig.announcement;
            const priority = priorityConfig[postData.priority] || priorityConfig.normal;
            const IconComponent = config.icon;

            return (
                <article 
                    className={`${styles.post} ${postData.priority === 'urgent' ? styles.urgentPost : ''}`} 
                    key={post._id}
                >
                    <div className={styles.header}>
                        <div className={styles.author}>
                            <img 
                                src={post.userPP || 'https://via.placeholder.com/40'} 
                                alt={post.username}
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            />
                            <div className={styles.authorInfo}>
                                <div className={styles.authorName}>
                                    <p onClick={() => navigate(`/profile/${post.userId}`)}>
                                        {post.username}
                                    </p>
                                    <span 
                                        className={styles.typeBadge}
                                        style={{ 
                                            backgroundColor: config.color + '20',
                                            color: config.color
                                        }}
                                    >
                                        <IconComponent /> {config.label}
                                    </span>
                                </div>
                                <span className={styles.postTime}>{manageTime(post.createdAt)}</span>
                            </div>
                        </div>
                        <button className={styles.moreBtn} aria-label="Plus d'options">
                            <FaEllipsisV />
                        </button>
                    </div>

                    <div className={styles.infoContent}>
                        <div className={styles.infoHeader}>
                            <h3 className={styles.infoTitle}>{postData.title}</h3>
                            {postData.priority && postData.priority !== 'normal' && (
                                <span 
                                    className={styles.priorityBadge}
                                    style={{ backgroundColor: priority.color }}
                                >
                                    {priority.label}
                                </span>
                            )}
                        </div>
                        <p className={styles.infoBody}>{postData.content}</p>
                        
                        {postData.imageUrl && (
                            <div className={styles.imageWrapper}>
                                <img src={postData.imageUrl} alt="Info" />
                            </div>
                        )}
                        
                        {postData.link && (
                            <a 
                                href={postData.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkButton}
                            >
                                🔗 {postData.link}
                            </a>
                        )}
                    </div>

                    {renderActions(post)}
                    {renderCommentSection(post)}
                </article>
            );
        }

        // Event Post
        if (post.post.type === 'event') {
            return (
                <article className={styles.post} key={post._id}>
                    <div className={styles.header}>
                        <div className={styles.author}>
                            <img 
                                src={post.userPP || 'https://via.placeholder.com/40'} 
                                alt={post.username}
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            />
                            <div className={styles.authorInfo}>
                                <div className={styles.authorName}>
                                    <p onClick={() => navigate(`/profile/${post.userId}`)}>
                                        {post.username}
                                    </p>
                                    <span 
                                        className={styles.typeBadge}
                                        style={{ backgroundColor: '#dcfce7', color: '#10b981' }}
                                    >
                                        <FaCalendar /> Événement
                                    </span>
                                </div>
                                <span className={styles.postTime}>{manageTime(post.createdAt)}</span>
                            </div>
                        </div>
                        <button className={styles.moreBtn} aria-label="Plus d'options">
                            <FaEllipsisV />
                        </button>
                    </div>

                    <div className={styles.eventContent}>
                        <h3 className={styles.eventTitle}>{postData.title}</h3>
                        <p className={styles.eventDescription}>{postData.description}</p>
                        
                        <div className={styles.eventDetails}>
                            {postData.startDate && (
                                <div className={styles.eventDetailRow}>
                                    <FaClock />
                                    <span>
                                        {formatEventDate(postData.startDate)}
                                        {postData.endDate && ` - ${formatEventDate(postData.endDate)}`}
                                    </span>
                                </div>
                            )}
                            
                            {postData.location && (
                                <div className={styles.eventDetailRow}>
                                    <FaMapMarkerAlt />
                                    <span>{postData.location}</span>
                                </div>
                            )}
                            
                            {postData.maxParticipants && (
                                <div className={styles.eventDetailRow}>
                                    <FaUsers />
                                    <span>
                                        {postData.participants?.length || 0}/{postData.maxParticipants} participants
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {postData.category && (
                            <span 
                                className={styles.categoryBadge}
                                style={{ 
                                    backgroundColor: categoryColors[postData.category] + '20',
                                    color: categoryColors[postData.category]
                                }}
                            >
                                {postData.category}
                            </span>
                        )}
                    </div>

                    <div className={styles.eventActions}>
                        <button 
                            className={`${styles.participateBtn} ${postData.participants?.includes(userId) ? styles.participating : ''}`}
                        >
                            {postData.participants?.includes(userId) ? (
                                <>
                                    <FaCheckCircle /> Inscrit
                                </>
                            ) : (
                                <>
                                    <FaPlusCircle /> Participer
                                </>
                            )}
                        </button>
                        
                        <button 
                            className={`${styles.actionBtn} ${post.postLike?.includes(userId) ? styles.active : ''}`}
                            onClick={() => handleLike(post._id, post.userId, post.postLike, post)}
                            disabled={processingActions[`like-${post._id}`]}
                        >
                            {post.postLike?.includes(userId) ? (
                                <FaHeart className={styles.iconActive} />
                            ) : (
                                <FaRegHeart className={styles.icon} />
                            )}
                            <span>{post.postLike?.length || 0}</span>
                        </button>
                    </div>

                    {renderCommentSection(post)}
                </article>
            );
        }

        // Regular Post (default)
        return (
            <article className={post.postPicture ? styles.post : styles.textPost} key={post._id}>
                <div className={styles.header}>
                    <div className={styles.author}>
                        <img 
                            src={post.userPP || 'https://via.placeholder.com/40'} 
                            alt={post.username}
                            onClick={() => navigate(`/profile/${post.userId}`)}
                        />
                        <div className={styles.authorInfo}>
                            <div className={styles.authorName}>
                                <p onClick={() => navigate(`/profile/${post.userId}`)}>
                                    {post.username}
                                </p>
                                <Friend
                                    userId={userId}
                                    authorId={post.userId}
                                    authorFollowers={post.followers}
                                    setRefresh={setRefresh}
                                    refresh={refresh}
                                />
                                {post.title && <span className={styles.articleLabel}>Article</span>}
                            </div>
                            <span className={styles.postTime}>{manageTime(post.createdAt)}</span>
                        </div>
                    </div>
                    <button className={styles.moreBtn} aria-label="Plus d'options">
                        <FaEllipsisV />
                    </button>
                </div>

                <div className={styles.content}>
                    {post.postText && <p className={styles.postText}>{post.postText}</p>}
                    {post.postPicture && (
                        <div className={styles.imageWrapper}>
                            <img 
                                src={post.postPicture} 
                                alt="post" 
                                onClick={() => toThePost(post._id)}
                                loading="lazy"
                            />
                            {post.title && (
                                <div className={styles.articleContent}>
                                    <h2>{post.title}</h2>
                                    <div
                                        dangerouslySetInnerHTML={{ 
                                            __html: post.post?.substring(0, 80) + '...' 
                                        }}
                                        className={styles.htmlContent}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {renderActions(post)}
                {renderCommentSection(post)}
            </article>
        );
    };

    const renderActions = (post) => (
        <>
            <div className={styles.stats}>
                {post.postLike?.length > 0 && (
                    <span className={styles.likesCount}>
                        <FaRegThumbsUp className={styles.miniIcon} />
                        {post.postLike.length} {post.postLike.length === 1 ? 'mention J\'aime' : 'mentions J\'aime'}
                    </span>
                )}
                {post.postComment?.length > 0 && (
                    <span 
                        className={styles.commentsCount}
                        onClick={() => toggleComments(post._id)}
                    >
                        {post.postComment.length} {post.postComment.length === 1 ? 'commentaire' : 'commentaires'}
                    </span>
                )}
            </div>

            <div className={styles.actions}>
                <button 
                    className={`${styles.actionBtn} ${post.postLike?.includes(userId) ? styles.active : ''}`}
                    onClick={() => handleLike(post._id, post.userId, post.postLike, post)}
                    disabled={processingActions[`like-${post._id}`]}
                >
                    {post.postLike?.includes(userId) ? (
                        <FaThumbsUp className={styles.iconActive} />
                    ) : (
                        <FaRegThumbsUp className={styles.icon} />
                    )}
                    <span>J'aime</span>
                </button>

                <button 
                    className={styles.actionBtn}
                    onClick={() => setSelectedPostId(selectedPostId === post._id ? null : post._id)}
                >
                    <FaRegCommentDots className={styles.icon} />
                    <span>Commenter</span>
                </button>

                <button 
                    className={styles.actionBtn}
                    onClick={() => handleShare(post)}
                >
                    <FaShare className={styles.icon} />
                    <span>Partager</span>
                </button>

                <button 
                    className={`${styles.actionBtn} ${savedPosts.includes(post._id) ? styles.active : ''}`}
                    onClick={() => handleSavePost(post._id)}
                    disabled={processingActions[`save-${post._id}`]}
                >
                    {savedPosts.includes(post._id) ? (
                        <FaBookmark className={styles.iconActive} />
                    ) : (
                        <FaRegBookmark className={styles.icon} />
                    )}
                    <span>Enregistrer</span>
                </button>
            </div>
        </>
    );

    const renderCommentSection = (post) => (
        <>
            {selectedPostId === post._id && (
                <div className={styles.commentBox}>
                    <img 
                        src={post.userPP || 'https://via.placeholder.com/32'} 
                        alt="Votre profil"
                        className={styles.commentAvatar}
                    />
                    <div className={styles.commentInputWrapper}>
                        <input
                            ref={commentInputRef}
                            type="text"
                            placeholder="Écrivez un commentaire..."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleComment(post._id, post.userId);
                                }
                            }}
                        />
                        <div className={styles.commentActions}>
                            <button 
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setSelectedPostId(null);
                                    setTextContent('');
                                }}
                            >
                                <FaTimes />
                            </button>
                            <button 
                                className={styles.submitBtn}
                                onClick={() => handleComment(post._id, post.userId)} 
                                disabled={isLoading || !textContent.trim()}
                            >
                                {isLoading ? (
                                    <span className={styles.btnSpinner}></span>
                                ) : (
                                    'Publier'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showComments[post._id] && post.postComment?.length > 0 && (
                <div className={styles.commentsSection}>
                    {post.postComment.slice(0, 3).map((comment, index) => (
                        <div key={index} className={styles.comment}>
                            <img 
                                src={comment.userPP || 'https://via.placeholder.com/32'} 
                                alt={comment.username}
                            />
                            <div className={styles.commentContent}>
                                <div className={styles.commentBubble}>
                                    <strong>{comment.username}</strong>
                                    <p>{comment.commentary}</p>
                                </div>
                                <span className={styles.commentTime}>{manageTime(comment.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                    {post.postComment.length > 3 && (
                        <button 
                            className={styles.viewAllComments}
                            onClick={() => toThePost(post._id)}
                        >
                            Voir les {post.postComment.length} commentaires
                        </button>
                    )}
                </div>
            )}
        </>
    );

    if (posts.length === 0) {
        return (
            <div className={styles.postsContainer}>
                <div className={styles.emptyState}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M22 4L12 14.01l-3-3L2 18.01"></path>
                    </svg>
                    <h3>Aucune publication</h3>
                    <p>Les publications de vos amis apparaîtront ici</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.postsContainer}>
            {toast && <Toast message={toast} setToast={setToast} />}
            {posts.map(post => renderPost(post))}
        </div>
    );
};

export default Posts;