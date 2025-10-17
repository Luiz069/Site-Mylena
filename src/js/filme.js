/* * Este código assume que você tem os arquivos HTML e CSS
 * para os elementos com os IDs referenciados.
 * * Lembre-se de substituir os dados em 'firebaseConfig' pelos seus.
 */

// ================== CONFIGURAÇÕES INICIAIS ==================
const API_KEY = "29fa8018e3a64630c52814108ebee6fb"; // Chave TMDB
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w300";

let searchTimeout;
let selectedMovie = null;

// ================== FIREBASE SETUP (Firestore) ==================
// Importa as funções do Firebase (requer <script type="module"> no HTML)
// Estas imports estão no final do arquivo, como o user propôs, para garantir que as funções sejam acessíveis globalmente
/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
*/

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJQZ3Pswe6sdsE35wJux8Dgbw_2PaNNOA",
  authDomain: "filmes-salvos.firebaseapp.com",
  projectId: "filmes-salvos",
  storageBucket: "filmes-salvos.firebasestorage.app",
  messagingSenderId: "155114516613",
  appId: "1:155114516613:web:f0333b9391a7851ad1b9ec",
  measurementId: "G-3DGF10JWEN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ================== FUNÇÕES DE SINC. FIREBASE ==================

/**
 * Carrega a lista de filmes do Firestore.
 * @returns {Promise<Array>} A lista de filmes ou um array vazio em caso de falha.
 */
async function loadMovieListFromFirebase() {
  if (!db) return [];
  try {
    const docRef = doc(db, FIREBASE_COLLECTION_NAME, FIREBASE_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().movies) {
      console.log("Lista de filmes carregada do Firestore.");
      return docSnap.data().movies;
    } else {
      console.log(
        "Documento no Firestore não existe ou está vazio. Inicializando com lista vazia."
      );
      return [];
    }
  } catch (error) {
    console.error("Erro ao carregar lista do Firestore:", error);
    // Em caso de erro, retorna lista vazia para não travar a aplicação
    return [];
  }
}

/**
 * Salva a lista de filmes completa no Firestore.
 * @param {Array} movieList O array de filmes a ser salvo.
 */
async function saveMovieListToFirebase(movieList) {
  if (!db) return;
  try {
    const docRef = doc(db, FIREBASE_COLLECTION_NAME, FIREBASE_DOC_ID);
    // Salva a lista como um campo 'movies' dentro do documento
    await setDoc(docRef, { movies: movieList });
    console.log("Lista de filmes salva no Firestore com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar lista no Firestore:", error);
  }
}

// ================== INICIALIZAÇÃO ==================

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa o Firebase e carrega a lista
  initializeFirebaseAndLoadList();
  loadDarkModePreference();
});

async function initializeFirebaseAndLoadList() {
  // Estas variáveis globais (initializeApp, getFirestore, doc, etc.)
  // serão injetadas pelo <script type="module"> no HTML.
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    // Garante que a primeira renderização use os dados da nuvem
    await renderUserList();
  } catch (error) {
    console.error(
      "Falha ao inicializar o Firebase. Os dados não serão sincronizados.",
      error
    );
    // Se o Firebase falhar, renderiza a lista vazia
    await renderUserList();
  }
}

// ------------------ DARK MODE ------------------
function loadDarkModePreference() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  // O restante da lógica de Dark Mode que usa localStorage permanece, pois é preferência local.
  if (isDarkMode) {
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
  }
  updateModeIcon();
}

function updateModeIcon() {
  const isLightMode = document.body.classList.contains("light-mode");
  const icon = document.getElementById("mode-icon");

  icon.classList.add("animate");

  setTimeout(() => {
    icon.classList.remove("fa-moon", "fa-sun");

    if (isLightMode) {
      icon.classList.add("fa-sun");
    } else {
      icon.classList.add("fa-moon");
    }

    icon.classList.remove("animate");
  }, 150);
}

