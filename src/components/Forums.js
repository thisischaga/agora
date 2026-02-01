import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import { FaEdit, FaPlus, FaUserCircle, FaSearch } from "react-icons/fa";
import styles from "./forums.module.css";
import Toast from "./Toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../Utils/api';

const API_BASE_URL = API_URL;

const Forums = ({ userId, setRefresh, refresh }) => {
    const [toCreate, setToCreate] = useState(false);
    const [forumPP, setForumPP] = useState(null);
    const [forumName, setForumName] = useState("");
    const [forumDescription, setForumDescription] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [rooms, setRooms] = useState([]);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [joiningRooms, setJoiningRooms] = useState(new Set());

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // ✅ Validation et gestion de l'image
    const handleImgChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérification de la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToast("L'image est trop volumineuse (max 5MB)");
            return;
        }

        // Vérification du type
        if (!file.type.startsWith("image/")) {
            setToast("Format de fichier invalide");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setForumPP(reader.result);
        reader.onerror = () => setToast("Erreur lors de la lecture du fichier");
        reader.readAsDataURL(file);
    }, []);

    // ✅ Création de forum avec validation
    const createForum = useCallback(async () => {
        // Validation
        if (!forumName.trim()) {
            setToast("Le nom du forum est requis");
            return;
        }

        if (forumName.length < 3) {
            setToast("Le nom doit contenir au moins 3 caractères");
            return;
        }

        if (!forumDescription.trim()) {
            setToast("La description est requise");
            return;
        }

        if (!forumPP) {
            setToast("Une image est requise");
            return;
        }

        setIsCreating(true);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/room/create`,
                {
                    name: forumName.trim(),
                    roomPP: forumPP,
                    bio: forumDescription.trim(),
                    members: [userId]
                },
                {
                    headers: { Authorization: `Bearer${token}` },
                    timeout: 10000
                }
            );

            setToast(res.data.message || "Forum créé avec succès");
            
            // Réinitialiser le formulaire
            setToCreate(false);
            setForumName("");
            setForumDescription("");
            setForumPP(null);

            // Rafraîchir la liste
            setRefresh(prev => !prev);

        } catch (err) {
            console.error("❌ Erreur création:", err);
            const errorMsg = err.response?.data?.message || "Erreur lors de la création du forum";
            setToast(errorMsg);

            // Redirection si non autorisé
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsCreating(false);
        }
    }, [forumName, forumDescription, forumPP, userId, token, setRefresh, navigate]);

    // ✅ Rejoindre/Quitter un forum
    const toggleJoin = useCallback(async (roomId) => {
        // Empêcher les clics multiples
        if (joiningRooms.has(roomId)) return;

        setJoiningRooms(prev => new Set(prev).add(roomId));

        try {
            const res = await axios.put(
                `${API_BASE_URL}/room/join`,
                { roomId, userId },
                {
                    headers: { Authorization: `Bearer${token}` },
                    timeout: 5000
                }
            );

            setRefresh(prev => !prev);

        } catch (err) {
            console.error("❌ Erreur join:", err);
            const errorMsg = err.response?.data?.message || "Erreur lors de l'opération";
            setToast(errorMsg);

            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setJoiningRooms(prev => {
                const newSet = new Set(prev);
                newSet.delete(roomId);
                return newSet;
            });
        }
    }, [userId, token, setRefresh, navigate, joiningRooms]);

    // ✅ Charger les rooms
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/rooms`, {
                    headers: { Authorization: `Bearer${token}` },
                    timeout: 10000
                });
                
                setRooms(response.data || []);
            } catch (error) {
                console.error("❌ Erreur chargement rooms:", error);
                setToast("Impossible de charger les forums");

                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refresh, token, navigate]);

    // ✅ Filtrage des rooms par recherche
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;

        const query = searchQuery.toLowerCase();
        return rooms.filter(room => 
            room.name.toLowerCase().includes(query) ||
            room.bio?.toLowerCase().includes(query)
        );
    }, [rooms, searchQuery]);

    // ✅ Navigation vers une room
    const navigateToRoom = useCallback((roomId) => {
        navigate(`/room/${roomId}`);
    }, [navigate]);

    // ✅ Annuler la création
    const cancelCreation = useCallback(() => {
        setToCreate(false);
        setForumName("");
        setForumDescription("");
        setForumPP(null);
    }, []);

    return (
        <div>
            {toast && <Toast message={toast} setToast={setToast} />}
            
            <div className={styles.forums}>
                <h3>Vos communautés</h3>

                {!toCreate && (
                    <div>
                        <div className={styles.tools}>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            
                            <div className={styles.add}>
                                <p onClick={() => setToCreate(true)}>
                                    <FaPlus />
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <p className={styles.noUsers}>Chargement...</p>
                        ) : (
                            <>
                                {filteredRooms.length === 0 ? (
                                    <p className={styles.noUsers}>
                                        {searchQuery 
                                            ? "Aucun résultat" 
                                            : "Aucun salon de discussion"}
                                    </p>
                                ) : (
                                    filteredRooms.map((room) => (
                                        <div key={room._id} className={styles.forumCard}>
                                            <div className={styles.roomInfo}>
                                                <div className={styles.roomData}>
                                                    <img 
                                                        src={room.roomPP} 
                                                        alt={room.name}
                                                        className={styles.avatar}
                                                        onError={(e) => {
                                                            e.target.src = '/default-room.png';
                                                        }}
                                                    />
                                                    
                                                    <div className={styles.dataInColum}>
                                                        <p><strong>{room.name}</strong></p>
                                                        {room.bio && (
                                                            <span>
                                                                {room.bio.length > 30 
                                                                    ? `${room.bio.substring(0, 30)}...` 
                                                                    : room.bio}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={styles.buttons}>
                                                        {room.members?.includes(userId) ? (
                                                            <>
                                                                <button 
                                                                    className={styles.whiteLight}
                                                                    onClick={() => navigateToRoom(room._id)}
                                                                >
                                                                    Ouvrir
                                                                </button>
                                                                <button 
                                                                    className={styles.redLight}
                                                                    onClick={() => toggleJoin(room._id)}
                                                                    disabled={joiningRooms.has(room._id)}
                                                                >
                                                                    {joiningRooms.has(room._id) ? "..." : "Quitter"}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button 
                                                                className={styles.blueLight}
                                                                onClick={() => toggleJoin(room._id)}
                                                                disabled={joiningRooms.has(room._id)}
                                                            >
                                                                {joiningRooms.has(room._id) ? "..." : "Rejoindre"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Formulaire de création */}
                {toCreate && (
                    <div className={styles.formContainer}>
                        <button 
                            className={styles.backBtn} 
                            onClick={cancelCreation}
                            disabled={isCreating}
                        >
                            ← Retour
                        </button>

                        <div className={styles.form}>
                            <h4>Créer un forum</h4>

                            <label className={styles.imgInput}>
                                {!forumPP ? (
                                    <FaUserCircle size={130} />
                                ) : (
                                    <div className={styles.profilContainer}>
                                        <img src={forumPP} alt="Aperçu" />
                                        <FaEdit className={styles.editBtn} size={20} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImgChange}
                                    disabled={isCreating}
                                    style={{ display: "none" }}
                                />
                            </label>

                            <input
                                type="text"
                                placeholder="Nom du forum"
                                value={forumName}
                                onChange={(e) => setForumName(e.target.value)}
                                disabled={isCreating}
                                maxLength={50}
                            />

                            <textarea
                                placeholder="Description"
                                value={forumDescription}
                                onChange={(e) => setForumDescription(e.target.value)}
                                disabled={isCreating}
                                maxLength={500}
                            />

                            <button
                                onClick={createForum}
                                disabled={isCreating}
                            >
                                {isCreating ? "Création..." : "Créer"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Forums;