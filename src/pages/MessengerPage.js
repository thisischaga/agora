import Messenger from "../components/Messenger";
import { useState } from "react";

const MessengerPage = () => {
    const [active, setActive] = useState('messenger');
    const [refresh, setRefresh] = useState(false);
    
    const userData = {
        userPP: localStorage.getItem('pp')
    };

    const handleOpenChat = (receiver) => {
        console.log('Open chat with:', receiver);
        // Implémenter la logique de chat si nécessaire
    };

    return (
        <Messenger 
            setActive={setActive}
            active={active}
            pp={userData.pp} 
            setRefresh={setRefresh} 
            refresh={refresh} 
            onOpenChat={handleOpenChat}
        />
    );
};

export default MessengerPage;