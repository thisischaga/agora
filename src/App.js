import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Signup from './authentification/Signup';
import Login from './authentification/Login';
import { useEffect } from 'react';
import PostPage from './pages/PostPage';


function App() {
  //const token = localStorage.getItem('token');
  useEffect(()=>{
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if(isMobile){
      document.body.innerHTML = "<h2 style='text-align:center; margin-top:100px '>Ce site est uniquement accessible sur ordinateur.</h2>"
    }
  },[])
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/post/:id" element={<PostPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
