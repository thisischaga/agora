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


function App() {
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/me" element={<Me/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/post/:id" element={<PostPage/>} />
          <Route path="/room/:id" element={<Room/>} />
          <Route path="/chat/:id" element={<Chat/>} />
        </Routes>
      </Router>
    );
}

export default App;
