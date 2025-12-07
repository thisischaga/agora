import axios from "axios";
import styles from './friends.module.css';
import { useEffect, useState } from "react";

export const Friend = ({ userId, authorId, setRefresh, refresh }) => {
  const [followings, setFollowings] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [amis, setAmis] = useState([]);
  const token = localStorage.getItem('token');

  // Récupérer les followings de l'utilisateur
  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const followingResponse = await axios.get('http://localhost:8000/following', {
          headers: { Authorization: `Bearer${token}` }
        });
        setFollowings(followingResponse.data || []);
      } catch (err) {
        console.error('Erreur fetch followings:', err);
      }
      try {
        const folllowersResponse = await axios.get('http://localhost:8000/followers', {
          headers: { Authorization: `Bearer${token}` }
        });
        setFollowers(folllowersResponse.data || []);
      } catch (err) {
        console.error('Erreur fetch followings:', err);
      }
      try {
        const folllowersResponse = await axios.get('http://localhost:8000/amis', {
          headers: { Authorization: `Bearer${token}` }
        });
        setAmis(folllowersResponse.data || []);
      } catch (err) {
        console.error('Erreur fetch followings:', err);
      }
    };
    fetchFollowings();
  }, [token, refresh]);

  const handleFollow = async () => {
    try {
      const response = await axios.put(
        'http://localhost:8000/follow',
        { authorId },
        { headers: { Authorization: `Bearer${token}` } }
      );
      setFollowings(response.data.userFollowings || []);
      setRefresh(prev => !prev);
    } catch (err) {
      console.error('Erreur : ', err);
    }
  };

  const handleBackFollow = async () => {
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

  if (authorId === userId) return null;

  const isFollowing = followings.includes(authorId);
  const isFollowed = followers.includes(authorId);
  const isFriends = amis.includes(authorId);

  return (
    <>
      {!isFriends&& <button
        className={isFollowing ? styles.followingBtn : styles.followBtn}
        onClick={handleFollow}
      >
        {isFollowing ? 'Suivi(e)' : 'Suivre'}
      
      </button>}
      {!isFollowed || isFriends && <button
          className={!isFriends?styles.followBtn: 'hidden'}
          onClick={handleBackFollow}
        >
          suivre en retour
        </button>}
      {isFriends &&<button className={isFriends?styles.followingBtn: 'hidden'}>Ami(e)</button>}
      
    </>
  );
};
