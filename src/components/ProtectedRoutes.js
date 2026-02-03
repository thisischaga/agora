import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Si pas de token, on redirige vers la page de connexion
        return <Navigate to="/" replace />;
    }

    // Si le token existe, on affiche la page demandée
    return children;
};

export default ProtectedRoute;