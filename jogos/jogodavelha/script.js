const board = document.getElementById("board");
const message = document.getElementById("message");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const resetBtn = document.getElementById("resetScore");

let currentPlayer = "❌";
let cells = [];
let scoreX = 0;
let scoreO = 0;

function createBoard() {
  board.innerHTML = "";
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", () => play(i));
    board.appendChild(cell);
    cells.push(cell);
  }
}

function play(i) {
  if (cells[i].textContent !== "") return; // já ocupado
  cells[i].textContent = currentPlayer;

  if (checkWinner(currentPlayer)) {
    message.textContent = `Jogador ${currentPlayer} venceu!`;
    if (currentPlayer === "❌") {
      scoreX++;
      scoreXEl.textContent = scoreX;
    } else {
      scoreO++;
      scoreOEl.textContent = scoreO;
    }
    setTimeout(resetBoard, 1500);
    return;
  }

  if (isDraw()) {
    message.textContent = "Empate!";
    setTimeout(resetBoard, 1500);
    return;
  }

  currentPlayer = currentPlayer === "❌" ? "⭕" : "❌";
  message.textContent = `Vez do Jogador ${currentPlayer}`;
}

function checkWinner(player) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // linhas
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // colunas
    [0, 4, 8],
    [2, 4, 6], // diagonais
  ];
  return winPatterns.some((pattern) =>
    pattern.every((i) => cells[i].textContent === player)
  );
}

function isDraw() {
  return cells.every((cell) => cell.textContent !== "");
}

function resetBoard() {
  createBoard();
  currentPlayer = "❌";
  message.textContent = "Vez do Jogador X";
}

// resetar apenas o placar
resetBtn.addEventListener("click", () => {
  scoreX = 0;
  scoreO = 0;
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  resetBoard();
});

createBoard();
