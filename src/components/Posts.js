import styles from './posts.module.css';
import {
  FaEllipsisV, FaQuestionCircle, FaExclamationTriangle, FaCalendar,
  FaBriefcase, FaNewspaper, FaLightbulb, FaMapMarkerAlt, FaUsers,
  FaClock, FaCheckCircle, FaPlusCircle, FaHeart, FaRegHeart,
  FaRegCommentDots, FaPaperPlane, FaRegBookmark, FaBookmark
} from "react-icons/fa";
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Friend } from './Friend';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import { getNotif } from '../Utils/GetNotif';
import { API_URL } from '../Utils/api';
import { usePosts } from '../hooks/UsePosts';
import CloudinaryImage from '../Utils/CloudinaryImage';

/* ─── Config ──────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  announcement: { icon: FaCalendar,           color: '#1d9bf0', label: 'Annonce'     },
  alert:        { icon: FaExclamationTriangle, color: '#ff6b35', label: 'Alerte'      },
  event:        { icon: FaCalendar,            color: '#00ba7c', label: 'Événement'   },
  opportunity:  { icon: FaBriefcase,           color: '#1d9bf0', label: 'Opportunité' },
  news:         { icon: FaNewspaper,           color: '#f59e0b', label: 'Actualité'   },
  tip:          { icon: FaLightbulb,           color: '#06b6d4', label: 'Astuce'      },
};
const PRIORITY_CONFIG = {
  low:    { color: '#71767b', label: 'Basse'   },
  normal: { color: '#1d9bf0', label: 'Normale' },
  high:   { color: '#f59e0b', label: 'Haute'   },
  urgent: { color: '#ff6b35', label: 'Urgente' },
};
const CATEGORY_COLORS = {
  academic: '#1d9bf0', technical: '#1d9bf0', career: '#00ba7c',
  life: '#f59e0b', other: '#71767b', sport: '#00ba7c',
  culture: '#1d9bf0', education: '#1d9bf0', social: '#f59e0b', technology: '#06b6d4',
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const manageTime = (postDate) => {
  if (!postDate) return '';
  const diff = Date.now() - new Date(postDate);
  const s = Math.floor(diff / 1000), m = Math.floor(diff / 60000),
        h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (s < 60) return "maintenant";
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  if (d < 7)  return `${d}j`;
  if (d < 30) return `${Math.floor(d / 7)} sem`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo} mois` : `${Math.floor(d / 365)} an${Math.floor(d / 365) > 1 ? 's' : ''}`;
};

const fmtEvent = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/* ─── PostHeader ──────────────────────────────────────────────── */
const PostHeader = ({ post, userId, setRefresh, refresh, navigate }) => (
  <div className={styles.header}>
    <div className={styles.authorInfo}>
      <div className={styles.authorName}>
        <p onClick={() => navigate(`/profile/${post.userId}`)}>{post.username}</p>
        <Friend userId={userId} authorId={post.userId} authorFollowers={post.followers} setRefresh={setRefresh} refresh={refresh} />
      </div>
      <span className={styles.postTime}>{manageTime(post.createdAt)}</span>
    </div>
    <button className={styles.moreBtn}><FaEllipsisV /></button>
  </div>
);

/* ─── Actions bar ─────────────────────────────────────────────── */
const Actions = ({ post, userId, onLike, onComment, onShare, onSave, saved, processing }) => (
  <div className={styles.mobileActions}>
    <div className={styles.leftActions}>
      <button
        className={`${styles.mobileActionBtn} ${post.postLike?.includes(userId) ? styles.liked : ''}`}
        onClick={() => onLike(post._id, post.userId, post.postLike, post)}
        disabled={processing[`like-${post._id}`]}
      >
        {post.postLike?.includes(userId) ? <FaHeart className={styles.iconLiked} /> : <FaRegHeart />}
        {post.postLike?.length > 0 && <span className={styles.count}>{post.postLike.length}</span>}
      </button>

      <button className={styles.mobileActionBtn} onClick={() => onComment(post._id)}>
        <FaRegCommentDots />
        {post.postComment?.length > 0 && <span className={styles.count}>{post.postComment.length}</span>}
      </button>

      <button className={styles.mobileActionBtn} onClick={() => onShare(post)}>
        <FaPaperPlane />
        {post.sharing?.length > 0 && <span className={styles.count}>{post.sharing.length}</span>}
      </button>
    </div>

    <button
      className={`${styles.mobileActionBtn} ${saved ? styles.saved : ''}`}
      onClick={() => onSave(post._id)}
      disabled={processing[`save-${post._id}`]}
    >
      {saved ? <FaBookmark /> : <FaRegBookmark />}
    </button>
  </div>
);

