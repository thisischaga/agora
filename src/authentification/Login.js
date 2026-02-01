import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './login.module.css';
import { API_URL } from '../Utils/api';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    // Charger l'email mémorisé au montage
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const validateEmail = useCallback((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors = {};
        
        if (!email.trim()) {
            newErrors.email = 'L\'adresse e-mail est requise';
        } else if (!validateEmail(email.trim())) {
            newErrors.email = 'Adresse e-mail invalide';
        }
        
        if (!password.trim()) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (password.trim().length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(`${API_URL}/login`, {
                userEmail: email.trim(),
                userPassword: password.trim(),
            });

            const data = response?.data;
            
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email.trim());
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                navigate('/home', { replace: true });
            } else {
                setErrors({ submit: data?.message || 'Erreur lors de la connexion' });
            }
        } catch (error) {
            console.error('Erreur connexion:', error.response?.data || error.message);
            
            const errorMessage = error.response?.data?.message 
                || error.response?.status === 401 
                    ? 'Email ou mot de passe incorrect' 
                    : 'Une erreur est survenue. Veuillez réessayer.';
            
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [email, password, rememberMe, validateEmail, navigate]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }, [handleSubmit]);

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
                        
                        {/* Error Banner */}
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

                        {/* Email Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Adresse e-mail</label>
                            <div className={`${styles.inputContainer} ${errors.email ? styles.inputError : ''}`}>
                                <FaEnvelope className={styles.inputIcon} />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="exemple@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                    }}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                    autoComplete="email"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Mot de passe</label>
                            <div className={`${styles.inputContainer} ${errors.password ? styles.inputError : ''}`}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Votre mot de passe"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                    }}
                                    onKeyPress={handleKeyPress}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeIcon}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                        </div>

                        {/* Options */}
                        <div className={styles.options}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>Se souvenir de moi</span>
                            </label>
                            <button
                                type="button"
                                className={styles.forgotPassword}
                                onClick={() => navigate('/forgot-password')}
                                disabled={isLoading}
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`${styles.submitButton} ${isLoading ? styles.buttonLoading : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <FaArrowRight />
                                </>
                            )}
                        </button>

                        {/* Footer */}
                        <div className={styles.footer}>
                            <p>
                                Vous n'avez pas de compte ?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className={styles.link}
                                    disabled={isLoading}
                                >
                                    Créer un compte
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

