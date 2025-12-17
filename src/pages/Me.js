import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import Posts from "../components/Posts";
import Amis from "../components/Amis";
import styles from "./me.module.css";

const Me = () => {
  // Données fictives
  const userData = {
    username: "John Doe",
    userPP: "https://via.placeholder.com/120",
    bio: "Développeur passionné de React et Node.js.",
    postsCount: 12,
    userId: "12345",
  };

  const friends = [
    { id: "1", username: "Alice", pp: "https://via.placeholder.com/50" },
    { id: "2", username: "Bob", pp: "https://via.placeholder.com/50" },
    { id: "3", username: "Charlie", pp: "https://via.placeholder.com/50" },
  ];

  const followers = [
    { id: "4", username: "David", pp: "https://via.placeholder.com/50" },
    { id: "5", username: "Eve", pp: "https://via.placeholder.com/50" },
  ];

  const following = [
    { id: "6", username: "Frank", pp: "https://via.placeholder.com/50" },
  ];

  const [editingProfile, setEditingProfile] = useState(false);

  return (
    <div>
      <header className={styles.header}>
        <h1>Mon Profil</h1>
      </header>

      <main className={styles.mainContainer}>
        {/* Profil utilisateur */}
        <section className={styles.profileSection}>
          <div className={styles.profileCard}>
            <img src={userData.userPP} alt="Profil" className={styles.avatar} />
            <div className={styles.profileInfo}>
              <h2>{userData.username}</h2>
              <p>{userData.bio}</p>

              <div className={styles.stats}>
                <span>Posts: {userData.postsCount}</span>
                <span>Amis: {friends.length}</span>
                <span>Followers: {followers.length}</span>
                <span>Following: {following.length}</span>
              </div>

              <button
                className={styles.editBtn}
                onClick={() => setEditingProfile(true)}
              >
                <FaEdit /> Modifier Profil
              </button>
            </div>
          </div>
        </section>

        {/* Section posts */}
        <section className={styles.postsSection}>
          <h3>Mes publications</h3>
          {/* Pour l'instant on peut mettre un composant fictif ou un message */}
          <div className={styles.placeholderPosts}>
            <p>Aucune publication réelle pour l'instant.</p>
          </div>
        </section>

        {/* Section amis */}
        <section className={styles.amisSection}>
          <h3>Mes amis</h3>
          <div className={styles.placeholderFriends}>
            {friends.map((friend) => (
              <div key={friend.id} className={styles.friendCard}>
                <img src={friend.pp} alt={friend.username} />
                <p>{friend.username}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Edition profil */}
        {editingProfile && (
          <div className={styles.editProfileModal}>
            <h3>Modifier le profil</h3>
            <p>Interface de modification fictive ici.</p>
            <button onClick={() => setEditingProfile(false)}>Fermer</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Me;
