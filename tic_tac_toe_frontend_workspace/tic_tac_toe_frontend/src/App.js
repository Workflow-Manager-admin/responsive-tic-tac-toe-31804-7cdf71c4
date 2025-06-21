import React, { useState } from 'react';
import './App.css';

/**
 * Returns the winner ('X' or 'O') if present, or 'draw', otherwise null.
 * @param {string[]} squares 3x3 board in a 1D array of 9 cells ('' | 'X' | 'O')
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];
  for (const [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  if (squares.every(cell => cell)) return 'draw';
  return null;
}

function Board({ squares, onSquareClick, disabled }) {
  return (
    <div className="ttt-board">
      {squares.map((value, idx) => (
        <button
          key={idx}
          className={`ttt-cell${value ? ' filled' : ''}`}
          onClick={() => onSquareClick(idx)}
          disabled={!!value || disabled}
          aria-label={`cell ${idx % 3 + 1}, row ${Math.floor(idx / 3) + 1}`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // '' | 'X' | 'O' in 9 cells
  const [board, setBoard] = useState(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);

  // Status Message
  let status, statusClass = '';
  if (winner === 'draw') {
    status = "It's a draw!";
    statusClass = 'draw';
  } else if (winner) {
    status = `Player ${winner} wins!`;
    statusClass = winner === 'X' ? 'primary' : 'secondary';
  } else {
    status = `Turn: Player ${isXNext ? 'X' : 'O'}`;
    statusClass = isXNext ? 'primary' : 'secondary';
  }

  // Handle cell click
  const handleSquareClick = idx => {
    if (board[idx] || winner) return;
    const newBoard = board.slice();
    newBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  // Reset game
  const handleReset = () => {
    setBoard(Array(9).fill(''));
    setIsXNext(true);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Tic Tac Toe
            </div>
            <button className="btn" onClick={handleReset}>New Game</button>
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          <div className="ttt-hero">
            <div className="subtitle">Classic Game • Modern Design</div>
            <h1 className="title" style={{ fontSize: '2.4rem', margin: 0 }}>Tic Tac Toe</h1>
            <div className="description" style={{ marginBottom: '16px' }}>
              Enjoy a responsive, minimal Tic Tac Toe game. Play as X and O locally!
            </div>
            <StatusBar message={status} statusClass={statusClass} />
            <Board
              squares={board}
              onSquareClick={handleSquareClick}
              disabled={!!winner}
            />
            <button
              className="btn btn-large ttt-reset"
              onClick={handleReset}
              style={{ marginTop: 28 }}
            >
              Reset Game
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBar({ message, statusClass }) {
  return (
    <div className={`ttt-status ${statusClass}`}>
      {message}
    </div>
  );
}

export default App;
