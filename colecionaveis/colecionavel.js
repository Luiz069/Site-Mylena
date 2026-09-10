// ==============================================================================

const searchBox = document.querySelector(".search-box");
const searchBtn = document.querySelector(".search-icon");
const cancelBtn = document.querySelector(".cancel-icon");
const searchInput = document.querySelector("input");
const searchData = document.querySelector(".search-data");
searchBtn.onclick = () => {
  searchBox.classList.add("active");
  searchBtn.classList.add("active");
  searchInput.classList.add("active");
  cancelBtn.classList.add("active");
  searchInput.focus();
  if (searchInput.value != "") {
    var values = searchInput.value;
    searchData.classList.remove("active");
    searchData.innerHTML =
      "You just typed " +
      "<span style='font-weight: 500;'>" +
      values +
      "</span>";
  } else {
    searchData.textContent = "";
  }
};
cancelBtn.onclick = () => {
  searchBox.classList.remove("active");
  searchBtn.classList.remove("active");
  searchInput.classList.remove("active");
  cancelBtn.classList.remove("active");
  searchData.classList.toggle("active");
  searchInput.value = "";
};

// ==============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Insira suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTbJtWVxYAEFrei687-z3-p7urqLsdIU8",
  authDomain: "filmes-salvos.firebaseapp.com",
  databaseURL: "https://filmes-salvos-default-rtdb.firebaseio.com",
  projectId: "filmes-salvos",
  storageBucket: "filmes-salvos.firebasestorage.app",
  messagingSenderId: "155114516613",
  appId: "1:155114516613:web:21d357a5c89b276fd1b9ec",
  measurementId: "G-R2HTXWN1TB",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const profilesColRef = collection(db, "perfis");

const avatarCatalog = {
  lorelei: ["Felix", "Aneka", "Avery", "Cali", "Jack", "Zoe", "Milo", "Luna"],
  "pixel-art": [
    "SpiderMan",
    "Batman",
    "IronMan",
    "Mario",
    "Zelda",
    "Goku",
    "Naruto",
    "Vader",
  ],
  bottts: [
    "Bender",
    "Cyber",
    "Optimus",
    "R2D2",
    "WallE",
    "Jarvis",
    "Data",
    "Omega",
  ],
  adventurer: [
    "Indiana",
    "Lara",
    "Frodo",
    "Aragorn",
    "Ezio",
    "Geralt",
    "Kratos",
    "Link",
  ],
};

let currentCategory = "lorelei";
let selectedAvatarUrl = "";
let currentPerfis = [];
let editingProfileId = null;
let deletingProfileId = null;

// Referências DOM
const profileSelectionScreen = document.getElementById(
  "profileSelectionScreen",
);
const initialProfilesGrid = document.getElementById("initialProfilesGrid");
const backButton = document.getElementById("backButton");
const profileButton = document.getElementById("profileButton");
const headerAvatarImg = document.getElementById("headerAvatarImg");
const profileMenu = document.getElementById("profileMenu");
const profileContainer = document.getElementById("profileContainer");
const addProfileMenuBtn = document.getElementById("addProfileMenuBtn");
const switchProfileScreenBtn = document.getElementById(
  "switchProfileScreenBtn",
);

// Modal Form
const createProfileModal = document.getElementById("createProfileModal");
const modalTitle = document.getElementById("modalTitle");
const profileNameInput = document.getElementById("profileNameInput");
const avatarGrid = document.getElementById("avatarGrid");
const avatarCategories = document.getElementById("avatarCategories");
const saveProfileBtn = document.getElementById("saveProfileBtn");

// Modal Exclusão
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const deleteProfileNameText = document.getElementById("deleteProfileNameText");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// 1. ESCUTA DE PERFIS NO FIREBASE
function listenToProfiles() {
  onSnapshot(profilesColRef, (snapshot) => {
    currentPerfis = [];
    snapshot.forEach((docSnap) => {
      currentPerfis.push({ id: docSnap.id, ...docSnap.data() });
    });

    const perfilAtivo = currentPerfis.find((p) => p.selected === true);
    if (!perfilAtivo || currentPerfis.length === 0) {
      profileSelectionScreen.classList.remove("hidden");
    }

    renderInitialSelectionScreen(currentPerfis);
    renderHeaderAndMenu(currentPerfis);
  });
}

