const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

const PORT = 3001;

let games = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`${socket.id} joined game ${gameId}`);

        if (!games[gameId]) {
            games[gameId] = [];
        }

        games[gameId].push(socket.id);

        if(games[gameId].lenght === 2) {
            io.to(gameId).emit('startGame', { white: games[gameId][0], black: games[gameId][1] });
        }
    });

    socket.on('move', ({gameId, move}) => {
        socket.to(gameId).emit('opponentMove', move);
    });
});

server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);

});