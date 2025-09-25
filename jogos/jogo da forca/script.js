// Elementos do DOM
const themeSelector = document.getElementById("theme-selector");
const gameBoardSection = document.getElementById("game-board-section");
const selectedThemeDisplay = document.getElementById("selected-theme-display");
const scoreBoard = document.getElementById("score-board");
const wordDisplay = document.getElementById("word-display");
const messageDiv = document.getElementById("message");
const keyboardDiv = document.getElementById("keyboard");
const endGameButtonsDiv = document.getElementById("end-game-buttons");
const newRoundBtn = document.getElementById("new-round-btn");
const resetGameBtn = document.getElementById("reset-game-btn");
const addPlayerBtn = document.getElementById("add-player-btn");
const hamburgerBtn = document.getElementById("hamburger-btn");
const sideMenu = document.getElementById("side-menu");
const sideMenuOverlay = document.getElementById("side-menu-overlay");

// Variáveis de estado do jogo
let currentWord = "";
let guessedLetters = new Set();
let wrongGuesses = 0;
const maxWrongGuesses = 6;
let players = [];
let currentPlayerIndex = 0;
let gameActive = true;
let selectedTheme = "frutas"; // Define o tema padrão

// Listas de palavras fixas para cada tema
const wordLists = {
  frutas: [
    "ABACAXI",
    "MORANGO",
    "BANANA",
    "LARANJA",
    "MAMAO",
    "UVA",
    "MELANCIA",
    "PESSEGO",
    "FIGO",
    "KIWI",
    "CAJU",
    "MANGA",
    "CEREJA",
    "GOIABA",
    "CARAMBOLA",
    "PERA",
    "JABUTICABA",
    "LIMAO",
    "AMORA",
    "ACEROLA",
    "ABACATE",
    "AMEIXA",
    "COCO",
    "CUPUAÇU",
    "MARACUJÁ",
    "MELÃO",
    "MEXERICA",
    "NECTARINA",
    "PINHA",
    "ROMÃ",
    "TANGERINA",
    "CAQUI",
    "GRAVIOLA",
    "JENIPAPO",
    "LIMÃO-SICILIANO",
  ],
  animais: [
    "ELEFANTE",
    "LEOPARDO",
    "HIPOPOTAMO",
    "TIGRE",
    "RINOCERONTE",
    "GIRAFA",
    "ZEBRA",
    "PANDA",
    "GOLFINHO",
    "CANGURU",
    "PASSARO",
    "COELHO",
    "COBRA",
    "URUBU",
    "CAMELO",
    "JAVALI",
    "ESQUILO",
    "GAZELA",
    "FOCA",
    "LONTRA",
    "LEAO",
    "BALEIA",
    "LOBO",
    "RAPOSA",
    "MACACO",
    "JACARE",
    "URSO",
    "TARTARUGA",
    "AGUIA",
    "TUBARAO",
    "PINGUIM",
    "CORUJA",
    "VACA",
    "CACHORRO",
    "GATO",
    "GALINHA",
    "PATO",
    "SAGUI",
    "BODE",
    "OVELHA",
    "PEIXE",
    "CAVALO",
    "OSTRICA",
    "LEOPARDO",
    "LEOPARDO-DAS-NEVES",
    "LEOPARDO-NEBULOSO",
    "JAGUAR",
    "LOBO-GUARÁ",
    "LOBO-CINZENTO",
    "COIOTE",
    "HIENA",
    "GUEPARDO",
    "COBRA-REAL",
    "MAMUTE",
    "ALCE",
    "BOI",
    "PORCO",
    "GABIRU",
    "HAMSTER",
    "RATAO-DO-BANHADO",
    "TARTARUGA-MARINHA",
    "COALA",
    "DROMEDARIO",
    "CAMALEAO",
    "IGUANA",
    "JAGUATIRICA",
    "ARARA",
    "PAPAGAIO",
  ],
  paises: [
    "BRASIL",
    "CANADA",
    "JAPAO",
    "ITALIA",
    "MEXICO",
    "EGITO",
    "INDONESIA",
    "CHINA",
    "INDIA",
    "FRANCA",
    "ALEMANHA",
    "PORTUGAL",
    "ESPANHA",
    "SUICA",
    "AUSTRALIA",
    "ARGENTINA",
    "CHILE",
    "IRLANDA",
    "GRECIA",
    "NORUEGA",
    "ESTADOS UNIDOS",
    "RUSSIA",
    "REINO UNIDO",
    "COREIA DO SUL",
    "AFRICA DO SUL",
    "ARABIA SAUDITA",
    "TURQUIA",
    "NOVA ZELANDIA",
    "FINLANDIA",
    "SUEDIA",
    "HOLANDA",
    "PERU",
    "COLOMBIA",
    "CUBA",
    "EGITO",
    "MARROCOS",
    "ISRAEL",
    "NIGERIA",
    "QUENIA",
    "URUGUAI",
    "BOLIVIA",
    "PARAGUAI",
    "EQUADOR",
    "VENEZUELA",
    "JAMAICA",
    "BELGICA",
    "DINAMARCA",
    "POLONIA",
    "HUNGRIA",
    "REPUBLICA CHECA",
    "VIETNA",
    "TAILANDIA",
    "MALASIA",
    "SINGAPURA",
    "EMIRADOS ARABES UNIDOS",
    "CATAR",
    "IRAN",
    "IRAQUE",
    "PAQUISTAO",
    "AFEGANISTAO",
  ],
  profissoes: [
    "ENGENHEIRO",
    "ARQUITETO",
    "MEDICO",
    "ADVOGADO",
    "PROFESSOR",
    "COZINHEIRO",
    "JORNALISTA",
    "DESIGNER",
    "MECANICO",
    "POLICIAL",
    "BOMBEIRO",
    "PEDREIRO",
    "CARPINTEIRO",
    "ELETRICISTA",
    "FOTOGRAFO",
    "ESCRITOR",
    "ARTISTA",
    "CANTOR",
    "VETERINARIO",
    "BARBEIRO",
    "CIENTISTA",
    "ANALISTA DE SISTEMAS",
    "PROGRAMADOR",
    "CONTADOR",
    "ELETRICISTA",
    "MOTORISTA",
    "MOTORISTA DE APLICATIVO",
    "ENTREGADOR",
    "FAXINEIRO",
    "DIARISTA",
    "ENFERMEIRO",
    "CIRURGIAO",
    "FARMACEUTICO",
    "DENTISTA",
    "PSICOLOGO",
    "FISIOTERAPEUTA",
    "NUTRICIONISTA",
    "PERSONAL TRAINER",
    "TREINADOR",
    "PILOTO",
    "COMISSARIO DE BORDO",
    "RECEPCIONISTA",
    "SECRETARIO",
    "SECRETARIA",
    "JARDINEIRO",
    "AGRICULTOR",
    "PESCADOR",
    "CARTEIRO",
    "CAIXA DE BANCO",
    "ANALISTA FINANCEIRO",
    "GERENTE",
    "GERENTE DE VENDAS",
    "GERENTE DE MARKETING",
    "ATENDENTE",
    "CONSULTOR",
    "VENDEDOR",
    "VENDEDORA",
    "TAXISTA",
    "MANICURE",
    "MAQUIADOR",
    "CABELEREIRO",
    "ESTILISTA",
  ],
  comidas: [
    "LASANHA",
    "PIZZA",
    "SUSHI",
    "FEIJOADA",
    "HAMBURGUER",
    "MACARRAO",
    "SALADA",
    "RISOTO",
    "PASTEL",
    "PAO",
    "BOLO",
    "TORTA",
    "SORVETE",
    "CHOCOLATE",
    "CUSCUZ",
    "ARROZ",
    "FEIJAO",
    "PURE",
    "BATATA",
    "FRANGO",
  ],
};

