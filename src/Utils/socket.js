import {io} from 'socket.io-client';
import { API_URL } from './api';

const token = localStorage.getItem('token');

const socket = io(API_URL, { 
        withCredentials: true,
        autoConnect: true,
        auth: {
            token
        },
    });

export default socket;