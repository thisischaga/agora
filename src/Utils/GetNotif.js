import socket from "./socket";

export const getNotif = (content )=>{
    socket.emit('notif', content);
}; 