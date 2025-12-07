import styles from './articleEditor.module.css';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useState } from 'react';
import axios from 'axios';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage } from "react-icons/fa";
import Toast from './Toast';

const ArticleEditor = ({ back }) => {
    const [titleImg, setTitleImg] = useState(null);
    const [title, setTitle] = useState('');
    const [contenu, setContenu] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const token = localStorage.getItem('token');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: '<p>Commencez à écrire votre article...</p>',
        onUpdate: ({ editor }) => setContenu(editor.getHTML()),
    });

    const handleImgChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setTitleImg(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !contenu.trim()) {
            setToast('Veuillez ajouter un titre et du contenu avant de publier.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:8000/publication',
                { post: contenu, title, postPicture: titleImg, type: 'article' },
                { headers: { Authorization: `Bearer${token}` } }
            );
            setToast(response.data.message);
            window.location.reload();
        } catch (error) {
            setToast(error.response?.data?.message);
            console.error('Erreur :', error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className={styles.toolbar}>
                <button onClick={back} className={styles.backBtn}>← Retour</button>
                <div className={styles.tools}>
                    <button onClick={() => editor.chain().focus().toggleBold().run()}><FaBold /></button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()}><FaItalic /></button>
                    <button onClick={() => editor.chain().focus().toggleUnderline().run()}><FaUnderline /></button>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign("left").run()}><FaAlignLeft /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign("center").run()}><FaAlignCenter /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign("right").run()}><FaAlignRight /></button>
                </div>

                {isLoading ? (
                    <div className={styles.spinner}>
                        <p className={styles.btnInLoading}></p>
                    </div>
                ) : (
                    <button className={styles.submitBtn} onClick={handleSubmit}>PUBLIER</button>
                )}
            </div>
            <div className={styles.toast}>
                {toast && <Toast message={toast} setToast={setToast}/>}
            </div>
            <div className={styles.editor}>
                

                <main className={styles.article}>
                    <div className={styles.inputs}>
                        <div className={styles.imgInput}>
                            <label htmlFor="fileInput" className={styles.imgLabel}>
                                <FaImage size={24} /> Ajouter une image de couverture
                            </label>
                            <input type="file" id="fileInput" accept="image/*" onChange={handleImgChange} />
                        </div>
                        <input
                            type="text"
                            placeholder="Titre de l'article..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.titleInput}
                        />
                    </div>

                    {titleImg && (
                        <div className={styles.coverPreview}>
                            <img src={titleImg} alt="Couverture de l'article" />
                            <button className={styles.removeImg} onClick={() => setTitleImg(null)}>✖</button>
                        </div>
                    )}

                    <div className={styles.editorContainer}>
                        <EditorContent editor={editor} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ArticleEditor;