// Adiciona event listeners
newRoundBtn.addEventListener("click", startNewRound);
resetGameBtn.addEventListener("click", fullReset);
addPlayerBtn.addEventListener("click", addPlayer);
themeSelector.addEventListener("change", startNewRound);
hamburgerBtn.addEventListener("click", toggleMenu);
sideMenuOverlay.addEventListener("click", toggleMenu);

// Função para adicionar um jogador
function addPlayer() {
  const playerName = prompt("Digite o nome do jogador:");
  if (playerName && playerName.trim() !== "") {
    const trimmedName = playerName.trim();
    players.push({ name: trimmedName, score: 0 }); // Exibe o placar depois do primeiro jogador ser adicionado
    scoreBoard.classList.remove("hidden");
    updateScoreBoard();
  }
}

// Função para mostrar/esconder o menu lateral
function toggleMenu() {
  sideMenu.classList.toggle("open");
  sideMenuOverlay.classList.toggle("visible"); // Esta linha foi adicionada para a transição do ícone
  hamburgerBtn.classList.toggle("aberto");
}

// Inicia o jogo automaticamente ao carregar a página
window.onload = function () {
  startNewRound();
};

// Função para iniciar uma nova rodada (mantém pontuação)
function startNewRound() {
  selectedTheme = themeSelector.value;
  const words = wordLists[selectedTheme];
  const randomIndex = Math.floor(Math.random() * words.length);
  currentWord = words[randomIndex];

  selectedThemeDisplay.textContent = `Tema: ${capitalizeFirstLetter(
    selectedTheme
  )}`;
  guessedLetters.clear();
  wrongGuesses = 0;
  gameActive = true;
  messageDiv.textContent = "";
  messageDiv.className = "message";
  endGameButtonsDiv.classList.add("hidden");

  updateUI(); // A chamada de toggleMenu() foi removida daqui
}