document.getElementById("dark-light-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLightMode = document.body.classList.contains("light-mode");
  localStorage.setItem("darkMode", !isLightMode);
  updateModeIcon();
});

// ------------------ SEARCH TMDB ------------------
document.getElementById("name-input").addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const query = document.getElementById("name-input").value;
  if (query.length > 2) {
    searchTimeout = setTimeout(() => {
      searchMovies(query);
    }, 300);
  } else {
    document.getElementById("movie-search-results").style.display = "none";
  }
});

async function searchMovies(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
    query
  )}&language=pt-BR`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderSearchMoviesResults(data.results);
  } catch (error) {
    console.error("Falha na busca:", error);
  }
}

function renderSearchMoviesResults(movies) {
  const resultsContainer = document.getElementById("movie-search-results");
  resultsContainer.innerHTML = "";
  const inputRect = document
    .getElementById("name-input")
    .getBoundingClientRect();
  resultsContainer.style.top = `${inputRect.bottom}px`;
  resultsContainer.style.left = `${inputRect.left}px`;
  resultsContainer.style.width = `${inputRect.width}px`;

  if (movies && movies.length > 0) {
    movies.forEach((movie) => {
      const movieItem = document.createElement("div");
      movieItem.className = "search-result-item";
      const cover = movie.poster_path
        ? `${BASE_IMAGE_URL}${movie.poster_path}`
        : "https://via.placeholder.com/40x60?text=Sem+Capa";
      const year = movie.release_date
        ? `(${movie.release_date.substring(0, 4)})`
        : "";
      movieItem.innerHTML = `<img src="${cover}" alt="Capa"><span>${movie.title} ${year}</span>`;
      movieItem.onclick = () => selectMovie(movie);
      resultsContainer.appendChild(movieItem);
    });
    resultsContainer.style.display = "block";
  } else {
    resultsContainer.style.display = "none";
  }
}

function selectMovie(movie) {
  selectedMovie = {
    id: movie.id,
    name: movie.title,
    cover: movie.poster_path
      ? `${BASE_IMAGE_URL}${movie.poster_path}`
      : "https://via.placeholder.com/200x300?text=Sem+Capa",
  };
  document.getElementById("name-input").value = movie.title;
  document.getElementById("movie-search-results").style.display = "none";
  document.getElementById("status-select").focus();
}

// ------------------ ADD MOVIE (MODIFICADO) ------------------
document.getElementById("add-button").addEventListener("click", async () => {
  if (!selectedMovie) {
    alert("Por favor, selecione um filme da lista de busca.");
    return;
  }

  const newMovie = {
    id: selectedMovie.id,
    cover: selectedMovie.cover,
    name: selectedMovie.name,
    status: document.getElementById("status-select").value,
    rating: document.getElementById("rating-input").value,
  };

  // Carrega a lista atual do Firestore
  let movieList = await loadMovieListFromFirebase();
  const exists = movieList.some((m) => m.id === newMovie.id);

  if (exists) {
    alert("Este filme já está na sua lista.");
    return;
  }

  movieList.push(newMovie);

  // Salva a lista atualizada no Firestore
  await saveMovieListToFirebase(movieList);

  document.getElementById("name-input").value = "";
  selectedMovie = null;
  document.getElementById("rating-input").value = "5";

  // Renderiza a lista (agora carrega do Firestore)
  await renderUserList();
});

// ------------------ FILTER (via ícone + dropdown) ------------------
const filterIcon = document.getElementById("filterIcon");
const dropdown = document.getElementById("dropdown");
const filterButtons = document.querySelectorAll(".filter-button");

// abre/fecha o menu
filterIcon.addEventListener("click", () => {
  dropdown.classList.toggle("open");
});

// filtro por categoria
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");
    // Chama renderUserList com o novo filtro
    renderUserList(filter === "all" ? null : filter);

    // fecha menu automaticamente ao escolher filtro
    dropdown.classList.remove("open");
  });
});

// ------------------ SEARCH LIST ------------------
const searchListInput = document.getElementById("search-list-input");
searchListInput.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
  // Chama renderUserList com a query de busca
  renderUserList(null, query);
});

document.getElementById("toggle-search").addEventListener("click", () => {
  const searchContainer = document.getElementById("search-list-container");
  searchContainer.classList.toggle("hidden");
  searchContainer.classList.toggle("visible");
  if (searchContainer.classList.contains("visible")) {
    searchListInput.focus();
  } else {
    searchListInput.value = "";
    // Reseta a lista ao fechar a busca
    renderUserList();
  }
});

// ------------------ RENDER MOVIE LIST (MODIFICADO) ------------------
/**
 * Renderiza a lista de filmes, aplicando filtros e busca,
 * carregando os dados do Firestore.
 */
async function renderUserList(filter = null, searchQuery = null) {
  const container = document.getElementById("movie-grid");
  // Carrega a lista do Firestore
  let movieList = await loadMovieListFromFirebase();
  container.innerHTML = "";

  let filteredList = movieList;
  if (filter) {
    filteredList = filteredList.filter((movie) => movie.status === filter);
  }

  if (searchQuery) {
    filteredList = filteredList.filter((movie) =>
      movie.name.toLowerCase().includes(searchQuery)
    );
  }

  if (filteredList.length > 0) {
    filteredList.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "movie-card";
      const ratingStars =
        "★".repeat(movie.rating) + "☆".repeat(5 - movie.rating);

      movieCard.innerHTML = `
        <img src="${movie.cover}" alt="Capa do filme ${movie.name}">
        <div class="movie-info">
          <h3>${movie.name}</h3>
          <p class="movie-rating">${ratingStars}</p>
          <p>Status: <span id="status-display-${movie.id}">${
        movie.status === "proximo"
          ? "Quero Assistir"
          : movie.status.charAt(0).toUpperCase() + movie.status.slice(1)
      }</span></p>
          <div class="movie-controls">
            <select id="status-edit-${movie.id}">
              <option value="assistido" ${
                movie.status === "assistido" ? "selected" : ""
              }>Assistido</option>
              <option value="assistindo" ${
                movie.status === "assistindo" ? "selected" : ""
              }>Assistindo</option>
              <option value="proximo" ${
                movie.status === "proximo" ? "selected" : ""
              }>Quero Assistir</option>
            </select>
            <div class="button-group">
              <button class="edit-button" data-id="${
                movie.id
              }">Atualizar</button>
              <button class="remove-button" data-id="${
                movie.id
              }">Remover</button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(movieCard);
    });

    // Adiciona event listeners dinamicamente
    document.querySelectorAll(".remove-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        // Agora é assíncrono
        await deleteMovie(event.target.dataset.id);
      });
    });

    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        // Agora é assíncrono
        await updateMovie(event.target.dataset.id);
      });
    });
  } else {
    container.innerHTML = `<p class="no-movies-message">Nenhum filme encontrado.</p>`;
  }
}

// ------------------ DELETE MOVIE (MODIFICADO) ------------------
async function deleteMovie(movieId) {
  // Carrega a lista do Firestore
  let movieList = await loadMovieListFromFirebase();
  const updatedList = movieList.filter((movie) => movie.id != movieId);

  // Salva a lista atualizada no Firestore
  await saveMovieListToFirebase(updatedList);

  // Renderiza novamente a lista
  await renderUserList();
}

// ------------------ UPDATE MOVIE (MODIFICADO) ------------------
async function updateMovie(movieId) {
  // Carrega a lista do Firestore
  let movieList = await loadMovieListFromFirebase();
  const status = document.getElementById(`status-edit-${movieId}`).value;

  const movieIndex = movieList.findIndex((m) => m.id == movieId);
  if (movieIndex > -1) {
    movieList[movieIndex].status = status;

    // Salva a lista atualizada no Firestore
    await saveMovieListToFirebase(movieList);

    // Renderiza novamente a lista
    await renderUserList();
  }
}
