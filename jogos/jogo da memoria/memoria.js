document.addEventListener("DOMContentLoaded", () => {
  const allImages = [
    "astrid.png",
    "banguela.png",
    "bts-meme.png",
    "bts-meme1.png",
    "bts-meme2.png",
    "bts.png",
    "capivara.png",
    "desenho.png",
    "euela.png",
    "gato01.png",
    "gato02.png",
    "gato03.png",
    "jungkook.png",
    "max-peruca.png",
    "max-sid.png",
    "meme-ney.png",
    "milena-meme.png",
    "taylor.png",
  ];

  const gameBoard = document.getElementById("game-board");
  const message = document.getElementById("message");
  const resetButton = document.getElementById("reset-button");
  const startButton = document.getElementById("start-button");
  const playerSetup = document.querySelector(".player-setup");
  const gameContainer = document.querySelector(".game-container");
  const player1NameInput = document.getElementById("player1-name");
  const player2NameInput = document.getElementById("player2-name");
  const player1NameDisplay = document.getElementById("player1-name-display");
  const player2NameDisplay = document.getElementById("player2-name-display");
  const player1PointsDisplay = document.getElementById("player1-points");
  const player2PointsDisplay = document.getElementById("player2-points");
  const player1ScoreCard = document.getElementById("player1-score");
  const player2ScoreCard = document.getElementById("player2-score");

  let flippedCards = [];
  let matchedPairs = 0;
  let isClickable = false;
  let currentPlayer = 1;
  let player1Score = 0;
  let player2Score = 0;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createBoard() {
    // Seleciona 8 imagens aleatórias do conjunto total de 18
    const shuffledImages = shuffle([...allImages]);
    const selectedImages = shuffledImages.slice(0, 8);
    const cardImages = [...selectedImages, ...selectedImages];

    gameBoard.innerHTML = ""; // Limpa o tabuleiro

    shuffle(cardImages).forEach((imageSrc) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imageSrc;

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-face", "card-front");
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = "Memory Card Image";
      cardFront.appendChild(img);

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-face", "card-back");
      cardBack.textContent = "❓";

      card.appendChild(cardFront);
      card.appendChild(cardBack);

      card.addEventListener("click", () => flipCard(card));
      gameBoard.appendChild(card);
    });
  }

  function flipCard(card) {
    if (
      !isClickable ||
      card.classList.contains("flipped") ||
      card.classList.contains("matched")
    ) {
      return;
    }

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      isClickable = false;
      setTimeout(checkMatch, 1000);
    }
  }

  function checkMatch() {
    const [card1, card2] = flippedCards;
    const image1 = card1.dataset.image;
    const image2 = card2.dataset.image;

    if (image1 === image2) {
      card1.classList.add("matched");
      card2.classList.add("matched");
      message.textContent = `Parabéns, ${getCurrentPlayerName()}! Você encontrou um par.`;
      updateScore(1);
      matchedPairs++;
    } else {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      message.textContent = `Que pena, ${getCurrentPlayerName()}. Não foi um par.`;
      setTimeout(switchPlayer, 1000);
    }

    flippedCards = [];
    isClickable = true;

    if (matchedPairs === 8) {
      endGame();
    }
  }

  function updateScore(points) {
    if (currentPlayer === 1) {
      player1Score += points;
      player1PointsDisplay.textContent = player1Score;
    } else {
      player2Score += points;
      player2PointsDisplay.textContent = player2Score;
    }
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    message.textContent = `É a vez de ${getCurrentPlayerName()}.`;
    player1ScoreCard.classList.toggle("current-player", currentPlayer === 1);
    player2ScoreCard.classList.toggle("current-player", currentPlayer === 2);
  }

  function getCurrentPlayerName() {
    return currentPlayer === 1
      ? player1NameInput.value
      : player2NameInput.value;
  }

  function endGame() {
    isClickable = false;
    let winnerMessage = "O jogo terminou! ";
    if (player1Score > player2Score) {
      winnerMessage += `${player1NameInput.value} venceu!`;
    } else if (player2Score > player1Score) {
      winnerMessage += `${player2NameInput.value} venceu!`;
    } else {
      winnerMessage += "É um empate!";
    }
    message.textContent = winnerMessage;
    resetButton.classList.remove("hidden");
  }

  function resetGame() {
    player1Score = 0;
    player2Score = 0;
    player1PointsDisplay.textContent = 0;
    player2PointsDisplay.textContent = 0;
    currentPlayer = 1;
    player1ScoreCard.classList.add("current-player");
    player2ScoreCard.classList.remove("current-player");
    matchedPairs = 0;
    flippedCards = [];
    isClickable = false;
    message.textContent = `Clique em uma carta para começar!`;
    resetButton.classList.add("hidden");

    playerSetup.style.display = "flex";
    gameContainer.classList.add("hidden");
  }

  startButton.addEventListener("click", () => {
    if (
      player1NameInput.value.trim() === "" ||
      player2NameInput.value.trim() === ""
    ) {
      alert("Por favor, preencha o nome de ambos os jogadores.");
      return;
    }
    playerSetup.style.display = "none";
    gameContainer.classList.remove("hidden");

    player1NameDisplay.textContent = player1NameInput.value;
    player2NameDisplay.textContent = player2NameInput.value;

    createBoard();
    isClickable = true;
    message.textContent = `Começou o jogo! É a vez de ${getCurrentPlayerName()}.`;
  });

  resetButton.addEventListener("click", resetGame);
});