// Função para reiniciar o jogo completamente (zera pontuação)
function fullReset() {
  players = [];
  currentPlayerIndex = 0;
  scoreBoard.classList.add("hidden");
  startNewRound();
}

// Função para atualizar a interface do usuário
function updateUI() {
  updateWordDisplay();
  updateGallows();
  updateKeyboard();
  updateScoreBoard();
}

// Função para atualizar a palavra oculta
function updateWordDisplay() {
  const wordHtml = currentWord
    .split("")
    .map((letter) => {
      if (letter === " " || letter === "-") {
        return `<span class="letter word-break">${letter}</span>`;
      } else {
        return guessedLetters.has(letter)
          ? `<span class="letter">${letter}</span>`
          : `<span class="letter-placeholder"></span>`;
      }
    })
    .join("");
  wordDisplay.innerHTML = wordHtml;

  if (wordHtml.indexOf('<span class="letter-placeholder"></span>') === -1) {
    endGame(true);
  }
}

// Função para atualizar o SVG da forca
function updateGallows() {
  const gallowsSvg = document.querySelector(".gallows svg");
  gallowsSvg
    .querySelectorAll(".gallows-part")
    .forEach((part) => part.classList.remove("visible")); // Partes fixas da forca

  gallowsSvg.querySelector('path[d="M 10 190 H 190"]').classList.add("visible");
  gallowsSvg.querySelector('path[d="M 50 190 V 10"]').classList.add("visible");
  gallowsSvg.querySelector('path[d="M 50 10 H 150"]').classList.add("visible");
  gallowsSvg.querySelector('path[d="M 150 10 V 50"]').classList.add("visible"); // Partes do boneco

  const parts = [
    "head",
    "torso",
    "left-arm",
    "right-arm",
    "left-leg",
    "right-leg",
  ];
  for (let i = 0; i < wrongGuesses; i++) {
    const part = document.getElementById(parts[i]);
    if (part) {
      part.classList.add("visible");
    }
  }
}

// Função para criar e atualizar o teclado
function updateKeyboard() {
  keyboardDiv.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const key = document.createElement("button");
    key.textContent = letter;
    key.classList.add("key");
    if (guessedLetters.has(letter)) {
      key.classList.add("disabled");
    } else {
      key.addEventListener("click", () => handleGuess(letter));
    }
    keyboardDiv.appendChild(key);
  }
}

// Função para atualizar o placar
function updateScoreBoard() {
  scoreBoard.innerHTML = "";
  if (players.length > 0) {
    players.forEach((player, index) => {
      const playerElement = document.createElement("div");
      playerElement.classList.add("player-score");
      if (index === currentPlayerIndex) {
        playerElement.classList.add("current-player");
      }
      playerElement.textContent = `${player.name}: ${player.score}`;
      scoreBoard.appendChild(playerElement);
    });
  }
}

// Função para lidar com o palpite do usuário
function handleGuess(letter) {
  if (!gameActive || guessedLetters.has(letter)) {
    return;
  }

  guessedLetters.add(letter);

  if (currentWord.includes(letter)) {
    updateWordDisplay();
    if (players.length > 0) {
      players[currentPlayerIndex].score += 10;
    }
  } else {
    wrongGuesses++;
    if (players.length > 0 && players[currentPlayerIndex].score >= 200) {
      players[currentPlayerIndex].score = Math.floor(
        players[currentPlayerIndex].score / 2
      );
    }
    updateGallows();
    if (players.length > 1) {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
    if (wrongGuesses >= maxWrongGuesses) {
      endGame(false);
    }
  }
  updateKeyboard();
  updateScoreBoard();
}

// Função para finalizar o jogo
function endGame(isWin) {
  gameActive = false;
  if (isWin) {
    messageDiv.textContent = "Parabéns! Você venceu!";
    messageDiv.classList.add("win");
    if (players.length > 0) {
      players[currentPlayerIndex].score += 50;
    }
  } else {
    messageDiv.textContent = `Você perdeu! A palavra era: ${currentWord}`;
    messageDiv.classList.add("lose");
  }
  disableKeyboard();
  endGameButtonsDiv.classList.remove("hidden");
  updateScoreBoard();
}

// Função para desabilitar o teclado
function disableKeyboard() {
  const keys = document.querySelectorAll(".keyboard .key");
  keys.forEach((key) => key.classList.add("disabled"));
}

// Função utilitária para colocar a primeira letra de uma string em maiúscula
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
