let players = []; // lista de jogadores
let currentPlayer = null;
let score = 0;
let timeLeft = 30;
let timer;

const playerNameInput = document.getElementById("playerName");
const startGameBtn = document.getElementById("startGame");
const timeDisplay = document.getElementById("time");
const target = document.getElementById("target");
const gameArea = document.getElementById("game-area");
const rankingList = document.getElementById("rankingList");

// Função para mover quadrado
function moveTarget() {
  const areaWidth = gameArea.clientWidth - target.clientWidth;
  const areaHeight = gameArea.clientHeight - target.clientHeight;

  const randomX = Math.floor(Math.random() * areaWidth);
  const randomY = Math.floor(Math.random() * areaHeight);

  target.style.left = randomX + "px";
  target.style.top = randomY + "px";
}

// Clique no quadrado
target.addEventListener("click", () => {
  score++;
  updatePlayerScore();
  moveTarget();
});

// Atualiza placar e ranking
function updateRanking() {
  // Ordena por pontos decrescentes
  players.sort((a, b) => b.score - a.score);

  rankingList.innerHTML = "";
  players.forEach((player, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}º - ${player.name}: ${player.score} pts`;
    rankingList.appendChild(li);
  });
}

// Atualiza pontos do jogador atual
function updatePlayerScore() {
  if (currentPlayer) {
    currentPlayer.score = score;
    updateRanking();
  }
}

// Contagem regressiva
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

// Final do jogo
function endGame() {
  target.style.display = "none";
  startGameBtn.disabled = false;
}

// Início do jogo
startGameBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert("Digite um nome para jogar!");
    return;
  }

  // Cria ou reseta jogador atual
  currentPlayer = players.find((p) => p.name === name);
  if (!currentPlayer) {
    currentPlayer = { name, score: 0 };
    players.push(currentPlayer);
  }

  score = 0;
  timeLeft = 30;
  timeDisplay.textContent = timeLeft;
  target.style.display = "block";
  gameArea.style.display = "block";

  moveTarget();
  startTimer();
  updateRanking();
});
