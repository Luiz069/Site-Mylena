const API_KEY = "29fa8018e3a64630c52814108ebee6fb";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w300";

let searchTimeout;
let selectedMovie = null;

document.addEventListener("DOMContentLoaded", () => {
  renderUserList();
  loadDarkModePreference();
});

// ------------------ DARK MODE ------------------
function loadDarkModePreference() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
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

// ------------------ ADD MOVIE ------------------
document.getElementById("add-button").addEventListener("click", () => {
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

  let movieList = JSON.parse(localStorage.getItem("movieList")) || [];
  const exists = movieList.some((m) => m.id === newMovie.id);

  if (exists) {
    alert("Este filme já está na sua lista.");
    return;
  }

  movieList.push(newMovie);
  localStorage.setItem("movieList", JSON.stringify(movieList));

  document.getElementById("name-input").value = "";
  selectedMovie = null;
  document.getElementById("rating-input").value = "5";

  renderUserList();
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
    renderUserList(filter === "all" ? null : filter);

    // fecha menu automaticamente ao escolher filtro
    dropdown.classList.remove("open");
  });
});

// ------------------ SEARCH LIST ------------------
const searchListInput = document.getElementById("search-list-input");
searchListInput.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
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
    renderUserList();
  }
});

// ------------------ RENDER MOVIE LIST ------------------
function renderUserList(filter = null, searchQuery = null) {
  const container = document.getElementById("movie-grid");
  let movieList = JSON.parse(localStorage.getItem("movieList")) || [];
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

    document.querySelectorAll(".remove-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        deleteMovie(event.target.dataset.id);
      });
    });

    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        updateMovie(event.target.dataset.id);
      });
    });
  } else {
    container.innerHTML = `<p class="no-movies-message">Nenhum filme encontrado.</p>`;
  }
}

function deleteMovie(movieId) {
  let movieList = JSON.parse(localStorage.getItem("movieList")) || [];
  const updatedList = movieList.filter((movie) => movie.id != movieId);
  localStorage.setItem("movieList", JSON.stringify(updatedList));
  renderUserList();
}

function updateMovie(movieId) {
  let movieList = JSON.parse(localStorage.getItem("movieList")) || [];
  const status = document.getElementById(`status-edit-${movieId}`).value;

  const movieIndex = movieList.findIndex((m) => m.id == movieId);
  if (movieIndex > -1) {
    movieList[movieIndex].status = status;
    localStorage.setItem("movieList", JSON.stringify(movieList));
    renderUserList();
  }
}
