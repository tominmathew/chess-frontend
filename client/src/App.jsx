import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import socket from './socket';
import './App.css'

const game = new Chess();

function App() {
  const [fen, setFen] = useState(game.fen());
  const [gameId] = useState('room1'); // Static room for now

  useEffect(() => {
    socket.emit('joinGame', gameId);

    socket.on('startGame', (players) => {
      console.log('Game started!', players);
    });

    socket.on('opponentMove', (move) => {
      game.move(move);
      setFen(game.fen());
    });

    return () => {
      socket.off('opponentMove');
      socket.off('startGame');
    };
  }, [gameId]);

  function onDrop(sourceSquare, targetSquare) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const result = game.move(move);
    if (result) {
      setFen(game.fen());
      socket.emit('move', { gameId, move });
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
