import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaUserCircle } from "react-icons/fa";
import styles from "./forums.module.css";

const Forums = ({pp, userId, username}) => {
  const [toCreate, setToCreate] = useState(false);
  const [forumPP, setForumPP] = useState(null);
  const [forumName, setForumName] = useState("");
  const [forumDescription, setForumDescription] = useState("");

  const [rooms, setRooms] = useState([]);

  const token = localStorage.getItem("token");

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
      alert("Tous les champs sont obligatoires.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/room/create",
        {
          name: forumName,
          roomPP: forumPP,
          bio: forumDescription,
          members:[
            {
                userId: userId,
                userPP: pp,
                username: username,
            }
          ]
        },
        {
          headers: {Authorization: `Bearer${token}`}
        }
      );

      alert("Forum créé !");
      console.log("Nouveau forum :", res.data);

      setToCreate(false);
      setForumName("");
      setForumDescription("");
      setForumPP(null);

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du forum");
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
            
    }, []);

    return (
        <div className={styles.forums}>
        <h3>Vos forums</h3>

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
                {rooms.length === 0 && <p className={styles.noUsers} style={{textAlign: 'center'}}>Vous n'avez aucun follower</p>}
                {rooms.map((room) => (
                    
                    <div key={room.id} className={styles.forumCard}>
                                
                        <div className={styles.roomInfo}>
                            <div className={styles.roomData}>
                                <img src={room.roomPP} alt={`${room.name} profil`} className={styles.avatar} />
                                <div className="flexColum">
                                  <p><strong>{room.name} </strong></p><br/>
                                  <p><span> {room.members.length} {room.members.length < 1 ?'membre': 'membres'}</span></p>
                                </div>
                                <button>Rejoindre</button>
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
    );
};

export default Forums;
