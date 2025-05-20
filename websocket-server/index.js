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
let playerColors = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`${socket.id} joined game ${gameId}`);

        if (!games[gameId]) {
            games[gameId] = [];
        }

        if(!games[gameId].includes(socket.id)){
            games[gameId].push(socket.id);
        }

        
        if(games[gameId].length === 2) {
            const [whitePlayer, blackPlayer] = games[gameId];

            playerColors[whitePlayer] = 'white';
            playerColors[blackPlayer] = 'black';

            io.to(whitePlayer).emit('assignColor', { color: 'white' });
            io.to(blackPlayer).emit('assignColor', { color: 'black' });
            io.to(gameId).emit('start game');
            console.log(whitePlayer, blackPlayer);
        }
    });

    socket.on('move', ({gameId, move, color }) => {
        const expectedColor = playerColors[socket.id];
        if (expectedColor !== color) {
            console.log(`Invalid move from ${socket.id}: expected ${expectedColor}, got ${color}`);
            return;
        }
        
        socket.to(gameId).emit('opponentMove', move);
    });
});

server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);

});