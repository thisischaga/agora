import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './login.module.css';
import logo from '../images/logo.png';
import axios from 'axios';
import Toast from "../components/Toast";

const Login = () => {
  const navigate = useNavigate();

  const [serverMessage, setServerMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleUserEmailChange = (e) => setUserEmail(e.target.value);
  const handleUserPasswordChange = (e) => setUserPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail || !userPassword) {
      setToast("Veuillez remplir tous les champs !");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8000/login', { userEmail, userPassword });
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
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" />
          <h1>agora</h1>
        </div>
        <h2>Se connecter</h2>
        {/*serverMessage && <p className={styles.serverMessage}>{serverMessage}</p>*/}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Votre adresse Email"
            value={userEmail}
            onChange={handleUserEmailChange}
            required
          />
          <input
            type="password"
            placeholder="Entrez un mot de passe"
            value={userPassword}
            onChange={handleUserPasswordChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className={styles.signupLink}>
          Je n'ai pas encore de compte <a href="/signup">Créer un compte</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
