import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./amis.module.css";

const Amis = ({ setRefresh, refresh }) => {
    const [active, setActive] = useState("followers");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [amis, setAmis] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    const headers = {
        headers: { Authorization: `Bearer${token}` },
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [followersRes, followingRes, amisRes] = await Promise.all([
                axios.get("http://localhost:8000/amis/followers", headers),
                axios.get("http://localhost:8000/amis/following", headers),
                axios.get("http://localhost:8000/amis/all_friends", headers),
            ]);

            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
            setAmis(amisRes.data);
        } catch (err) {
            console.error("Erreur chargement amis :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refresh]);

    const handleFollowAction = async (authorId) => {
        try {
            await axios.put(
                "http://localhost:8000/back_follow",
                { authorId },
                headers
            );
            setRefresh((prev) => !prev);
        } catch (err) {
            console.error("Erreur action follow :", err);
        }
    };

    const renderUsers = (users, emptyText, btnLabel, btnClass) => {
        if (loading) {
            return <p className={styles.noUsers}>Chargement...</p>;
        }

        if (users.length === 0) {
            return <p className={styles.noUsers}>{emptyText}</p>;
        }

        return users.map((user) => (
            <div key={user.id || user._id} className={styles.userCard}>
                <div className={styles.userInfo}>
                    <img
                        src={user.pp}
                        alt={user.username}
                        className={styles.avatar}
                    />
                    <p>
                        <strong>{user.username}</strong>
                    </p>
                </div>
                <button
                    className={btnClass}
                    onClick={() => handleFollowAction(user.id)}
                >
                    {btnLabel}
                </button>
            </div>
        ));
    };

    return (
        <div className={styles.amisCont}>
            <h3>Vos amis</h3>

            <div className={styles.tabs}>
                <p
                    className={`${styles.option} ${
                        active === "followers" ? styles.active : ""
                    }`}
                    onClick={() => setActive("followers")}
                >
                    Followers
                </p>
                <p
                    className={`${styles.option} ${
                        active === "following" ? styles.active : ""
                    }`}
                    onClick={() => setActive("following")}
                >
                    Following
                </p>
                <p
                    className={`${styles.option} ${
                        active === "amis" ? styles.active : ""
                    }`}
                    onClick={() => setActive("amis")}
                >
                    Amis
                </p>
            </div>

            {active === "followers" &&
                renderUsers(
                    followers,
                    "Vous n'avez aucun follower",
                    "Suivre en retour",
                    styles.blueBtn
                )}

            {active === "following" &&
                renderUsers(
                    following,
                    "Aucun following",
                    "Retirer",
                    styles.neutreBtn
                )}

            {active === "amis" &&
                renderUsers(
                    amis,
                    "Vous n'avez aucun ami",
                    "Retirer",
                    styles.neutreBtn
                )}
        </div>
    );
};

export default Amis;
