import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:5000";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(ENDPOINT, {
            transports: ["websocket", "polling"],
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