/* ─── Comments section ────────────────────────────────────────── */
const Comments = ({ post, show, selectedId, text, onText, onFocus, onSubmit, loading, inputRef, navigate }) => (
  <>
    {show && (
      <div className={styles.commentsWrapper}>
        {post.postComment?.length > 0 ? (
          <>
            {post.postComment.slice(0, 3).map((c, i) => (
              <div key={i} className={styles.comment}>
                <img src={c.userPP || 'https://via.placeholder.com/32'} alt={c.username} className={styles.commentAvatar} />
                <div className={styles.commentBody}>
                  <div className={styles.commentBubble}>
                    <strong className={styles.commentUsername}>{c.username}</strong>
                    <p className={styles.commentText}>{c.commentary}</p>
                  </div>
                  <span className={styles.commentTime}>{manageTime(c.createdAt)}</span>
                </div>
              </div>
            ))}
            {post.postComment.length > 3 && (
              <button className={styles.viewAllComments} onClick={() => navigate(`/post/${post._id}`)}>
                Voir les {post.postComment.length} commentaires
              </button>
            )}
          </>
        ) : (
          <div className={styles.noComments}><FaRegCommentDots /><span>Aucun commentaire</span></div>
        )}
      </div>
    )}

    <div className={styles.commentInputWrapper}>
      <img src={post.userPP || 'https://via.placeholder.com/32'} alt="" className={styles.commentInputAvatar} />
      <input
        ref={selectedId === post._id ? inputRef : null}
        type="text"
        placeholder="Ajouter un commentaire..."
        value={selectedId === post._id ? text : ''}
        onChange={e => onText(e.target.value)}
        onFocus={() => onFocus(post._id)}
        onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(post._id, post.userId); } }}
        className={styles.commentInput}
      />
      {selectedId === post._id && text.trim() && (
        <button className={styles.sendCommentBtn} onClick={() => onSubmit(post._id, post.userId)} disabled={loading}>
          {loading ? '…' : 'Publier'}
        </button>
      )}
    </div>
  </>
);

/* ─── Individual post wrappers ────────────────────────────────── */
const PostWrap = ({ post, children, className }) => (
  <article className={className || styles.post}>
    <div className={styles.avatarCol}>
      <img src={post.userPP || 'https://via.placeholder.com/44'} alt={post.username} className={styles.avatar} />
    </div>
    <div className={styles.body}>
      {children}
    </div>
  </article>
);

