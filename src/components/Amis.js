import { useState } from 'react';
import styles from './amis.module.css';
import { useEffect } from 'react';
import axios from 'axios';

const Amis = ({ pp, connectedUsers, setRefresh, refresh }) => {

  const [active, setActive] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [amis, setAmis] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async ()=>{
              
        try {
            const followersResponse = await axios.get('http://localhost:8000/amis/followers', {
                headers: {Authorization: `Bearer${token}`}
            })
            const data = followersResponse.data;
            setFollowers(data);
        } catch (error) {
            console.log('Erreur', error);
        };  

        try {
            const followingResponse = await axios.get('http://localhost:8000/amis/following', {
                headers: {Authorization: `Bearer${token}`}
            })
            const data = followingResponse.data;
            setFollowing(data);
        } catch (error) {
            console.log('Erreur', error);
        };  

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
    fetchData();
          
  }, [refresh]);
  const handleBackFollow = async (authorId) => {
    try {
      const response = await axios.put(
        'http://localhost:8000/back_follow',
        { authorId },
        { headers: { Authorization: `Bearer${token}` } }
      );
      setAmis(response.data.userFollowings || []);
      setRefresh(prev => !prev);
    } catch (err) {
      console.error('Erreur : ', err);
    }
  };
  const updateIsActive = (activeContent)=>{
    setActive(activeContent);
    setRefresh(prev => !prev);
  }
  return (
    <div className={styles.amisCont}>
      <h3>Vos amis</h3>
      <div className='flexRow'>
        <p onClick={()=>{updateIsActive('followers')}} className={`${styles.option} ${active ==='followers' ? styles.active : ""}`} >followers</p>
        <p onClick={()=>{updateIsActive('following')}} className={`${styles.option} ${active ==='following' ? styles.active : ""}`}>following</p>
        <p onClick={()=>{updateIsActive('amis')}} className={`${styles.option} ${active ==='amis' ? styles.active : ""}`}>amis</p>
      </div>
      <div className={active === 'followers'? styles.followers:'hidden'} >
        {followers.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Vous n'avez aucun follower</p>}
        {followers.map((user) => (
            <div key={user.id} className={styles.userCard}>
                
                <div className={styles.userInfo}>
                    <img src={user.pp} alt={`${user.username} profil`} className={styles.avatar} />
                    <p><strong>{user.username}</strong></p>
                </div>
                <button className={styles.blueBtn} onClick={()=>handleBackFollow(user.id)} >suivre en retour</button>
            </div>
        ))}
      </div>
      <div className={active === 'following'? styles.followers:'hidden'}>
        {following.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Aucun following</p>}
        {following.map((user) => (
            <div key={user.id} className={styles.userCard}>
                
                <div className={styles.userInfo}>
                    <img src={user.pp} alt={`${user.username} profil`} className={styles.avatar} />
                    <p><strong>{user.username}</strong></p>
                </div>
                <button className={styles.neutreBtn} onClick={()=>handleBackFollow(user.id)}>retirer</button>
            </div>
        ))}
      </div>
      <div className={active === 'amis'? styles.followers:'hidden'}>
        {amis.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Vous n'avez aucun ami</p>}
        {amis.map((user) => (
            <div key={user.id} className={styles.userCard}>
                
                <div className={styles.userInfo}>
                    <img src={user.pp} alt={`${user.username} profil`} className={styles.avatar} />
                    <p><strong>{user.username}</strong></p>
                </div>
                <button className={styles.neutreBtn} onClick={()=>handleBackFollow(user.id)}>retirer</button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Amis;
