import { io } from 'socket.io-client';

// gets JWT token form cookie


// "undefined" means the URL will be computed from the `window.location` object
const URL = 'http://localhost:3000';

export const socket = io(URL, 
    {
        withCredentials: true
    }
);