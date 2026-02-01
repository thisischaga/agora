import styles from './articleEditor.module.css';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaBold, 
    FaItalic, 
    FaUnderline, 
    FaListUl, 
    FaListOl,
    FaAlignLeft, 
    FaAlignCenter, 
    FaAlignRight, 
    FaImage,
    FaQuoteLeft,
    FaCode,
    FaUndo,
    FaRedo
} from "react-icons/fa";
import Toast from './Toast';

const ArticleEditor = ({ back }) => {
    const [titleImg, setTitleImg] = useState(null);
    const [title, setTitle] = useState('');
    const [contenu, setContenu] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [imageError, setImageError] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_TITLE_LENGTH = 100;

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: '<p>Commencez à écrire votre article...</p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setContenu(html);
            
            // Compter les caractères et mots
            const text = editor.getText();
            setCharCount(text.length);
            setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
        },
    });

    // Auto-save dans localStorage
    useEffect(() => {
        const autoSave = setInterval(() => {
            if (title || contenu !== '<p>Commencez à écrire votre article...</p>') {
                localStorage.setItem('article_draft', JSON.stringify({
                    title,
                    contenu,
                    titleImg,
                    timestamp: Date.now()
                }));
            }
        }, 30000); // Sauvegarde toutes les 30 secondes

        return () => clearInterval(autoSave);
    }, [title, contenu, titleImg]);

    // Charger le brouillon au montage
    useEffect(() => {
        const draft = localStorage.getItem('article_draft');
        if (draft) {
            try {
                const { title: draftTitle, contenu: draftContenu, titleImg: draftImg, timestamp } = JSON.parse(draft);
                
                // Ne charger que si le brouillon a moins de 24h
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    const loadDraft = window.confirm('Un brouillon a été trouvé. Voulez-vous le restaurer ?');
                    if (loadDraft) {
                        setTitle(draftTitle || '');
                        setTitleImg(draftImg || null);
                        if (editor && draftContenu) {
                            editor.commands.setContent(draftContenu);
                        }
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement du brouillon:', error);
            }
        }
    }, [editor]);

    const handleImgChange = (e) => {
        const file = e.target.files?.[0];
        setImageError('');

        if (!file) return;

        // Validation de la taille
        if (file.size > MAX_FILE_SIZE) {
            setImageError('L\'image ne doit pas dépasser 5MB');
            return;
        }

        // Validation du type
        if (!file.type.startsWith('image/')) {
            setImageError('Veuillez sélectionner une image valide');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setTitleImg(reader.result);
        reader.onerror = () => setImageError('Erreur lors de la lecture du fichier');
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            setToast('⚠️ Veuillez ajouter un titre à votre article.');
            return;
        }

        if (!contenu.trim() || contenu === '<p>Commencez à écrire votre article...</p>') {
            setToast('⚠️ Veuillez ajouter du contenu à votre article.');
            return;
        }

        if (wordCount < 50) {
            setToast('⚠️ Votre article doit contenir au moins 50 mots.');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(
                'http://localhost:8000/publication',
                { 
                    post: contenu, 
                    title, 
                    postPicture: titleImg, 
                    type: 'article' 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setToast('✅ ' + (response.data.message || 'Article publié avec succès !'));
            
            // Supprimer le brouillon après publication réussie
            localStorage.removeItem('article_draft');
            
            // Réinitialiser le formulaire
            setTimeout(() => {
                setTitle('');
                setTitleImg(null);
                setImageError('');
                if (editor) {
                    editor.commands.setContent('<p>Commencez à écrire votre article...</p>');
                }
                
                // Retour après un délai
                setTimeout(() => back(), 1500);
            }, 1000);
        } catch (error) {
            setToast('❌ ' + (error.response?.data?.message || 'Erreur lors de la publication'));
            console.error('Erreur :', error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearDraft = () => {
        if (window.confirm('Voulez-vous vraiment supprimer le brouillon ?')) {
            localStorage.removeItem('article_draft');
            setToast('🗑️ Brouillon supprimé');
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className={styles.container}>
            {/* Toolbar fixe en haut */}
            <div className={styles.toolbar}>
                <button onClick={back} className={styles.backBtn}>← Retour</button>

                <div className={styles.tools}>
                    {/* Formatage texte */}
                    <div className={styles.toolGroup}>
                        <button 
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={editor.isActive('bold') ? styles.isActive : ''}
                            title="Gras (Ctrl+B)"
                        >
                            <FaBold />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={editor.isActive('italic') ? styles.isActive : ''}
                            title="Italique (Ctrl+I)"
                        >
                            <FaItalic />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={editor.isActive('underline') ? styles.isActive : ''}
                            title="Souligné (Ctrl+U)"
                        >
                            <FaUnderline />
                        </button>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Titres */}
                    <div className={styles.toolGroup}>
                        <button 
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}
                            title="Titre 1"
                        >
                            H1
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}
                            title="Titre 2"
                        >
                            H2
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={editor.isActive('heading', { level: 3 }) ? styles.isActive : ''}
                            title="Titre 3"
                        >
                            H3
                        </button>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Listes */}
                    <div className={styles.toolGroup}>
                        <button 
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={editor.isActive('bulletList') ? styles.isActive : ''}
                            title="Liste à puces"
                        >
                            <FaListUl />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={editor.isActive('orderedList') ? styles.isActive : ''}
                            title="Liste numérotée"
                        >
                            <FaListOl />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={editor.isActive('blockquote') ? styles.isActive : ''}
                            title="Citation"
                        >
                            <FaQuoteLeft />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            className={editor.isActive('codeBlock') ? styles.isActive : ''}
                            title="Bloc de code"
                        >
                            <FaCode />
                        </button>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Alignement */}
                    <div className={styles.toolGroup}>
                        <button 
                            onClick={() => editor.chain().focus().setTextAlign("left").run()}
                            className={editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}
                            title="Aligner à gauche"
                        >
                            <FaAlignLeft />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().setTextAlign("center").run()}
                            className={editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}
                            title="Centrer"
                        >
                            <FaAlignCenter />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().setTextAlign("right").run()}
                            className={editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}
                            title="Aligner à droite"
                        >
                            <FaAlignRight />
                        </button>
                    </div>

                    <div className={styles.separator}></div>

                    {/* Historique */}
                    <div className={styles.toolGroup}>
                        <button 
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            title="Annuler (Ctrl+Z)"
                        >
                            <FaUndo />
                        </button>
                        <button 
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            title="Rétablir (Ctrl+Y)"
                        >
                            <FaRedo />
                        </button>
                    </div>
                </div>

                <div className={styles.rightActions}>
                    {isLoading ? (
                        <div className={styles.spinner}>
                            <div className={styles.btnInLoading}></div>
                        </div>
                    ) : (
                        <button className={styles.submitBtn} onClick={handleSubmit}>
                            PUBLIER
                        </button>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={styles.toastContainer}>
                    <Toast message={toast} setToast={setToast}/>
                </div>
            )}

            {/* Contenu principal */}
            <div className={styles.editor}>
                <main className={styles.article}>
                    {/* Section titre et image */}
                    <div className={styles.inputs}>
                        <div className={styles.imgInput}>
                            <label htmlFor="fileInput" className={styles.imgLabel}>
                                <FaImage size={20} />
                                <span>Ajouter une image de couverture</span>
                            </label>
                            <input 
                                type="file" 
                                id="fileInput" 
                                accept="image/*" 
                                onChange={handleImgChange} 
                            />
                        </div>
                        
                        {imageError && (
                            <p className={styles.errorText}>⚠️ {imageError}</p>
                        )}

                        <input
                            type="text"
                            placeholder="Titre de l'article..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.titleInput}
                            maxLength={MAX_TITLE_LENGTH}
                        />
                        <div className={styles.titleCounter}>
                            <span className={title.length > MAX_TITLE_LENGTH * 0.9 ? styles.warningCount : ''}>
                                {title.length} / {MAX_TITLE_LENGTH}
                            </span>
                        </div>
                    </div>

                    {/* Aperçu image de couverture */}
                    {titleImg && (
                        <div className={styles.coverPreview}>
                            <img src={titleImg} alt="Couverture de l'article" />
                            <button 
                                className={styles.removeImg} 
                                onClick={() => {
                                    setTitleImg(null);
                                    setImageError('');
                                }}
                                title="Supprimer l'image"
                            >
                                ✖
                            </button>
                        </div>
                    )}

                    {/* Éditeur de contenu */}
                    <div className={styles.editorContainer}>
                        <EditorContent editor={editor} />
                    </div>

                    {/* Statistiques */}
                    <div className={styles.stats}>
                        <span>{wordCount} mots</span>
                        <span>•</span>
                        <span>{charCount} caractères</span>
                        {wordCount < 50 && (
                            <>
                                <span>•</span>
                                <span className={styles.minWords}>
                                    Minimum 50 mots requis
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions brouillon */}
                    <div className={styles.draftActions}>
                        <button 
                            className={styles.clearDraftBtn}
                            onClick={clearDraft}
                        >
                            🗑️ Supprimer le brouillon
                        </button>
                        <span className={styles.autoSaveInfo}>
                            💾 Sauvegarde automatique toutes les 30s
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ArticleEditor;