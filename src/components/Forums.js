import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaUserCircle } from "react-icons/fa";
import styles from "./forums.module.css";
import Toast from "./Toast";
import { useNavigate, useNavigation } from "react-router-dom";

const Forums = ({userId, setRefresh, refresh}) => {
    const [toCreate, setToCreate] = useState(false);
    const [forumPP, setForumPP] = useState(null);
    const [forumName, setForumName] = useState("");
    const [forumDescription, setForumDescription] = useState("");

    const [rooms, setRooms] = useState([]);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleImgChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setForumPP(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const createForum = async () => {
      if (!forumName || !forumDescription || !forumPP) {
        setToast("Tous les champs sont obligatoires.");
        return;
      }
      try {
        setRefresh(prev => !prev);
        const res = await axios.post(
          "http://localhost:8000/room/create",
          {
            name: forumName,
            roomPP: forumPP,
            bio: forumDescription,
            members:[userId]
          },
          {
            headers: {Authorization: `Bearer${token}`}
          }
        );
        setToast(res.data.message);

        setToCreate(false);
        setForumName("");
        setForumDescription("");
        setForumPP(null);

      } catch (err) {
        console.error(err);
        setToast("Erreur lors de la création du forum");
      }
    };
    const join = async (roomId) => {
      
      try {
        setRefresh(prev => !prev);
        const res = await axios.put(
          "http://localhost:8000/room/join",
          {
            roomId, userId
          },
          {
            headers: {Authorization: `Bearer${token}`}
          }
        );
        setToast(res.data.message)

      } catch (err) {
        console.error(err);
        setToast("Erreur");
      }
    };
    useEffect(() => {
        const fetchData = async ()=>{

          try {
              const response = await axios.get('http://localhost:8000/rooms', {
                  headers: {Authorization: `Bearer${token}`}
              })
              const data = response.data;
              setRooms(data);
          } catch (error) {
              console.log('Erreur', error);
          }; 
      }
      fetchData();
            
    }, [refresh]);

    const toTheRoom = (id)=>{
        navigate(`/room/${id}`)
    }
    return (
      <div>
        {toast && <Toast message={toast} setToast={setToast}/>}
        <div className={styles.forums}>
            
            <h3>Vos communautés</h3>

            {!toCreate && (
                <div>
                    <div className={styles.tools}>
                        <input type="text" placeholder="Rechercher" />
                        <div className={styles.add}>
                            <p onClick={() => setToCreate(true)}>
                                <FaPlus />
                            </p>
                        </div>
                    </div>
                    
                    {rooms.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Aucun salon de discussion</p>}
                    {rooms.map((room) => (
                        
                        <div key={room._id} className={styles.forumCard}>
                                    
                            <div className={styles.roomInfo}>
                                <div className={styles.roomData}>
                                    <img src={room.roomPP} alt={`${room.name} profil`} className={styles.avatar} />
                                    <div className={styles.dataInColum}>
                                      <p><strong>{room.name} </strong></p><br/>

                                    </div>
                                    <div className={styles.buttons}>
                                      {room.members.includes(userId) && <button className={styles.whiteLight} onClick={()=> toTheRoom(room._id)}> Discussion </button>} 
                                      {!room.members.includes(userId) && <button onClick={()=> join(room._id)} className={styles.blueLight}> Rejoindre </button>} 
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {toCreate && (
                <div className={styles.formContainer}>
                <button className={styles.backBtn} onClick={() => setToCreate(false)}>
                    Retour
                </button>

                <div className={styles.form}>
                    <h4>Créer un forum</h4>

                    <label className={styles.imgInput}>
                    {!forumPP ? (
                        <FaUserCircle size={130} color="gray" />
                    ) : (
                        <div className={styles.profilContainer}>
                        <img src={forumPP} alt="forum" />
                        <FaEdit className={styles.editBtn} size={20} />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImgChange} style={{ display: "none" }} />
                    </label>

                    <input
                        type="text"
                        placeholder="Nom du forum"
                        value={forumName}
                        onChange={(e) => setForumName(e.target.value)}
                    />

                    <textarea
                        placeholder="Ajoutez une description"
                        value={forumDescription}
                        onChange={(e) => setForumDescription(e.target.value)}
                    />

                    <button onClick={createForum}>Créer</button>
                </div>
                </div>
            )}
        </div>
      </div>
    );
};

export default Forums;
