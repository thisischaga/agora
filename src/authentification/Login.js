import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './login.module.css';
import { API_URL } from '../Utils/api';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    const backendURL = API_URL;

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (!email.trim()) {
            setErrors({ email: 'L\'adresse e-mail est requise' });
            return;
        }
        if (!validateEmail(email.trim())) {
            setErrors({ email: 'Adresse e-mail invalide' });
            return;
        }
        if (!password.trim()) {
            setErrors({ password: 'Le mot de passe est requis' });
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(`${backendURL}/login`, {
                userEmail: email.trim(),
                userPassword: password.trim(),
            });

            const data = response?.data;
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email.trim());
                }
                navigate('/home');
            } else {
                setErrors({ submit: data?.message || 'Erreur lors de la connexion' });
            }
        } catch (error) {
            console.error('Erreur connexion:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'E-mail ou mot de passe incorrect';
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.formWrapper}>
                    {/* Logo/Brand */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                        </div>
                        <h1 className={styles.brandName}>agora</h1>
                        <p className={styles.brandTagline}>Connectez-vous à votre communauté</p>
                    </div>

                    {/* Login Form */}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2 className={styles.title}>Bon retour parmi nous !</h2>
                        
                        {errors.submit && (
                            <div className={styles.errorBanner}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <p>{errors.submit}</p>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Adresse e-mail</label>
                            <div className={`${styles.inputContainer} ${errors.email ? styles.inputError : ''}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="exemple@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({});
                                    }}
                                    autoFocus
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Mot de passe</label>
                            <div className={`${styles.inputContainer} ${errors.password ? styles.inputError : ''}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Votre mot de passe"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({});
                                    }}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeIcon}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                        </div>

                        <div className={styles.options}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Se souvenir de moi</span>
                            </label>
                            <button
                                type="button"
                                className={styles.forgotPassword}
                                onClick={() => navigate('/forgot-password')}
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.submitButton} ${isLoading ? styles.buttonDisabled : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </>
                            )}
                        </button>

                        <div className={styles.divider}>
                            <span>ou</span>
                        </div>

                        <button
                            type="button"
                            className={styles.googleButton}
                            onClick={() => {/* Implement Google OAuth */}}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Continuer avec Google</span>
                        </button>

                        <div className={styles.footer}>
                            <p>
                                Vous n'avez pas de compte ?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className={styles.link}
                                >
                                    Créer un compte
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Illustration Side (Optional - hidden on mobile) */}
                <div className={styles.illustration}>
                    <div className={styles.illustrationContent}>
                        <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                            <circle cx="12" cy="12" r="10" opacity="0.1"></circle>
                            <path d="M12 2a10 10 0 0 1 0 20" opacity="0.2"></path>
                            <circle cx="12" cy="8" r="3" opacity="0.3"></circle>
                            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" opacity="0.3"></path>
                        </svg>
                        <h2>Rejoignez la conversation</h2>
                        <p>Connectez-vous avec vos amis, partagez vos moments et découvrez de nouvelles histoires.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;