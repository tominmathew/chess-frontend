import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import socket from './socket';
import './App.css'

const game = new Chess();


function App() {
  const [playerColor, setPlayerColor] = useState(null);
  const [fen, setFen] = useState(game.fen());
  const [gameId] = useState('room1'); 

  useEffect(() => {
    socket.emit('joinGame', gameId);

    socket.on('assignColor', ({color}) => {
      setPlayerColor(color);
      console.log(`You are playing as ${color}`);
    });

    socket.on('startGame', (players) => {
      console.log('Game started!', players);
    });

    socket.on('opponentMove', (move) => {
      game.move(move);
      setFen(game.fen());
    });

    return () => {
      socket.off('assignColor');
      socket.off('opponentMove');
      socket.off('startGame');
    };
  }, [gameId]);

  function onDrop(sourceSquare, targetSquare, piece) {

    const pieceColor = piece[0] === 'w' ? 'white' : 'black';

    if (pieceColor !== playerColor) {
      console.log('Not your turn!');
      return false;
    }
    
    // Check if the move is valid 
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const result = game.move(move);
    if (result) {
      setFen(game.fen());
      socket.emit('move', { gameId, move, color: playerColor });
    }
  }

  return (
    <div className="container">
      <h1> Chess by Tomin </h1>
      <h2>Multiplayer Chess</h2>
      <div className="chessboard-container">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardWidth={400} // Optional: Set the chessboard size directly if necessary
        />
      </div>
    </div>
  );
}

export default App;
