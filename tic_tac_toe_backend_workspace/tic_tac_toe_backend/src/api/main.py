from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Literal


# === Game Manager for in-memory tic-tac-toe ===
class TicTacToeGame:
    def __init__(self):
        """Initialize/reset a new empty game board and state."""
        self.reset_game()

    # PUBLIC_INTERFACE
    def reset_game(self):
        """Reset the game to its initial state."""
        self.board = [["" for _ in range(3)] for _ in range(3)]
        self.current_player = "X"
        self.winner: Optional[str] = None
        self.is_draw = False
        self.moves_made = 0

    # PUBLIC_INTERFACE
    def make_move(self, row: int, col: int, player: Literal["X", "O"]):
        """Attempt to make a move and update game state. Raises on errors."""
        if self.winner or self.is_draw:
            raise ValueError("Game over. Please reset to start a new game.")
        if player != self.current_player:
            raise ValueError(f"It is {self.current_player}'s turn.")
        if not (0 <= row < 3 and 0 <= col < 3):
            raise ValueError("Row and column must be between 0 and 2.")
        if self.board[row][col] != "":
            raise ValueError("Cell is already occupied.")
        self.board[row][col] = player
        self.moves_made += 1

        # Check for win or draw after the move
        if self._check_win(player):
            self.winner = player
        elif self.moves_made == 9:
            self.is_draw = True
        else:
            self.current_player = "O" if player == "X" else "X"

    # PUBLIC_INTERFACE
    def get_state(self):
        """Return the current game state as a dict."""
        return {
            "board": self.board,
            "current_player": self.current_player,
            "winner": self.winner,
            "is_draw": self.is_draw,
        }

    def _check_win(self, player: str) -> bool:
        """Internal: check if the specified player has won."""
        b = self.board
        # Check rows, columns, diagonals
        lines = (
            b  # rows
            + [[b[0][i], b[1][i], b[2][i]] for i in range(3)]  # columns
            + [
                [b[0][0], b[1][1], b[2][2]],
                [b[0][2], b[1][1], b[2][0]]
            ]  # diagonals
        )
        return any(all(cell == player for cell in line) for line in lines)


# Singleton in-memory game instance
game = TicTacToeGame()


class GameStateResponse(BaseModel):
    board: List[List[Optional[str]]] = Field(
        ...,
        description="3x3 board, each cell is '', 'X', or 'O'"
    )
    current_player: Literal["X", "O"]
    winner: Optional[Literal["X", "O"]] = Field(
        None,
        description="Winner if any"
    )
    is_draw: bool


class MoveRequest(BaseModel):
    row: int = Field(..., ge=0, le=2, description="Row index: 0-2")
    col: int = Field(..., ge=0, le=2, description="Column index: 0-2")
    player: Literal["X", "O"] = Field(
        ...,
        description="Player making the move ('X' or 'O')"
    )


class MessageResponse(BaseModel):
    message: str


# === FastAPI configuration ===
app = FastAPI(
    title="Tic Tac Toe Backend API",
    description=(
        "API for in-memory Tic Tac Toe game. "
        "Allows creation/reset, making moves, and retrieving game state."
    ),
    version="1.0.0",
    openapi_tags=[
        {"name": "game", "description": "Core gameplay and game state endpoints"}
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production as needed.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# PUBLIC_INTERFACE
@app.get(
    "/",
    tags=["game"],
    response_model=MessageResponse,
    summary="Health check",
    description="Simple health/status check for backend."
)
def health_check():
    """Health check endpoint for server status."""
    return MessageResponse(message="Healthy")


# PUBLIC_INTERFACE
@app.post(
    "/game/new",
    tags=["game"],
    response_model=GameStateResponse,
    summary="Start or reset game",
    description="Starts a new game or resets state."
)
def new_game():
    """Start a new game: resets the board and state."""
    game.reset_game()
    return game.get_state()


# PUBLIC_INTERFACE
@app.post(
    "/game/move",
    tags=["game"],
    response_model=GameStateResponse,
    summary="Make a move",
    description=(
        "Make a move at specified row/column for the current player. "
        "Returns updated game state."
    )
)
def make_move(move: MoveRequest):
    """Make a move for the given player at (row, col). Raises on rule violations."""
    try:
        game.make_move(move.row, move.col, move.player)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return game.get_state()


# PUBLIC_INTERFACE
@app.get(
    "/game/state",
    tags=["game"],
    response_model=GameStateResponse,
    summary="Get current game state",
    description="Retrieves current board, player, winner, and draw status."
)
def get_game_state():
    """Get the current game state."""
    return game.get_state()
