import { io } from "socket.io-client";
import dotenv from "dotenv";
dotenv.config();

const ENDPOINT = process.env.BACKEND_URL

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
