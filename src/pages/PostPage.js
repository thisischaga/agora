import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './postPage.module.css';
import { API_URL } from '../Utils/api';
import { 
    FaArrowLeft, FaHeart, FaRegHeart, FaRegCommentDots, 
    FaPaperPlane, FaClock, FaUser, FaEllipsisV,
    FaRegBookmark, FaBookmark, FaTimes, FaQuestionCircle,
    FaExclamationTriangle, FaCalendar, FaBriefcase, 
    FaNewspaper, FaLightbulb, FaMapMarkerAlt, FaUsers,
    FaCheckCircle, FaPlusCircle
} from 'react-icons/fa';
import { Friend } from '../components/Friend';
import Toast from '../components/Toast';
import CloudinaryImage from '../Utils/CloudinaryImage';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    const commentInputRef = useRef(null);
    const token = useMemo(() => localStorage.getItem('token'), []);
    const userId = useMemo(() => localStorage.getItem('userId'), []);

    // ========== CONFIGURATIONS ==========
    const typeConfig = useMemo(() => ({
        announcement: { icon: FaClock, color: '#3b82f6', label: 'Annonce' },
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

    // ========== FETCH POST DATA ==========
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
                setLikeCount(response.data.postLike?.length || 0);
                setLiked(response.data.postLike?.includes(userId) || false);
                setSaved(response.data.favoris?.includes(userId) || false);
                setComments(response.data.postComment || []);
            } catch (error) {
                console.error('Erreur lors du chargement du post:', error);
                setError('Impossible de charger le post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, token, userId]);

    // ========== TIME FORMATTING ==========
    const formatDate = useCallback((date) => {
        if (!date) return '';
        
        const postDate = new Date(date);
        const now = new Date();
        const diffMs = now - postDate;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffSeconds < 60) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem`;
        
        return postDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
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

    // ========== ACTIONS HANDLERS ==========
    const handleLike = useCallback(async () => {
        const previousLiked = liked;
        const previousCount = likeCount;
        
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        
        try {
            await axios.put(
                `${API_URL}/post/like`,
                { postId: id, authorId: post.userId },
                { headers: { Authorization: `Bearer${token}` } }
            );
        } catch (error) {
            setLiked(previousLiked);
            setLikeCount(previousCount);
            console.error('Erreur lors du like:', error);
        }
    }, [id, token, liked, likeCount, post]);

    const handleSave = useCallback(async () => {
        const previousSaved = saved;
        setSaved(!saved);
        
        try {
            await axios.put(
                `${API_URL}/post/favoris`,
                { postId: id },
                { headers: { Authorization: `Bearer${token}` } }
            );
        } catch (error) {
            setSaved(previousSaved);
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [id, token, saved]);

    const handleShare = useCallback(() => {
        const shareData = {
            title: post?.title || 'Publication',
            text: post?.postText || '',
            imageUrl: post?.post.imageUrl || '',
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData)
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Lien copié dans le presse-papiers !');
                    }
                });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers !');
        }
    }, [post]);

    const handleComment = useCallback(async () => {
        if (!commentText.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await axios.put(
                `${API_URL}/post/comment`,
                { 
                    commentary: commentText.trim(), 
                    currentPostId: id, 
                    userId,
                    authorId: post.userId 
                },
                { headers: { Authorization: `Bearer${token}` } }
            );
            
            setComments(response.data.commentaires || []);
            setCommentText('');
            commentInputRef.current?.blur();
        } catch (error) {
            console.error('Erreur lors du commentaire:', error);
            <Toast message="Erreur lors du commentaire" type="error" />
        } finally {
            setIsSubmitting(false);
        }
    }, [commentText, isSubmitting, id, userId, token, post]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // ========== RENDER CONTENT BY TYPE ==========
    const renderPostContent = useCallback(() => {
        if (!post) return null;

        const postType = post.post?.type || post.post?.postType;
        const postData = post.post || {};

        // Question Post
        if (postType === 'question') {
            return (
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
            );
        }

        // Info Post
        if (postData.postType === 'info') {
            const config = typeConfig[postData.type] || typeConfig.announcement;
            const priority = priorityConfig[postData.priority] || priorityConfig.normal;
            const IconComponent = config.icon;

            return (
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
            );
        }

        // Event Post
        if (postType === 'event') {
            return (
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
            );
        }

        // Regular Post (default)
        return (
            <div className={styles.regularContent}>
                {/* Image du post */}
                {post.postPicture && (
                    <div className={styles.imageContainer}>
                        <img 
                            src={post.postPicture} 
                            alt={post.title || 'Post image'}
                            className={styles.postImage}
                            loading="lazy"
                        />
                        {post.title && (
                            <div className={styles.articleOverlay}>
                                <h2>{post.title}</h2>
                                {post.post && (
                                    <div
                                        dangerouslySetInnerHTML={{ 
                                            __html: post.post.substring(0, 80) + '...' 
                                        }}
                                        className={styles.htmlContent}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Title and content */}
                <div className={styles.postBody}>
                    {post.title && !post.postPicture && (
                        <h1 className={styles.title}>{post.title}</h1>
                    )}
                    
                    {post.postText && (
                        <p className={styles.postText}>{post.postText}</p>
                    )}
                    
                    {post.post && typeof post.post === 'string' && (
                        <div
                            dangerouslySetInnerHTML={{ __html: post.post }}
                            className={styles.htmlContent}
                        />
                    )}
                </div>
            </div>
        );
    }, [post, typeConfig, priorityConfig, categoryColors, formatEventDate, userId]);

    // ========== LOADING STATE ==========
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

    // ========== ERROR STATE ==========
    if (error || !post) {
        return (
            <div className={styles.postPage}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2>{error || 'Post introuvable'}</h2>
                    <p>Ce post n'existe pas ou a été supprimé</p>
                    <button onClick={handleBack} className={styles.errorBackBtn}>
                        <FaArrowLeft /> Retour
                    </button>
                </div>
            </div>
        );
    }

    // ========== RENDER COMMENTS ==========
    const displayedComments = showAllComments ? comments : comments.slice(0, 5);

    return (
        <div className={styles.postPage}>
            {/* Header mobile */}
            <div className={styles.mobileHeader}>
                <button onClick={handleBack} className={styles.backButton} aria-label="Retour">
                    <FaArrowLeft />
                </button>
                <span>Publication</span>
                <button className={styles.moreButton} aria-label="Plus d'options">
                    <FaEllipsisV />
                </button>
            </div>

            <article className={styles.content}>
                {/* Header desktop */}
                <button onClick={handleBack} className={styles.backButtonDesktop}>
                    <FaArrowLeft />
                    <span>Retour</span>
                </button>

                {/* Author info */}
                <div className={styles.authorSection}>
                    <div className={styles.authorWrapper}>
                        {post.userPP ? (
                            <img 
                                src={post.userPP} 
                                alt={post.username}
                                className={styles.authorAvatar}
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            />
                        ) : (
                            <div className={styles.authorAvatarPlaceholder}>
                                <FaUser />
                            </div>
                        )}
                        <div className={styles.authorInfo}>
                            <p 
                                className={styles.authorName}
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            >
                                {post.username}
                            </p>
                            <p className={styles.publishDate}>
                                <FaClock />
                                {formatDate(post.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Post Content - Dynamic based on type */}
                {renderPostContent()}

                {/* Mobile actions */}
                <div className={styles.mobileActions}>
                    <div className={styles.leftActions}>
                        <button 
                            className={`${styles.mobileActionBtn} ${liked ? styles.liked : ''}`}
                            onClick={handleLike}
                            aria-label="J'aime"
                        >
                            {liked ? <FaHeart /> : <FaRegHeart />}
                            {likeCount > 0 && <span className={styles.count}>{likeCount}</span>}
                        </button>

                        <button 
                            className={styles.mobileActionBtn}
                            onClick={() => commentInputRef.current?.focus()}
                            aria-label="Commenter"
                        >
                            <FaRegCommentDots />
                            {comments.length > 0 && <span className={styles.count}>{comments.length}</span>}
                        </button>

                        <button 
                            className={styles.mobileActionBtn}
                            onClick={handleShare}
                            aria-label="Partager"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>

                    <button 
                        className={`${styles.mobileActionBtn} ${saved ? styles.saved : ''}`}
                        onClick={handleSave}
                        aria-label="Enregistrer"
                    >
                        {saved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                </div>

                {/* Likes count */}
                {likeCount > 0 && (
                    <div className={styles.likesCount}>
                        <strong>{likeCount}</strong> {likeCount === 1 ? 'mention J\'aime' : 'mentions J\'aime'}
                    </div>
                )}

                {/* Comments section */}
                <div className={styles.commentsSection}>
                    {comments.length > 0 ? (
                        <>
                            <h3 className={styles.commentsTitle}>
                                Commentaires ({comments.length})
                            </h3>
                            
                            <div className={styles.commentsList}>
                                {displayedComments.map((comment, index) => (
                                    <div key={index} className={styles.comment}>
                                        <img 
                                            src={comment.userPP || 'https://via.placeholder.com/32'} 
                                            alt={comment.username}
                                            className={styles.commentAvatar}
                                            onClick={() => navigate(`/profile/${comment.userId}`)}
                                        />
                                        <div className={styles.commentBody}>
                                            <div className={styles.commentBubble}>
                                                <strong 
                                                    className={styles.commentUsername}
                                                    onClick={() => navigate(`/profile/${comment.userId}`)}
                                                >
                                                    {comment.username}
                                                </strong>
                                                <p className={styles.commentText}>{comment.commentary}</p>
                                            </div>
                                            <span className={styles.commentTime}>
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {comments.length > 5 && !showAllComments && (
                                <button 
                                    className={styles.viewAllComments}
                                    onClick={() => setShowAllComments(true)}
                                >
                                    Voir les {comments.length} commentaires
                                </button>
                            )}
                        </>
                    ) : (
                        <div className={styles.noComments}>
                            <FaRegCommentDots size={40} />
                            <p>Aucun commentaire</p>
                            <span>Soyez le premier à commenter</span>
                        </div>
                    )}
                </div>
            </article>

            {/* Fixed comment input */}
            <div className={styles.commentInputContainer}>
                <img 
                    src={post.userPP || 'https://via.placeholder.com/32'} 
                    alt="Votre profil"
                    className={styles.commentInputAvatar}
                />
                <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Ajouter un commentaire..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleComment();
                        }
                    }}
                    className={styles.commentInput}
                />
                {commentText.trim() && (
                    <>
                        <button 
                            className={styles.clearBtn}
                            onClick={() => setCommentText('')}
                            aria-label="Effacer"
                        >
                            <FaTimes />
                        </button>
                        <button 
                            className={styles.sendBtn}
                            onClick={handleComment} 
                            disabled={isSubmitting}
                            aria-label="Envoyer"
                        >
                            {isSubmitting ? '...' : 'Publier'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PostPage;