// 2. TELA DE SELEÇÃO INICIAL
function renderInitialSelectionScreen(perfis) {
  initialProfilesGrid.innerHTML = "";

  perfis.forEach((perfil) => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
                    <div class="card-actions">
                        <button class="action-btn edit" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                        <button class="action-btn delete" title="Excluir"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    <div class="profile-avatar-wrapper">
                        <img src="${perfil.avatarUrl}" alt="${perfil.name}">
                    </div>
                    <div class="profile-card-name">${perfil.name}</div>
                `;

    // Selecionar perfil
    card
      .querySelector(".profile-avatar-wrapper")
      .addEventListener("click", () => {
        selectProfileInFirebase(perfil.id);
        profileSelectionScreen.classList.add("hidden");
      });

    // Editar perfil
    card.querySelector(".edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(perfil);
    });

    // Solicitar exclusão
    card.querySelector(".delete").addEventListener("click", (e) => {
      e.stopPropagation();
      openDeleteModal(perfil);
    });

    initialProfilesGrid.appendChild(card);
  });

  // Botão Adicionar "+"
  const addCard = document.createElement("div");
  addCard.className = "profile-card";
  addCard.innerHTML = `
                <div class="profile-avatar-wrapper add-card-wrapper">
                    <i class="bi bi-plus-lg"></i>
                </div>
                <div class="profile-card-name">Adicionar</div>
            `;
  addCard.addEventListener("click", () => openModal(null));

  initialProfilesGrid.appendChild(addCard);
}

// 3. MENU CABEÇALHO
function renderHeaderAndMenu(perfis) {
  profileContainer.innerHTML = "";

  if (perfis.length === 0) {
    headerAvatarImg.src = "";
    return;
  }

  let perfilAtivo = perfis.find((p) => p.selected === true) || perfis[0];
  headerAvatarImg.src = perfilAtivo.avatarUrl;

  // CARREGA A COLEÇÃO ESPECÍFICA DO PERFIL SELECIONADO
  carregarColecaoDoPerfil(perfilAtivo.id);

  perfis.forEach((perfil) => {
    const isSelected = perfil.id === perfilAtivo.id;

    const item = document.createElement("div");
    item.className = `profile-item ${isSelected ? "selected" : ""}`;
    item.innerHTML = `
                    <div class="profile-item-icon">
                        <img src="${perfil.avatarUrl}" alt="${perfil.name}">
                    </div>
                    <div class="profile-item-info">
                        <div class="profile-item-name">${perfil.name}</div>
                    </div>
                    <div class="profile-item-actions">
                        <i class="bi bi-pencil menu-action-icon btn-menu-edit"></i>
                        <i class="bi bi-trash menu-action-icon btn-menu-delete"></i>
                    </div>
                `;

    item.querySelector(".profile-item-info").addEventListener("click", () => {
      selectProfileInFirebase(perfil.id);
      profileMenu.classList.remove("open");
    });

    item.querySelector(".btn-menu-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(perfil);
    });

    item.querySelector(".btn-menu-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      openDeleteModal(perfil);
    });

    profileContainer.appendChild(item);
  });
}

// 4. ACESSO À COLEÇÃO DO PERFIL NO FIREBASE
function carregarColecaoDoPerfil(perfilId) {
  // Referência para a coleção isolada deste perfil
  const perfilItemsRef = collection(db, "perfis", perfilId, "dados_colecao");

  onSnapshot(perfilItemsRef, (snapshot) => {
    const itensDoPerfil = [];
    snapshot.forEach((docSnap) => {
      itensDoPerfil.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`Itens carregados para o Perfil [${perfilId}]:`, itensDoPerfil);
  });
}

// 5. TROCAR PERFIL ATIVO
async function selectProfileInFirebase(perfilId) {
  for (const p of currentPerfis) {
    const pDocRef = doc(db, "perfis", p.id);
    await updateDoc(pDocRef, { selected: p.id === perfilId });
  }
}

// 6. RENDERIZAR AVATARES
function renderAvatarOptions(categoryStyle) {
  avatarGrid.innerHTML = "";
  const seeds = avatarCatalog[categoryStyle] || avatarCatalog["lorelei"];

  seeds.forEach((seed, index) => {
    const url = `https://api.dicebear.com/7.x/${categoryStyle}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    const option = document.createElement("div");
    const isSelected =
      selectedAvatarUrl === url || (!selectedAvatarUrl && index === 0);

    option.className = `avatar-option ${isSelected ? "selected" : ""}`;
    option.innerHTML = `<img src="${url}" alt="Avatar">`;

    if (isSelected) selectedAvatarUrl = url;

    option.addEventListener("click", () => {
      document
        .querySelectorAll(".avatar-option")
        .forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      selectedAvatarUrl = url;
    });

    avatarGrid.appendChild(option);
  });
}

