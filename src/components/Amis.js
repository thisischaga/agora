import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "./amis.module.css";
import { API_URL } from '../Utils/api';
import Menu from './Menu';
import { useNavigate } from 'react-router-dom';

const TABS = ["followers", "following", "amis"];

const LABELS = {
  followers: { empty: "Vous n'avez aucun follower", btn: "Suivre",        cls: "blueBtn"   },
  following: { empty: "Vous ne suivez personne",     btn: "Ne plus suivre", cls: "dangerBtn" },
  amis:      { empty: "Vous n'avez aucun ami",       btn: "Retirer",       cls: "neutreBtn" },
};

const Amis = ({ setRefresh, refresh, pp, active: appActive, setActive: setAppActive }) => {
  const [tab, setTab]               = useState("followers");
  const [followers, setFollowers]   = useState([]);
  const [following, setFollowing]   = useState([]);
  const [amis, setAmis]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchQuery, setSearch]    = useState("");
  const [processingIds, setProc]    = useState(new Set());
  const [isMobile, setIsMobile]     = useState(false);

  const token = localStorage.getItem("token");
  const headers = { headers: { Authorization: `Bearer${token}` } };

  useEffect(() => {
    const check = () =>
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [f, fw, a] = await Promise.all([
        axios.get(`${API_URL}/amis/followers`, headers),
        axios.get(`${API_URL}/amis/following`, headers),
        axios.get(`${API_URL}/amis/all_friends`, headers),
      ]);
      setFollowers(f.data || []);
      setFollowing(fw.data || []);
      setAmis(a.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refresh]);

  const handleAction = async (userId) => {
    if (processingIds.has(userId)) return;
    setProc(p => new Set(p).add(userId));
    try {
      await axios.put(`${API_URL}/back_follow`, { authorId: userId }, headers);
      setRefresh(p => !p);
    } catch (err) {
      console.error(err);
    } finally {
      setProc(p => { const s = new Set(p); s.delete(userId); return s; });
    }
  };

  const counts = { followers: followers.length, following: following.length, amis: amis.length };

  const filteredUsers = useMemo(() => {
    const map = { followers, following, amis };
    const list = map[tab] || [];
    if (!searchQuery.trim()) return list;
    return list.filter(u =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tab, followers, following, amis, searchQuery]);

  const { empty, btn, cls } = LABELS[tab];

  return (
    <>
      <aside className={styles.amisCont}>

        <div className={styles.header}>
          <h2>Vos amis</h2>
          
        </div>

        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un ami..."
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearch("")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.active : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {counts[t] > 0 && <span className={styles.tabBadge}>{counts[t]}</span>}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Chargement...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className={styles.emptyText}>{searchQuery ? "Aucun résultat" : empty}</p>
            </div>
          ) : (
            <div className={styles.usersList}>
              {filteredUsers.map(user => {
                const uid = user.id || user._id;
                const processing = processingIds.has(uid);
                return (
                  <div key={uid} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatarWrapper}>
                        <img
                          src={user.pp || "https://via.placeholder.com/48"}
                          alt={user.username}
                          className={styles.avatar}
                        />
                        {user.isOnline && <span className={styles.onlineBadge} />}
                      </div>
                      <div className={styles.userDetails}>
                        <p className={styles.username}>{user.displayName || user.username}</p>
                        {user.displayName && <p className={styles.handle}>@{user.username}</p>}
                        {user.mutualFriends && (
                          <p className={styles.mutualFriends}>{user.mutualFriends} ami(s) en commun</p>
                        )}
                      </div>
                    </div>
                    <button
                      className={`${styles[cls]} ${processing ? styles.processing : ""}`}
                      onClick={() => handleAction(uid)}
                      disabled={processing}
                    >
                      {processing ? <span className={styles.btnSpinner} /> : btn}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </aside>

      {isMobile && <Menu pp={pp} active={appActive} setActive={setAppActive} />}
    </>
  );
};

export default Amis;