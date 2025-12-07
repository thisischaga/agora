import axios from 'axios';
import styles from './messenger.module.css';
import { FaPen} from "react-icons/fa";
import { useEffect } from 'react';
import { useState } from 'react';

const Messenger = ({setShowMessBox }) => {
  const [amis, setAmis] = useState([]);
  const [fetchAmis, setFetchAmis] = useState(false);
  const token = localStorage.getItem('token');
  const fetchData = async ()=>{
      setFetchAmis(true)
      try {
        const amisResponse = await axios.get('http://localhost:8000/amis/all_friends', {
            headers: {Authorization: `Bearer${token}`}
        })
        const data = amisResponse.data;
        setAmis(data);
      } catch (error) {
          console.log('Erreur', error);
      }; 
  }
  return (
    <div className={styles.messenger}>
      <h3>Messagerie</h3>
      {!fetchAmis &&<div className={styles.tools}>
        <input type='text' placeholder='rechercher'/>
        <div className={styles.pen}>
          <p onClick={fetchData}><FaPen/></p>
        </div>
      </div>}
      {fetchAmis &&<div className={styles.tools}>
        <div className={styles.pen}>
          <button onClick={()=>setFetchAmis(false)} className={styles.backBtn}>Retour</button>
        </div>
      </div>}
      {/*<div className={styles.usersList}>
        {connectedUsers.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Aucun message</p>}
        {connectedUsers.map((user) => (
          <div key={user.userId} className={styles.userCard}>
            <img src={user.userPP} alt={`${user.username} profil`} className={styles.avatar} />
            <div className={styles.userInfo}>
              <p><strong>{user.username}</strong></p>
              <span className={styles.status}>En ligne</span>
            </div>
          </div>
        ))}
      </div>*/}
      

      {fetchAmis &&(<div className={styles.usersList}>
        {amis.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Aucun message</p>}
        {amis.map((user) => (
          <div key={user.userId} className={styles.userCard} onClick={()=>setShowMessBox(true)}>
            <img src={user.pp} alt={`${user.username} profil`} className={styles.avatar} />
            <div className={styles.userInfo}>
              <p><strong>{user.username}</strong></p>
              {/*<span className={styles.lastMess}>Dernier message...</span>*/}
            </div>
          </div>
        ))}
      </div>)}
    </div>
  );
};

export default Messenger;
