import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../Utils/socket';

export const useSocketConnection = (token, locationPath) => {
    const [refresh, setRefresh] = useState(false);
    const [userData, setUserData] = useState({});
    const [socketConnected, setSocketConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        socket.connect();

        const onConnect = async () => {
            setSocketConnected(true);
            try {
                // Register socket ID
                await axios.post(
                    "http://localhost:8000/socket/getSocketId",
                    { socketId: socket.id },
                    { headers: { Authorization: `Bearer${token}` } } // Fixed missing space in Bearer
                );
                
                // Fetch initial data
                const response = await axios.get("http://localhost:8000/user_data", {
                    headers: { Authorization: `Bearer${token}` }, // Fixed missing space in Bearer
                });
                setUserData(response.data);
            } catch (err) {
                console.error("Socket/Data Error:", err);
                setError("Erreur lors de la récupération des données.");
            }
        };

        const onNotif = () => {
            setRefresh(prev => !prev);
        };

        socket.on("connect", onConnect);
        socket.on('notif', onNotif);

        return () => {
            socket.off('connect', onConnect);
            socket.off('notif', onNotif);
            socket.disconnect();
            setSocketConnected(false);
        };
    }, [locationPath, token]);

    return { userData, refresh, setRefresh, error, socketConnected };
};
