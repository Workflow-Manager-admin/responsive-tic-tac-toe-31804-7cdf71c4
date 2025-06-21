//
// API utility functions for communicating with the FastAPI Tic Tac Toe backend.
//
const BASE_URL = "http://localhost:3001";

// PUBLIC_INTERFACE
/**
 * Get current game state from backend.
 * Returns: { board: string[][], current_player: "X"|"O", winner: "X"|"O"|null, is_draw: boolean }
 */
export async function fetchGameState() {
  try {
    const res = await fetch(`${BASE_URL}/game/state`);
    if (!res.ok)
      throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Cannot fetch game state: ${err.message}`);
  }
}

// PUBLIC_INTERFACE
/**
 * Submit a move to backend.
 * @param {number} row Row index (0-2)
 * @param {number} col Column index (0-2)
 * @param {'X'|'O'} player
 */
export async function postMove(row, col, player) {
  try {
    const res = await fetch(`${BASE_URL}/game/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row, col, player }),
    });
    if (!res.ok) {
      let msg = `Backend error: ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.detail) msg = data.detail.map(e => e.msg).join("; ");
      } catch {} // ignore JSON parse error
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    throw new Error(`Could not submit move: ${err.message}`);
  }
}

// PUBLIC_INTERFACE
/**
 * Reset (start a new) game.
 * Returns: Same structure as fetchGameState.
 */
export async function postResetGame() {
  try {
    const res = await fetch(`${BASE_URL}/game/new`, { method: "POST" });
    if (!res.ok)
      throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Could not reset game: ${err.message}`);
  }
}
