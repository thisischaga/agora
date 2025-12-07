import styles from './text.module.css';
import { useState } from 'react';
import axios from 'axios';


const Comment = ({userId})=>{
    const [textContent, setTextContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem('token');
    
    const handleTextChange = (e)=>{
        setTextContent(e.target.value);
    }
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:8000/comment', 
                {commentary: textContent, /*currentPostId,*/ userId},
                {headers: {Authorization: `Bearer${token}`},
            })
            console.log(response.data.message);
        } catch (error) {
            console.log('Erreur :', error.response.data.message)
        } finally{
            setIsLoading(false);
            window.location.reload();
        }
        
    }

    return(
        <div >
            <main className={styles.article}>
                <div>
                    <h2>Commentaire</h2>
                    <div className={styles.inputs}>
                        <textarea placeholder='Commentez...' onChange={handleTextChange} value={textContent}/>
                    </div>
                    
                </div>
            </main>
        </div>
            
    );
};

export default Comment;