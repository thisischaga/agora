import {io} from 'socket.io-client';

const token = localStorage.getItem('token');

const socket = io('http://localhost:8000', { 
        withCredentials: true,
        autoConnect: true,
        auth: {
            token
        },
    });

export default socket;