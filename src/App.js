import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Signup from './authentification/Signup';
import Login from './authentification/Login';
import { useEffect, useState } from 'react';
import PostPage from './pages/PostPage';
import Room from './pages/Room';
import Me from './pages/Me';
import Settings from './pages/Settings';
import Chat from './components/Chat';
import ProtectedRoute from './components/ProtectedRoutes';
import StudentMapPage from './pages/StudentMapPage';
import MessengerPage from './pages/MessengerPage';
import NotificationsPage from './pages/NotificationsPage';



function App() {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        const userAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
          navigator.userAgent
        );
        const screenWidth = window.innerWidth <= 768;
        setIsMobile(userAgent || screenWidth);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    if (!isMobile) {
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
    } else{

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
                  <Route path="/messenger" element={
                      <ProtectedRoute> <MessengerPage /> </ProtectedRoute>
                  } />
                  <Route path="/students" element={
                      <ProtectedRoute> <StudentMapPage /> </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                      <ProtectedRoute> <NotificationsPage /> </ProtectedRoute>
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
}


export default App;
