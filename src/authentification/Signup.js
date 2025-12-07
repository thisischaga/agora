import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './signup.module.css';
import logo from '../images/logo.png';
import { FaUserCircle, FaEdit } from "react-icons/fa";
import axios from 'axios';
import Toast from "../components/Toast";

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userBirthday, setUserBirthday] = useState('');
  const [userPP, setUserPP] = useState();
  let followers = [];
  let following = [];
  const [toast, setToast] = useState(null);

  const [serverMessage, setServerMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1); // 1, 2, 3

  const handleImgChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUserPP(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!username || !userEmail || !userPassword)) {
      setToast("Veuillez remplir tous les champs !");
      return;
    }
    if (step === 2 && !userBirthday) {
      alert("Veuillez remplir ce champ !");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8000/signup', {
        username,
        userEmail,
        userPassword,
        userBirthday,
        userPP,
        followers,
        following,
      });
      setToast(response.data.message);
      localStorage.setItem('token', response.data.token);
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Erreur :', error.response?.data?.message || error.message);
      setToast(error.response?.data?.message || "Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} setToast={setToast}/>}
      {step > 1 && (
        <button className={styles.backBtn} onClick={prevStep}>Précédent</button>
      )}
      <div className={styles.signupBox}>
        <div className={styles.logo}>
          <img src={logo} alt="logo" />
          <h1>agora</h1>
        </div>

        {serverMessage && <p className={styles.serverMessage}>{serverMessage}</p>}

        {/* Step 1 */}
        {step === 1 && (
          <div className={styles.form}>
            <input type="text" placeholder="Pseudo" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" value={userPassword} onChange={e => setUserPassword(e.target.value)} />
            <button onClick={nextStep}>Suivant</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className={styles.form}>
            <h3>Votre anniversaire</h3>
            <input type="date" value={userBirthday} onChange={e => setUserBirthday(e.target.value)} />
            <button onClick={nextStep}>Suivant</button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className={styles.form}>
            <h3>Photo de profil</h3>
            {!userPP ? (
              <label htmlFor="fileInput" className={styles.imgInput}>
                <FaUserCircle size={130} color="gray" />
              </label>
            ) : (
              <div className={styles.profilContainer}>
                <img src={userPP} alt="profil" />
                <label htmlFor="fileInput" className={styles.editBtn}><FaEdit size={20} /></label>
              </div>
            )}
            <input type="file" id="fileInput" accept="image/*" onChange={handleImgChange} />

            <button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Chargement..." : "Envoyer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
