import { io, Socket } from 'socket.io-client';


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const socket: Socket = io(SOCKET_URL, {
    autoConnect: true, 
    reconnection: true, 
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on('connect', () => {
    console.log(`Socket connected: ${socket.id} to ${SOCKET_URL}`);
});

socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

export default socket;