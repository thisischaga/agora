import { useState, useCallback, useMemo } from "react";
import Messenger from "../components/Messenger";
import Chat from "../components/Chat";

const MessengerPage = () => {
    const [active, setActive] = useState('messenger');
    const [showChat, setShowChat] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    
    // Mémoriser les données utilisateur
    const userData = useMemo(() => ({
        userPP: localStorage.getItem('pp'),
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username')
    }), []);

    // Gestionnaire d'ouverture de chat optimisé avec useCallback
    const handleOpenChat = useCallback((user) => {
        const receiver = {
            _id: user.id || user._id,
            username: user.username,
            userPP: user.userPP,
            socketId: user.socketId,
            locationName: user.locationName,
            distance: user.distance
        };
        
        setSelectedReceiver(receiver);
        setShowChat(true);
    }, []);

    // Gestionnaire de fermeture de chat optimisé avec useCallback
    const handleCloseChat = useCallback(() => {
        setShowChat(false);
        setSelectedReceiver(null);
    }, []);

    return (
        <div>
            <Messenger 
                setActive={setActive}
                active={active}
                pp={userData.userPP} 
                onOpenChat={handleOpenChat}
                showChat={showChat}
            />
            
            {/* Modal de chat si nécessaire */}
            {showChat && selectedReceiver && (
                <div className="chatOverlay" onClick={handleCloseChat}>
                    <div className="chatContainer" onClick={(e) => e.stopPropagation()}>
                        <Chat
                            receiver={selectedReceiver} 
                            onClose={handleCloseChat} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessengerPage;