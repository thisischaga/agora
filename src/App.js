import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Signup from './authentification/Signup';
import Login from './authentification/Login';
import { useEffect } from 'react';
import PostPage from './pages/PostPage';
import Room from './pages/Room';
import Me from './pages/Me';
import Settings from './pages/Settings';
import Chat from './components/Chat';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
    return (
        <Router>
            <Routes>
                {/* Routes Publiques */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Routes Protégées (Nécessitent un token) */}
                <Route path="/home" element={
                    <ProtectedRoute> <Home /> </ProtectedRoute>
                } />
                <Route path="/me" element={
                    <ProtectedRoute> <Me /> </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute> <Settings /> </ProtectedRoute>
                } />
                <Route path="/post/:id" element={
                    <ProtectedRoute> <PostPage /> </ProtectedRoute>
                } />
                <Route path="/room/:id" element={
                    <ProtectedRoute> <Room /> </ProtectedRoute>
                } />
                <Route path="/chat/:id" element={
                    <ProtectedRoute> <Chat /> </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}


export default App;
