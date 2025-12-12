// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Use the PORT environment variable provided by Render, or default to 3000
const PORT = process.env.PORT || 3000;

// --- Express Setup ---
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Socket.io Signaling Setup ---
const io = new Server(server);

// Store the list of active rooms/clients
let clientCount = 0;

io.on('connection', (socket) => {
    clientCount++;
    console.log(`User connected. Total: ${clientCount}`);

    // Log when a user disconnects
    socket.on('disconnect', () => {
        clientCount--;
        console.log(`User disconnected. Total: ${clientCount}`);
    });

    // 1. Client sends a signaling message
    socket.on('signal', (message) => {
        // 2. Server relays the message to all OTHER connected clients
        // We use broadcast.emit to send to everyone except the sender
        socket.broadcast.emit('signal', message);
    });

    // Simple message to announce a new connection
    // In a real app, you'd manage rooms, but for a basic demo, we connect everyone.
    if (clientCount >= 2) {
        // Alert existing clients that a new peer is available to connect
        socket.broadcast.emit('newPeerReady', 'A new peer has joined the chat.');
    }
});


// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