avatarCategories.addEventListener("click", (e) => {
  if (e.target.classList.contains("category-btn")) {
    document
      .querySelectorAll(".category-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    currentCategory = e.target.getAttribute("data-style");
    renderAvatarOptions(currentCategory);
  }
});

// MODAL CRIAR / EDITAR
function openModal(perfil = null) {
  profileMenu.classList.remove("open");

  if (perfil) {
    editingProfileId = perfil.id;
    modalTitle.innerText = "Editar Perfil";
    profileNameInput.value = perfil.name;
    selectedAvatarUrl = perfil.avatarUrl;
  } else {
    editingProfileId = null;
    modalTitle.innerText = "Novo Perfil";
    profileNameInput.value = "";
    selectedAvatarUrl = "";
  }

  currentCategory = "lorelei";
  document
    .querySelectorAll(".category-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector('[data-style="lorelei"]').classList.add("active");

  renderAvatarOptions("lorelei");
  createProfileModal.classList.add("open");
  profileNameInput.focus();
}

function closeModal() {
  createProfileModal.classList.remove("open");
  editingProfileId = null;
}

// MODAL EXCLUIR
function openDeleteModal(perfil) {
  profileMenu.classList.remove("open");
  deletingProfileId = perfil.id;
  deleteProfileNameText.innerText = perfil.name;
  deleteConfirmModal.classList.add("open");
}

function closeDeleteModal() {
  deleteConfirmModal.classList.remove("open");
  deletingProfileId = null;
}

// SALVAR NOVO OU ATUALIZAR
saveProfileBtn.addEventListener("click", async () => {
  const nome = profileNameInput.value.trim();
  if (!nome) {
    alert("Informe o nome do perfil.");
    return;
  }

  if (editingProfileId) {
    // Atualização
    const perfilRef = doc(db, "perfis", editingProfileId);
    await updateDoc(perfilRef, {
      name: nome,
      avatarUrl: selectedAvatarUrl,
    });
  } else {
    // Criação
    const snapshot = await getDocs(profilesColRef);
    snapshot.forEach(async (docSnap) => {
      await updateDoc(doc(db, "perfis", docSnap.id), { selected: false });
    });

    await addDoc(profilesColRef, {
      name: nome,
      avatarUrl: selectedAvatarUrl,
      selected: true,
      createdAt: Date.now(),
    });
    profileSelectionScreen.classList.add("hidden");
  }

  // Fecha o modal após salvar
  closeModal();
});

// CONFIRMAR EXCLUSÃO
confirmDeleteBtn.addEventListener("click", async () => {
  if (deletingProfileId) {
    await deleteDoc(doc(db, "perfis", deletingProfileId));
    closeDeleteModal();
  }
});

// LISTENERS DE FECHAMENTO
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
document
  .getElementById("closeDeleteModalBtn")
  .addEventListener("click", closeDeleteModal);
document
  .getElementById("cancelDeleteBtn")
  .addEventListener("click", closeDeleteModal);

backButton.addEventListener("click", () => window.history.back());
profileButton.addEventListener("click", (e) => {
  e.stopPropagation();
  profileMenu.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!profileMenu.contains(e.target) && !profileButton.contains(e.target)) {
    profileMenu.classList.remove("open");
  }
});

switchProfileScreenBtn.addEventListener("click", () => {
  profileMenu.classList.remove("open");
  profileSelectionScreen.classList.remove("hidden");
});

addProfileMenuBtn.addEventListener("click", () => openModal(null));

listenToProfiles();
