import React, { useEffect, useState } from 'react';
import './App.css';
import { fetchGameState, postMove, postResetGame } from './api';

// Backend to frontend board format conversion helpers
function flattenBoard(board2D) {
  // board2D is [["X","O",""],["O","",""],["","","X"]]
  return board2D ? [].concat(...board2D) : Array(9).fill('');
}
function unflattenBoard(flat9) {
  // "XOXXO    " => [["X","O","X"],["X","O",""],["","",""]]
  return [
    flat9.slice(0, 3),
    flat9.slice(3, 6),
    flat9.slice(6, 9),
  ];
}

// A presentational board
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
  /* State reflects what backend provides: board, currentPlayer, winner, is_draw, error */
  const [backendState, setBackendState] = useState({
    board: Array(3).fill().map(() => Array(3).fill('')),
    current_player: 'X',
    winner: null,
    is_draw: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Convert backend board to flat 1D array for rendering
  const flatBoard = flattenBoard(backendState.board);

  // Status logic from backend state
  let status, statusClass = '';
  if (backendState.is_draw) {
    status = "It's a draw!";
    statusClass = 'draw';
  } else if (backendState.winner) {
    status = `Player ${backendState.winner} wins!`;
    statusClass = backendState.winner === 'X' ? 'primary' : 'secondary';
  } else {
    status = `Turn: Player ${backendState.current_player}`;
    statusClass = backendState.current_player === 'X' ? 'primary' : 'secondary';
  }

  // Fetch state on mount & after reset
  useEffect(() => {
    refreshGameState();
    // eslint-disable-next-line
  }, []);

  // Load state from backend
  async function refreshGameState() {
    setLoading(true);
    setError("");
    try {
      const state = await fetchGameState();
      setBackendState(state);
    } catch (err) {
      setError(err.message || "Failed to fetch game state");
    }
    setLoading(false);
  }

  // Handle cell click: submit to backend if cell is empty, game not over, no pending request
  const handleSquareClick = async idx => {
    if (loading) return;
    if (flatBoard[idx] || backendState.winner || backendState.is_draw) return;
    const row = Math.floor(idx / 3), col = idx % 3;
    setLoading(true);
    setError("");
    try {
      const result = await postMove(row, col, backendState.current_player);
      setBackendState(result);
    } catch (err) {
      setError(err.message || "Move failed");
    }
    setLoading(false);
  };

  // Reset game via backend
  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const state = await postResetGame();
      setBackendState(state);
    } catch (err) {
      setError(err.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Tic Tac Toe
            </div>
            <button className="btn" onClick={handleReset} disabled={loading}>
              New Game
            </button>
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          <div className="ttt-hero">
            <div className="subtitle">Classic Game • Modern Design</div>
            <h1 className="title" style={{ fontSize: '2.4rem', margin: 0 }}>Tic Tac Toe</h1>
            <div className="description" style={{ marginBottom: '16px' }}>
              Enjoy a responsive, minimal Tic Tac Toe game. Play as X and O via API!
            </div>
            {error && <ErrorBar message={error} />}
            <StatusBar message={status} statusClass={statusClass} />
            <Board
              squares={flatBoard}
              onSquareClick={handleSquareClick}
              disabled={!!backendState.winner || backendState.is_draw || loading}
            />
            <button
              className="btn btn-large ttt-reset"
              onClick={handleReset}
              disabled={loading}
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

function ErrorBar({ message }) {
  return (
    <div style={{
      color: '#fff',
      background: '#f44336',
      borderRadius: '5px',
      margin: '6px 0 10px 0',
      padding: '0.55em 0.8em',
      fontWeight: 500,
      fontSize: '1.1em',
      boxShadow: '0 1px 6px rgba(224,42,0,0.08)'
    }}>
      {message}
    </div>
  );
}

export default App;