/* ─── Main Posts component ────────────────────────────────────── */
const Posts = ({ userId, setRefresh, refresh }) => {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [textContent, setTextContent]       = useState('');
  const [isCommentLoading, setCommentLoad]  = useState(false);
  const [toast, setToast]                   = useState(null);
  const [savedPosts, setSavedPosts]         = useState([]);
  const [showComments, setShowComments]     = useState({});
  const [processing, setProcessing]         = useState({});
  const commentInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const { data: posts = [], isLoading, isError, error, refetch } = usePosts(token);

  useEffect(() => { if (refresh) refetch(); }, [refresh, refetch]);
  useEffect(() => { if (isError) setToast(error?.response?.data?.message || 'Erreur de chargement'); }, [isError, error]);
  useEffect(() => { if (selectedPostId && commentInputRef.current) commentInputRef.current.focus(); }, [selectedPostId]);

  const setProc = (key, val) => setProcessing(p => ({ ...p, [key]: val }));

  const handleLike = useCallback(async (postId, authorId, like, post) => {
    if (processing[`like-${postId}`]) return;
    setProc(`like-${postId}`, true);
    try {
      await axios.put(`${API_URL}/post/like`, { postId, authorId }, { headers: { Authorization: `Bearer${token}` } });
      refetch();
      if (userId !== authorId && !like.includes(userId))
        getNotif({ userId, authorId, message: "a aimé votre publication", type: 'like', post, token });
    } catch (e) { setToast(e.response?.data?.message || 'Erreur'); }
    finally { setProc(`like-${postId}`, false); }
  }, [processing, token, userId, refetch]);

  const handleComment = useCallback(async (postId, authorId) => {
    if (!textContent.trim() || isCommentLoading) return;
    setCommentLoad(true);
    try {
      const res = await axios.put(`${API_URL}/post/comment`,
        { commentary: textContent, currentPostId: postId, userId, authorId },
        { headers: { Authorization: `Bearer${token}` } }
      );
      refetch();
      setToast(res.data.message || 'Commentaire publié');
      if (userId !== authorId) getNotif({ userId, authorId, message: "a commenté votre publication", token });
      setTextContent(''); setSelectedPostId(null);
    } catch (e) { setToast(e.response?.data?.message || 'Erreur'); }
    finally { setCommentLoad(false); }
  }, [textContent, isCommentLoading, token, userId, refetch]);

  const handleShare = useCallback(async (post) => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.title || 'Publication', text: post.postText || '', url }); }
      catch (e) { if (e.name !== 'AbortError') { navigator.clipboard.writeText(url); setToast('Lien copié !'); } return; }
    } else { navigator.clipboard.writeText(url); setToast('Lien copié !'); }
    try { await axios.put(`${API_URL}/post/sharing`, { currentPostId: post._id, userId }, { headers: { Authorization: `Bearer ${token}` } }); refetch(); }
    catch (e) { console.error(e); }
  }, [token, userId, refetch]);

  const handleSave = useCallback((postId) => {
    if (processing[`save-${postId}`]) return;
    setProc(`save-${postId}`, true);
    setSavedPosts(p => p.includes(postId) ? p.filter(id => id !== postId) : [...p, postId]);
    setToast(savedPosts.includes(postId) ? 'Retiré des enregistrements' : 'Publication enregistrée');
    setProc(`save-${postId}`, false);
  }, [processing, savedPosts]);

  const toggleComments = useCallback((id) => setShowComments(p => ({ ...p, [id]: !p[id] })), []);

  /* Shared action/comment props */
  const actionProps = (post) => ({
    post, userId,
    onLike: handleLike, onComment: toggleComments,
    onShare: handleShare, onSave: handleSave,
    saved: savedPosts.includes(post._id), processing
  });

  const commentProps = (post) => ({
    post, show: showComments[post._id],
    selectedId: selectedPostId, text: textContent,
    onText: setTextContent, onFocus: setSelectedPostId,
    onSubmit: handleComment, loading: isCommentLoading,
    inputRef: commentInputRef, navigate
  });

  const headerProps = { userId, setRefresh, refresh, navigate };

  /* ─ Renderers ─ */
  const renderRegular = (post) => (
    <PostWrap key={post._id} post={post} className={post.postPicture ? styles.post : styles.textPost}>
      <PostHeader post={post} {...headerProps} />
      {post.postText && <p className={styles.postText}>{post.postText}</p>}
      {post.postPicture && (
        <div className={styles.imageWrapper} onClick={() => navigate(`/post/${post._id}`)}>
          <img src={post.postPicture} alt="post" loading="lazy" />
          {post.title && (
            <div className={styles.articleOverlay}>
              <h2>{post.title}</h2>
            </div>
          )}
        </div>
      )}
      <Actions {...actionProps(post)} />
      <Comments {...commentProps(post)} />
    </PostWrap>
  );

  const renderQuestion = (post) => {
    const d = post.post || {};
    return (
      <PostWrap key={post._id} post={post}>
        <PostHeader post={post} {...headerProps} />
        <div className={styles.badgeRow}>
          <span className={styles.typeBadge} style={{ background: 'rgba(29,155,240,0.1)', color: '#1d9bf0' }}>
            <FaQuestionCircle /> Question
          </span>
          {d.category && (
            <span className={styles.categoryBadge} style={{ background: CATEGORY_COLORS[d.category] + '18', color: CATEGORY_COLORS[d.category] }}>
              {d.category}
            </span>
          )}
        </div>
        <h3 className={styles.questionTitle}>{d.question}</h3>
        {d.details && <p className={styles.questionDetails}>{d.details}</p>}
        {d.tags?.length > 0 && (
          <div className={styles.tagsRow}>{d.tags.map((t, i) => <span key={i} className={styles.tag}>#{t}</span>)}</div>
        )}
        <Actions {...actionProps(post)} />
        <Comments {...commentProps(post)} />
      </PostWrap>
    );
  };

  const renderInfo = (post) => {
    const d = post.post || {};
    const cfg = TYPE_CONFIG[d.type] || TYPE_CONFIG.announcement;
    const pri = PRIORITY_CONFIG[d.priority] || PRIORITY_CONFIG.normal;
    const Icon = cfg.icon;
    return (
      <PostWrap key={post._id} post={post} className={d.priority === 'urgent' ? `${styles.post} ${styles.urgentPost}` : styles.post}>
        <PostHeader post={post} {...headerProps} />
        <div className={styles.badgeRow}>
          <span className={styles.typeBadge} style={{ background: cfg.color + '18', color: cfg.color }}>
            <Icon /> {cfg.label}
          </span>
          {d.priority && d.priority !== 'normal' && (
            <span className={styles.priorityBadge} style={{ background: pri.color }}>{pri.label}</span>
          )}
        </div>
        <h3 className={styles.infoTitle}>{d.title}</h3>
        <p className={styles.infoBody}>{d.content}</p>
        {d.imageUrl && <div className={styles.imageWrapper}><img src={d.imageUrl} alt="Info" /></div>}
        {post.publicId && <CloudinaryImage publicId={post.publicId} width={600} height={400} />}
        {d.link && <a href={d.link} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>🔗 En savoir plus</a>}
        <Actions {...actionProps(post)} />
        <Comments {...commentProps(post)} />
      </PostWrap>
    );
  };

  const renderEvent = (post) => {
    const d = post.post || {};
    return (
      <PostWrap key={post._id} post={post}>
        <PostHeader post={post} {...headerProps} />
        <div className={styles.badgeRow}>
          <span className={styles.typeBadge} style={{ background: '#00ba7c18', color: '#00ba7c' }}>
            <FaCalendar /> Événement
          </span>
          {d.category && (
            <span className={styles.categoryBadge} style={{ background: CATEGORY_COLORS[d.category] + '18', color: CATEGORY_COLORS[d.category] }}>
              {d.category}
            </span>
          )}
        </div>
        <h3 className={styles.eventTitle}>{d.title}</h3>
        <p className={styles.eventDescription}>{d.description}</p>
        {d.imageUri && <div className={styles.imageWrapper}><img src={d.imageUri} alt="Event" /></div>}
        <div className={styles.eventDetails}>
          {d.startDate && (
            <div className={styles.eventDetailRow}>
              <FaClock />
              <span>{fmtEvent(d.startDate)}{d.endDate && ` → ${fmtEvent(d.endDate)}`}</span>
            </div>
          )}
          {d.location && <div className={styles.eventDetailRow}><FaMapMarkerAlt /><span>{d.location}</span></div>}
          {d.maxParticipants && (
            <div className={styles.eventDetailRow}>
              <FaUsers /><span>{d.participants?.length || 0}/{d.maxParticipants} participants</span>
            </div>
          )}
        </div>
        <button className={`${styles.participateBtn} ${d.participants?.includes(userId) ? styles.participating : ''}`}>
          {d.participants?.includes(userId) ? <><FaCheckCircle /> Inscrit</> : <><FaPlusCircle /> Participer</>}
        </button>
        <Actions {...actionProps(post)} />
        <Comments {...commentProps(post)} />
      </PostWrap>
    );
  };

  const renderPost = (post) => {
    const type = post.post?.type || post.post?.postType;
    if (type === 'question')       return renderQuestion(post);
    if (post.post?.postType === 'info') return renderInfo(post);
    if (type === 'event')          return renderEvent(post);
    return renderRegular(post);
  };

  /* ─ States ─ */
  if (isLoading) return (
    <div className={styles.postsContainer}>
      <div className={styles.emptyState}><p>Chargement…</p></div>
    </div>
  );

  if (posts.length === 0) return (
    <div className={styles.postsContainer}>
      <div className={styles.emptyState}>
        <FaRegCommentDots size={48} />
        <h3>Aucune publication</h3>
        <p>Les publications de vos amis apparaîtront ici</p>
      </div>
    </div>
  );

  return (
    <div className={styles.postsContainer}>
      {toast && <Toast message={toast} setToast={setToast} />}
      {posts.map(renderPost)}
    </div>
  );
};

export default Posts;