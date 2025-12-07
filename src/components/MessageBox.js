import axios from 'axios';
import styles from './messageBox.module.css';
import { FaArrowLeft, FaEllipsisV, FaPen} from "react-icons/fa";
import { useEffect } from 'react';
import { useState } from 'react';
import profil from '../images/batimat.png'

const MessageBox = ({ setShowMessBox }) => {

  return (
    <div className={styles.messageBox}>
        <div className={styles.container}>
            <div className={styles.destinateur}>
                <div className='flexRow'>
                    <FaArrowLeft onClick={()=>setShowMessBox(false)}/>
                    <img src={profil} alt='profil'/>
                    <div className={styles.userMetadata}>
                        <p><strong>username</strong></p>
                        <p><span>En ligne</span></p>
                    </div>
                </div>
                <p><FaEllipsisV/></p>
            </div>
            <div className={styles.messages}>
            <div className={styles.destiBox}>
                <p>Je reçoi ce message de chez un amis</p>
                </div>
                <div className={styles.senderBox}>
                    <p>J'envoi ce message de à un amis</p>
                </div>
            </div>
            <div className={styles.messInput}>
                <textarea placeholder='Envoyer un message...' 
                    minRows={1}
                    maxRows={5}
                
                />
            </div>
        </div>
    </div>
  );
};

export default MessageBox;
