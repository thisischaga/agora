import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './signup.module.css';
import { API_URL } from '../Utils/api';

const Signup = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [birthday, setBirthday] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null);
    const backendURL = API_URL;

    useEffect(() => {
        // Progress animation
        const progressBar = document.querySelector(`.${styles.progressBar}`);
        if (progressBar) {
            progressBar.style.width = `${(step / 5) * 100}%`;
        }
    }, [step]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const next = () => {
        setErrors({});

        if (step === 1) {
            if (!email.trim()) {
                setErrors({ email: 'L\'adresse e-mail est requise' });
                return;
            }
            if (!validateEmail(email.trim())) {
                setErrors({ email: 'Adresse e-mail invalide' });
                return;
            }
        }

        if (step === 2) {
            if (!password.trim()) {
                setErrors({ password: 'Le mot de passe est requis' });
                return;
            }
            if (password.trim().length < 6) {
                setErrors({ password: 'Le mot de passe doit contenir au moins 6 caractères' });
                return;
            }
        }

        if (step === 3) {
            if (!username.trim()) {
                setErrors({ username: 'Le nom d\'utilisateur est requis' });
                return;
            }
            if (username.trim().length < 3) {
                setErrors({ username: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
                return;
            }
        }

        setStep(step + 1);
    };

    const back = () => {
        setErrors({});
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!birthday) {
            setErrors({ birthday: "Veuillez sélectionner votre date de naissance" });
            return;
        }

        try {
            setIsLoading(true);

            let base64Image = null;
            if (imageFile) {
                const reader = new FileReader();
                base64Image = await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });
            }

            const response = await axios.post(`${backendURL}/signup`, {
                username: username.trim(),
                userEmail: email.trim(),
                userPassword: password.trim(),
                userBirthday: birthday,
                userPP: base64Image,
                followers: [],
                following: [],
            });

            const data = response?.data;
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                navigate('/home');
            } else {
                setErrors({ submit: data?.message || 'Erreur lors de la création du compte' });
            }
        } catch (error) {
            console.error('Erreur inscription:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la création du compte';
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && step < 5) {
            next();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {step > 1 && (
                    <button className={styles.backButton} onClick={back}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                )}
                <div className={styles.headerRight}>
                    <span className={styles.stepText}>Étape {step}/5</span>
                </div>
            </div>

            <div className={styles.progressBarContainer}>
                <div className={styles.progressBar}></div>
            </div>

            <div className={styles.content}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h1 className={styles.title}>Votre adresse e-mail</h1>
                            <p className={styles.subtitle}>
                                Entrez l'adresse e-mail que vous utiliserez pour vous connecter
                            </p>
                            <div className={`${styles.inputContainer} ${errors.email ? styles.inputError : ''}`}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input
                                    type="email"
                                    placeholder="exemple@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({});
                                    }}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h1 className={styles.title}>Créer un mot de passe</h1>
                            <p className={styles.subtitle}>
                                Choisissez un mot de passe sécurisé (au moins 6 caractères)
                            </p>
                            <div className={`${styles.inputContainer} ${errors.password ? styles.inputError : ''}`}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({});
                                    }}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className={styles.eyeIcon}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h1 className={styles.title}>Nom d'utilisateur</h1>
                            <p className={styles.subtitle}>
                                Choisissez un nom d'utilisateur unique
                            </p>
                            <div className={`${styles.inputContainer} ${errors.username ? styles.inputError : ''}`}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="nom_utilisateur"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setErrors({});
                                    }}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                            </div>
                            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.stepContent}>
                            <h1 className={styles.title}>Photo de profil</h1>
                            <p className={styles.subtitle}>
                                Ajoutez une photo pour personnaliser votre profil
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div
                                className={styles.imagePickerContainer}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Profile" className={styles.profileImage} />
                                        <div className={styles.changePhotoBtn}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                <circle cx="12" cy="13" r="4"></circle>
                                            </svg>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        <p>Ajouter une photo</p>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className={styles.skipButton}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? 'Changer la photo' : 'Passer cette étape'}
                            </button>
                        </div>
                    )}

                    {step === 5 && (
                        <div className={styles.stepContent}>
                            <h1 className={styles.title}>Date de naissance</h1>
                            <p className={styles.subtitle}>
                                Votre date de naissance ne sera pas visible publiquement
                            </p>
                            <div className={styles.datePickerButton}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <input
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => {
                                        setBirthday(e.target.value);
                                        setErrors({});
                                    }}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={styles.dateInput}
                                />
                            </div>
                            {errors.birthday && <p className={styles.errorText}>{errors.birthday}</p>}
                            {errors.submit && <p className={styles.errorText}>{errors.submit}</p>}
                        </div>
                    )}

                    <button
                        type={step === 5 ? "submit" : "button"}
                        className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
                        onClick={step === 5 ? undefined : next}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            <>
                                <span>{step === 5 ? 'Créer mon compte' : 'Continuer'}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    {step === 5 ? (
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    ) : (
                                        <>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </>
                                    )}
                                </svg>
                            </>
                        )}
                    </button>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Vous avez déjà un compte ?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className={styles.link}
                            >
                                Se connecter
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;