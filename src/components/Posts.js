import styles from './posts.module.css';
import { 
    FaEllipsisV, FaQuestionCircle, FaExclamationTriangle, FaCalendar,
    FaBriefcase, FaNewspaper, FaLightbulb, FaMapMarkerAlt, FaUsers,
    FaClock, FaCheckCircle, FaPlusCircle, FaTimes, FaHeart, FaRegHeart,
    FaRegCommentDots, FaPaperPlane, FaRegBookmark, FaBookmark
} from "react-icons/fa";
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Friend } from './Friend';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import { getNotif } from '../Utils/GetNotif';
import { API_URL } from '../Utils/api';
import { usePosts } from '../hooks/UsePosts'; // Importez votre hook
import CloudinaryImage from '../Utils/CloudinaryImage';

const Posts = ({ userId, setRefresh, refresh }) => {
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [savedPosts, setSavedPosts] = useState([]);
    const [showComments, setShowComments] = useState({});
    const [processingActions, setProcessingActions] = useState({});
    const commentInputRef = useRef(null);

    const token = localStorage.getItem('token');
    const backendURL = API_URL;
    const navigate = useNavigate();

    // Utilisation de React Query pour récupérer les posts
    const { 
        data: posts = [], 
        isLoading, 
        isError, 
        error, 
        refetch 
    } = usePosts(token);

    // ========== UTILS ==========
    const manageTime = useCallback((postDate) => {
        if (!postDate) return '';
        const now = new Date();
        const givenDate = new Date(postDate);
        const diffMs = now - givenDate;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (seconds < 60) return "À l'instant";
        if (minutes < 60) return `${minutes}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}j`;
        if (days < 30) return `${Math.floor(days / 7)} sem`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} mois`;
        return `${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
    }, []);

    const formatEventDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // ========== CONFIGURATIONS ==========
    const typeConfig = useMemo(() => ({
        announcement: { icon: FaCalendar, color: '#3b82f6', label: 'Annonce' },
        alert: { icon: FaExclamationTriangle, color: '#ef4444', label: 'Alerte' },
        event: { icon: FaCalendar, color: '#10b981', label: 'Événement' },
        opportunity: { icon: FaBriefcase, color: '#2563eb', label: 'Opportunité' },
        news: { icon: FaNewspaper, color: '#f59e0b', label: 'Actualité' },
        tip: { icon: FaLightbulb, color: '#06b6d4', label: 'Astuce' },
    }), []);

    const priorityConfig = useMemo(() => ({
        low: { color: '#6b7280', label: 'Basse' },
        normal: { color: '#3b82f6', label: 'Normale' },
        high: { color: '#f59e0b', label: 'Haute' },
        urgent: { color: '#ef4444', label: 'Urgente' },
    }), []);

    const categoryColors = useMemo(() => ({
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
    }), []);

    // Rafraîchir les posts quand refresh change
    useEffect(() => {
        if (refresh) {
            refetch();
        }
    }, [refresh, refetch]);

    // Gérer les erreurs
    useEffect(() => {
        if (isError) {
            setToast(error?.response?.data?.message || 'Erreur lors du chargement des publications');
        }
    }, [isError, error]);

    useEffect(() => {
        if (selectedPostId && commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, [selectedPostId]);

    // ========== API CALLS (mutations) ==========
    const handleLike = useCallback(async (postId, authorId, like, post) => {
        if (processingActions[`like-${postId}`]) return;
        
        setProcessingActions(prev => ({ ...prev, [`like-${postId}`]: true }));

        try {
            const response = await axios.put(
                `${backendURL}/post/like`,
                { postId, authorId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            
            // Refetch pour mettre à jour le cache
            refetch();
            
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
        } finally {
            setProcessingActions(prev => ({ ...prev, [`like-${postId}`]: false }));
        }
    }, [processingActions, backendURL, token, userId, refetch]);

    const handleComment = useCallback(async (postId, authorId) => {
        if (!textContent.trim() || isCommentLoading) return;
        
        setIsCommentLoading(true);
        try {
            const response = await axios.put(
                `${backendURL}/post/comment`,
                { commentary: textContent, currentPostId: postId, userId, authorId },
                { headers: { Authorization: `Bearer${token}` } }
            );
            
            // Refetch pour mettre à jour le cache
            refetch();
            
            setToast(response.data.message || 'Commentaire publié');
            if (userId !== authorId) {
                getNotif({ userId, authorId, message: "a commenté votre publication", token });
            }
            setTextContent('');
            setSelectedPostId(null);
        } catch (error) {
            setToast(error.response?.data?.message || 'Erreur lors du commentaire');
        } finally {
            setIsCommentLoading(false);
        }
    }, [textContent, isCommentLoading, backendURL, token, userId, refetch]);

    const handleShare = useCallback(async (post) => {
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
                    navigator.clipboard.writeText(shareData.url);
                    setToast('Lien copié dans le presse-papiers !');
                }
                return;
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            setToast('Lien copié dans le presse-papiers !');
        }

        try {
            await axios.put(
                `${backendURL}/post/sharing`,
                { currentPostId: post._id, userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Refetch pour mettre à jour le cache
            refetch();
        } catch (error) {
            console.error('Erreur lors du partage :', error);
        }
    }, [backendURL, token, userId, refetch]);

    const handleSavePost = useCallback(async (postId) => {
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
        } finally {
            setProcessingActions(prev => ({ ...prev, [`save-${postId}`]: false }));
        }
    }, [processingActions, savedPosts]);

    const toggleComments = useCallback((postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    }, []);

    // ========== RENDER COMPONENTS ==========
    
    const renderMobileActions = useCallback((post) => (
        <div className={styles.mobileActions}>
            <div className={styles.leftActions}>
                <button 
                    className={`${styles.mobileActionBtn} ${post.postLike?.includes(userId) ? styles.liked : ''}`}
                    onClick={() => handleLike(post._id, post.userId, post.postLike, post)}
                    disabled={processingActions[`like-${post._id}`]}
                    aria-label="J'aime"
                >
                    {post.postLike?.includes(userId) ? (
                        <FaHeart className={styles.iconLiked} />
                    ) : (
                        <FaRegHeart />
                    )}
                    {post.postLike?.length > 0 && (
                        <span className={styles.count}>{post.postLike.length}</span>
                    )}
                </button>

                <button 
                    className={styles.mobileActionBtn}
                    onClick={() => toggleComments(post._id)}
                    aria-label="Commenter"
                >
                    <FaRegCommentDots />
                    {post.postComment?.length > 0 && (
                        <span className={styles.count}>{post.postComment.length}</span>
                    )}
                </button>

                <button 
                    className={styles.mobileActionBtn}
                    onClick={() => handleShare(post)}
                    aria-label="Partager"
                >
                    <FaPaperPlane />
                    {post.sharing?.length > 0 && (
                        <span className={styles.count}>{post.sharing.length}</span>
                    )}
                </button>
            </div>

            <button 
                className={`${styles.mobileActionBtn} ${savedPosts.includes(post._id) ? styles.saved : ''}`}
                onClick={() => handleSavePost(post._id)}
                disabled={processingActions[`save-${post._id}`]}
                aria-label="Enregistrer"
            >
                {savedPosts.includes(post._id) ? (
                    <FaBookmark />
                ) : (
                    <FaRegBookmark />
                )}
            </button>
        </div>
    ), [userId, handleLike, toggleComments, handleShare, handleSavePost, processingActions, savedPosts]);

    const renderCommentSection = useCallback((post) => (
        <>
            {showComments[post._id] && (
                <div className={styles.commentsWrapper}>
                    {post.postComment?.length > 0 ? (
                        <>
                            {post.postComment.slice(0, 3).map((comment, index) => (
                                <div key={index} className={styles.comment}>
                                    <img 
                                        src={comment.userPP || 'https://via.placeholder.com/32'} 
                                        alt={comment.username}
                                        className={styles.commentAvatar}
                                    />
                                    <div className={styles.commentBody}>
                                        <div className={styles.commentBubble}>
                                            <strong className={styles.commentUsername}>{comment.username}</strong>
                                            <p className={styles.commentText}>{comment.commentary}</p>
                                        </div>
                                        <span className={styles.commentTime}>{manageTime(comment.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                            {post.postComment.length > 3 && (
                                <button 
                                    className={styles.viewAllComments}
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    Voir les {post.postComment.length} commentaires
                                </button>
                            )}
                        </>
                    ) : (
                        <div className={styles.noComments}>
                            <FaRegCommentDots />
                            <span>Aucun commentaire</span>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.commentInputWrapper}>
                <img 
                    src={post.userPP || 'https://via.placeholder.com/32'} 
                    alt="Votre profil"
                    className={styles.commentInputAvatar}
                />
                <input
                    ref={selectedPostId === post._id ? commentInputRef : null}
                    type="text"
                    placeholder="Ajouter un commentaire..."
                    value={selectedPostId === post._id ? textContent : ''}
                    onChange={(e) => setTextContent(e.target.value)}
                    onFocus={() => setSelectedPostId(post._id)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleComment(post._id, post.userId);
                        }
                    }}
                    className={styles.commentInput}
                />
                {selectedPostId === post._id && textContent.trim() && (
                    <button 
                        className={styles.sendCommentBtn}
                        onClick={() => handleComment(post._id, post.userId)} 
                        disabled={isCommentLoading}
                    >
                        {isCommentLoading ? '...' : 'Publier'}
                    </button>
                )}
            </div>
        </>
    ), [showComments, selectedPostId, textContent, isCommentLoading, manageTime, handleComment, navigate]);

    const renderPostHeader = useCallback((post) => (
        <div className={styles.header}>
            <div className={styles.author}>
                <img 
                    src={post.userPP || 'https://via.placeholder.com/40'} 
                    alt={post.username}
                    onClick={() => navigate(`/profile/${post.userId}`)}
                    className={styles.avatar}
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
                    </div>
                    <span className={styles.postTime}>{manageTime(post.createdAt)}</span>
                </div>
            </div>
            <button className={styles.moreBtn} aria-label="Plus d'options">
                <FaEllipsisV />
            </button>
        </div>
    ), [navigate, userId, setRefresh, refresh, manageTime]);

    // ========== POST TYPES RENDERERS ==========
    
    const renderQuestionPost = useCallback((post) => {
        const postData = post.post || {};
        return (
            <article className={styles.post} key={post._id}>
                {renderPostHeader(post)}
                
                <div className={styles.questionContent}>
                    <span className={styles.typeBadge} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        <FaQuestionCircle /> Question
                    </span>
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
                                <span key={index} className={styles.tag}>#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {renderMobileActions(post)}
                {renderCommentSection(post)}
            </article>
        );
    }, [renderPostHeader, categoryColors, renderMobileActions, renderCommentSection]);

    const renderInfoPost = useCallback((post) => {
        const postData = post.post || {};
        const config = typeConfig[postData.type] || typeConfig.announcement;
        const priority = priorityConfig[postData.priority] || priorityConfig.normal;
        const IconComponent = config.icon;

        return (
            <article 
                className={`${styles.post} ${postData.priority === 'urgent' ? styles.urgentPost : ''}`} 
                key={post._id}
            >
                {renderPostHeader(post)}

                <div className={styles.infoContent}>
                    <div className={styles.infoHeader}>
                        <span 
                            className={styles.typeBadge}
                            style={{ 
                                backgroundColor: config.color + '20',
                                color: config.color
                            }}
                        >
                            <IconComponent /> {config.label}
                        </span>
                        {postData.priority && postData.priority !== 'normal' && (
                            <span 
                                className={styles.priorityBadge}
                                style={{ backgroundColor: priority.color }}
                            >
                                {priority.label}
                            </span>
                        )}
                    </div>
                    <h3 className={styles.infoTitle}>{postData.title}</h3>
                    <p className={styles.infoBody}>{postData.content}</p>
                    
                    {/**postData.imageUrl && (
                        <div className={styles.imageWrapper}>
                            <img src={postData.imageUrl} alt="Info" />
                            
                        </div>
                    ) */}
                    {post.publicId && (
                        <CloudinaryImage publicId={post.publicId} width={600} height={400} />
                    )}
                    
                    {postData.link && (
                        <a 
                            href={postData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkButton}
                        >
                            🔗 En savoir plus
                        </a>
                    )}
                </div>

                {renderMobileActions(post)}
                {renderCommentSection(post)}
            </article>
        );
    }, [renderPostHeader, typeConfig, priorityConfig, renderMobileActions, renderCommentSection]);

    const renderEventPost = useCallback((post) => {
        const postData = post.post || {};
        return (
            <article className={styles.post} key={post._id}>
                {renderPostHeader(post)}

                <div className={styles.eventContent}>
                    <span 
                        className={styles.typeBadge}
                        style={{ backgroundColor: '#dcfce7', color: '#10b981' }}
                    >
                        <FaCalendar /> Événement
                    </span>
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
                </div>

                {renderMobileActions(post)}
                {renderCommentSection(post)}
            </article>
        );
    }, [renderPostHeader, formatEventDate, categoryColors, userId, renderMobileActions, renderCommentSection]);

    const renderRegularPost = useCallback((post) => (
        <article className={post.postPicture ? styles.post : styles.textPost} key={post._id}>
            {renderPostHeader(post)}

            <div className={styles.content}>
                {post.postText && <p className={styles.postText}>{post.postText}</p>}
                {post.postPicture && (
                    <div className={styles.imageWrapper}>
                        <img 
                            src={post.postPicture} 
                            alt="post" 
                            onClick={() => navigate(`/post/${post._id}`)}
                            loading="lazy"
                        />
                        {post.title && (
                            <div className={styles.articleOverlay}>
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

            {renderMobileActions(post)}
            {renderCommentSection(post)}
        </article>
    ), [renderPostHeader, navigate, renderMobileActions, renderCommentSection]);

    const renderPost = useCallback((post) => {
        const postType = post.post?.type || post.post?.postType;
        
        if (postType === 'question') return renderQuestionPost(post);
        if (post.post?.postType === 'info') return renderInfoPost(post);
        if (postType === 'event') return renderEventPost(post);
        return renderRegularPost(post);
    }, [renderQuestionPost, renderInfoPost, renderEventPost, renderRegularPost]);

    // ========== MAIN RENDER ==========

    if (isLoading) {
        return (
            <div className={styles.postsContainer}>
                <p style={{ textAlign: 'center' }}>Chargement...</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className={styles.postsContainer}>
                <div className={styles.emptyState}>
                    <FaRegCommentDots size={64} />
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