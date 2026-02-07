import StudentMap from "../components/StudentMap";
import { useState } from "react";

const StudentMapPage = () => {
    const [active, setActive] = useState('students');
    const [refresh, setRefresh] = useState(false);
    
    const userData = {
        userPP: localStorage.getItem('userPP'),
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username')
    };

    const handleOpenChat = (receiver) => {
        console.log('Open chat with:', receiver);
        // Implémenter la logique de chat si nécessaire
    };

    return (
        <StudentMap 
            setActive={setActive}
            active={active}
            pp={userData.userPP} 
            userId={userData.userId} 
            username={userData.username} 
            setRefresh={setRefresh} 
            refresh={refresh} 
            onOpenChat={handleOpenChat}
        />
    );
};

export default StudentMapPage;