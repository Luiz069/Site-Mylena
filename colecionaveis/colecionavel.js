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

const AVAILABLE_CATEGORIES = [
  "interesse",
  "colecionaveis",
  "Hot Wheels",
  "funko",
  "livros",
];

let currentCategory = "lorelei";
let selectedAvatarUrl = "";
let currentPerfis = [];
let editingProfileId = null;
let deletingProfileId = null;
let activeProfileId = null;
let activeProfileUnsubscribe = null;
let editingItemId = null;
let manualBase64Image = "";
let currentLoadedItems = [];

// Referências DOM - Perfis
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

const createProfileModal = document.getElementById("createProfileModal");
const modalTitle = document.getElementById("modalTitle");
const profileNameInput = document.getElementById("profileNameInput");
const avatarGrid = document.getElementById("avatarGrid");
const avatarCategories = document.getElementById("avatarCategories");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const deleteProfileNameText = document.getElementById("deleteProfileNameText");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Referências DOM - Itens & Carrossel
const itemModal = document.getElementById("itemModal");
const itemModalTitle = document.getElementById("itemModalTitle");
const itemLinkInput = document.getElementById("itemLinkInput");
const itemNameInput = document.getElementById("itemNameInput");
const itemStoreInput = document.getElementById("itemStoreInput");
const itemCategorySelect = document.getElementById("itemCategorySelect");
const itemImageInput = document.getElementById("itemImageInput");
const itemFileInput = document.getElementById("itemFileInput");
const fileNameText = document.getElementById("fileNameText");
const imagePreviewWrapper = document.getElementById("imagePreviewWrapper");
const imagePreview = document.getElementById("imagePreview");
const saveItemBtn = document.getElementById("saveItemBtn");
const closeItemModalBtn = document.getElementById("closeItemModalBtn");
const cancelItemModalBtn = document.getElementById("cancelItemModalBtn");

const recentSection = document.getElementById("recentSection");
const recentCarousel = document.getElementById("recentCarousel");
const categoriesContainer = document.getElementById("categoriesContainer");

// 1. ESCUTA DE PERFIS
function listenToProfiles() {
  onSnapshot(profilesColRef, (snapshot) => {
    currentPerfis = [];
    snapshot.forEach((docSnap) => {
      currentPerfis.push({ id: docSnap.id, ...docSnap.data() });
    });

    const perfilAtivo = currentPerfis.find((p) => p.selected === true);
    if (!perfilAtivo || currentPerfis.length === 0) {
      profileSelectionScreen?.classList.remove("hidden");
    } else {
      profileSelectionScreen?.classList.add("hidden");
    }

    renderInitialSelectionScreen(currentPerfis);
    renderHeaderAndMenu(currentPerfis);
  });
}

// 2. TELA DE SELEÇÃO INICIAL DE PERFIS
function renderInitialSelectionScreen(perfis) {
  if (!initialProfilesGrid) return;
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

    card
      .querySelector(".profile-avatar-wrapper")
      .addEventListener("click", async () => {
        await selectProfileInFirebase(perfil.id);
        window.location.reload();
      });

    card.querySelector(".edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openProfileModal(perfil);
    });

    card.querySelector(".delete").addEventListener("click", (e) => {
      e.stopPropagation();
      openDeleteModal(perfil);
    });

    initialProfilesGrid.appendChild(card);
  });

  const addCard = document.createElement("div");
  addCard.className = "profile-card";
  addCard.innerHTML = `
    <div class="profile-avatar-wrapper add-card-wrapper">
      <i class="bi bi-plus-lg"></i>
    </div>
    <div class="profile-card-name">Adicionar</div>
  `;
  addCard.addEventListener("click", () => openProfileModal(null));
  initialProfilesGrid.appendChild(addCard);
}

// 3. MENU NO CABEÇALHO
function renderHeaderAndMenu(perfis) {
  if (!profileContainer) return;
  profileContainer.innerHTML = "";

  if (perfis.length === 0) {
    if (headerAvatarImg) headerAvatarImg.src = "";
    return;
  }

  let perfilAtivo = perfis.find((p) => p.selected === true) || perfis[0];
  if (headerAvatarImg) headerAvatarImg.src = perfilAtivo.avatarUrl;
  activeProfileId = perfilAtivo.id;

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

    item
      .querySelector(".profile-item-info")
      .addEventListener("click", async () => {
        await selectProfileInFirebase(perfil.id);
        window.location.reload();
      });

    item.querySelector(".btn-menu-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openProfileModal(perfil);
    });

    item.querySelector(".btn-menu-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      openDeleteModal(perfil);
    });

    profileContainer.appendChild(item);
  });
}

// 4. CARREGAR A COLEÇÃO DO PERFIL ATIVO
function carregarColecaoDoPerfil(perfilId) {
  if (activeProfileUnsubscribe) {
    activeProfileUnsubscribe();
    activeProfileUnsubscribe = null;
  }

  const perfilItemsRef = collection(db, "perfis", perfilId, "dados_colecao");

  activeProfileUnsubscribe = onSnapshot(
    perfilItemsRef,
    (snapshot) => {
      const itens = [];
      snapshot.forEach((docSnap) => {
        itens.push({ id: docSnap.id, ...docSnap.data() });
      });

      currentLoadedItems = itens;
      renderAllCarousels(itens);
    },
    (error) => {
      console.error("Erro ao carregar coleção:", error);
    },
  );
}

function renderAllCarousels(itens) {
  if (categoriesContainer) categoriesContainer.innerHTML = "";
  if (recentCarousel) recentCarousel.innerHTML = "";

  // A. Recentes
  const recentes = [...itens]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 10);

  if (recentes.length > 0 && recentSection && recentCarousel) {
    recentSection.classList.remove("hidden");
    recentCarousel.innerHTML = recentes.map(createItemCardHTML).join("");
  } else if (recentSection) {
    recentSection.classList.add("hidden");
  }

  // B. Por Categoria
  AVAILABLE_CATEGORIES.forEach((cat) => {
    const itensDaCategoria = itens.filter(
      (item) => item.category?.toLowerCase() === cat.toLowerCase(),
    );

    if (itensDaCategoria.length > 0 && categoriesContainer) {
      const section = document.createElement("section");
      section.className = "category-section";

      const carouselId = `carousel-${cat.replace(/\s+/g, "-")}`;

      section.innerHTML = `
        <h2 class="category-title">${cat.toUpperCase()}</h2>
        <div class="carousel-wrapper">
          <div id="${carouselId}" class="carousel-track">
            ${itensDaCategoria.map(createItemCardHTML).join("")}
          </div>
        </div>
      `;

      categoriesContainer.appendChild(section);
    }
  });

  setupCarouselNavigation();
  setupCardMenuEvents();
}

// Gera HTML do Card com Menu Hambúrguer (Editar / Apagar)
function createItemCardHTML(item) {
  const fallbackImg =
    "https://via.placeholder.com/150x180/121214/ffffff?text=Sem+Foto";

  const productImg =
    item.imageUrl && item.imageUrl.trim() !== "" ? item.imageUrl : fallbackImg;

  const categoryName = item.category || "Colecionável";

  return `
    <div class="item-card-horizontal" data-id="${item.id}">
      <div class="card-img-container">
        <img src="${productImg}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
      </div>
      
      <div class="card-content-container">
        <div class="card-header-row">
          <div class="card-badge">
            <span>${categoryName}</span>
          </div>
          
          <div class="card-menu-wrapper">
            <button class="card-menu-btn" title="Opções">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <div class="card-dropdown-menu">
              <button class="dropdown-item btn-edit-item" data-id="${item.id}">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="dropdown-item btn-delete-item" data-id="${item.id}">
                <i class="bi bi-trash"></i> Apagar
              </button>
            </div>
          </div>
        </div>
        
        <h3 class="card-title" title="${item.name}">${item.name}</h3>
        
        <p class="card-description">
          ${item.store ? `Disponível em: <strong>${item.store}</strong>` : "Item adicionado à coleção."}
        </p>
        
        ${
          item.link
            ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn-red-action">
                <i class="bi bi-box-arrow-up-right"></i>
                <span>Abrir link</span>
                <i class="bi bi-arrow-right"></i>
               </a>`
            : `<button class="btn-red-action disabled" disabled>
                <span>Sem link</span>
               </button>`
        }
      </div>
    </div>
  `;
}

// Configurações do Menu do Card (Editar/Apagar)
function setupCardMenuEvents() {
  document.querySelectorAll(".card-menu-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const currentDropdown = btn.nextElementSibling;

      document.querySelectorAll(".card-dropdown-menu.open").forEach((drop) => {
        if (drop !== currentDropdown) drop.classList.remove("open");
      });

      currentDropdown?.classList.toggle("open");
    };
  });

  document.querySelectorAll(".btn-edit-item").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute("data-id");
      const item = currentLoadedItems.find((i) => i.id === itemId);
      if (item) openItemModal(item);
    };
  });

  document.querySelectorAll(".btn-delete-item").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute("data-id");
      if (confirm("Tem certeza que deseja apagar este item?")) {
        await deleteItemFromFirebase(itemId);
      }
    };
  });
}

// Apagar item do Firestore e recarregar
async function deleteItemFromFirebase(itemId) {
  if (!activeProfileId || !itemId) return;
  try {
    const itemRef = doc(db, "perfis", activeProfileId, "dados_colecao", itemId);
    await deleteDoc(itemRef);
    window.location.reload();
  } catch (error) {
    console.error("Erro ao apagar item:", error);
    alert("Não foi possível apagar o item.");
  }
}

function setupCarouselNavigation() {
  document.querySelectorAll(".carousel-nav").forEach((btn) => {
    btn.onclick = () => {
      const targetId = btn.getAttribute("data-target");
      const track = document.getElementById(targetId);
      if (!track) return;

      const scrollAmount = track.clientWidth * 0.75;
      track.scrollBy({
        left: btn.classList.contains("prev") ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    };
  });
}

// 5. AUTO-PREENCHIMENTO DE DADOS VIA LINK
itemLinkInput?.addEventListener("blur", async () => {
  const url = itemLinkInput.value.trim();
  if (!url) return;

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace("www.", "");

    if (itemStoreInput && !itemStoreInput.value) {
      const storeName = host.split(".")[0];
      itemStoreInput.value =
        storeName.charAt(0).toUpperCase() + storeName.slice(1);
    }

    if (itemNameInput && !itemNameInput.value) {
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      if (pathSegments.length > 0) {
        const rawName = pathSegments[pathSegments.length - 1];
        const formattedName = decodeURIComponent(rawName)
          .replace(/[-_]/g, " ")
          .replace(/\.(html|php|asp|pdp)$/i, "");
        if (formattedName.length > 3) {
          itemNameInput.value =
            formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
        }
      }
    }

    let productImageUrl = "";
    try {
      const response = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(url)}`,
      );
      const data = await response.json();
      if (data.status === "success" && data.data.image?.url) {
        productImageUrl = data.data.image.url;
      }
    } catch (e) {
      console.warn("Falha na API Microlink");
    }

    if (
      itemImageInput &&
      productImageUrl &&
      !productImageUrl.includes("favicon") &&
      !productImageUrl.includes("logo")
    ) {
      itemImageInput.value = productImageUrl;
      showImagePreview(productImageUrl);
    }
  } catch (e) {
    console.warn("URL inválida.");
  }
});

// 6. UPLOAD E PREVIEW DA IMAGEM
itemFileInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Selecione uma imagem de até 2MB.");
    itemFileInput.value = "";
    return;
  }

  if (fileNameText) fileNameText.innerText = file.name;

  const reader = new FileReader();
  reader.onload = function (event) {
    manualBase64Image = event.target.result;
    if (itemImageInput) itemImageInput.value = "";
    showImagePreview(manualBase64Image);
  };
  reader.readAsDataURL(file);
});

itemImageInput?.addEventListener("input", () => {
  const url = itemImageInput.value.trim();
  if (url) {
    manualBase64Image = "";
    if (itemFileInput) itemFileInput.value = "";
    if (fileNameText) fileNameText.innerText = "Nenhum arquivo selecionado";
    showImagePreview(url);
  } else {
    hideImagePreview();
  }
});

function showImagePreview(src) {
  if (imagePreview && imagePreviewWrapper) {
    imagePreview.src = src;
    imagePreviewWrapper.classList.remove("hidden");
  }
}

function hideImagePreview() {
  if (imagePreviewWrapper) {
    imagePreviewWrapper.classList.add("hidden");
  }
}

// 7. SALVAR OU EDITAR ITEM (COM RECARREGAMENTO)
saveItemBtn?.addEventListener("click", async () => {
  const nome = itemNameInput ? itemNameInput.value.trim() : "";
  const categoria = itemCategorySelect ? itemCategorySelect.value : "interesse";

  if (!nome) {
    alert("O campo Nome é obrigatório.");
    return;
  }

  if (!activeProfileId) {
    alert("Nenhum perfil ativo selecionado.");
    return;
  }

  const finalImageUrl =
    manualBase64Image || (itemImageInput ? itemImageInput.value.trim() : "");

  const itemData = {
    name: nome,
    store: itemStoreInput ? itemStoreInput.value.trim() : "",
    category: categoria,
    link: itemLinkInput ? itemLinkInput.value.trim() : "",
    imageUrl: finalImageUrl,
    updatedAt: Date.now(),
  };

  try {
    if (editingItemId) {
      const itemRef = doc(
        db,
        "perfis",
        activeProfileId,
        "dados_colecao",
        editingItemId,
      );
      await updateDoc(itemRef, itemData);
    } else {
      itemData.createdAt = Date.now();
      const perfilItemsRef = collection(
        db,
        "perfis",
        activeProfileId,
        "dados_colecao",
      );
      await addDoc(perfilItemsRef, itemData);
    }

    closeItemModal();
    window.location.reload();
  } catch (error) {
    console.error("Erro ao salvar item:", error);
    alert("Erro ao salvar o item.");
  }
});

// MODAL DE ITEM
function openItemModal(itemToEdit = null) {
  if (itemToEdit) {
    editingItemId = itemToEdit.id;
    if (itemModalTitle) itemModalTitle.innerText = "Editar Item";
    if (itemNameInput) itemNameInput.value = itemToEdit.name || "";
    if (itemStoreInput) itemStoreInput.value = itemToEdit.store || "";
    if (itemLinkInput) itemLinkInput.value = itemToEdit.link || "";
    if (itemImageInput) itemImageInput.value = itemToEdit.imageUrl || "";
    if (itemCategorySelect)
      itemCategorySelect.value = itemToEdit.category || "interesse";

    if (itemToEdit.imageUrl) {
      showImagePreview(itemToEdit.imageUrl);
    } else {
      hideImagePreview();
    }
  } else {
    editingItemId = null;
    if (itemModalTitle) itemModalTitle.innerText = "Novo Item";
    if (itemNameInput) itemNameInput.value = "";
    if (itemStoreInput) itemStoreInput.value = "";
    if (itemLinkInput) itemLinkInput.value = "";
    if (itemImageInput) itemImageInput.value = "";
    if (itemFileInput) itemFileInput.value = "";
    if (fileNameText) fileNameText.innerText = "Nenhum arquivo selecionado";

    manualBase64Image = "";
    hideImagePreview();

    if (itemCategorySelect) itemCategorySelect.value = "interesse";
  }

  if (itemModal) itemModal.classList.add("open");
}

function closeItemModal() {
  if (itemModal) itemModal.classList.remove("open");
  editingItemId = null;
}

closeItemModalBtn?.addEventListener("click", closeItemModal);
cancelItemModalBtn?.addEventListener("click", closeItemModal);

// 8. GERENCIAMENTO DE PERFIS E AVATARES
async function selectProfileInFirebase(perfilId) {
  for (const p of currentPerfis) {
    const pDocRef = doc(db, "perfis", p.id);
    await updateDoc(pDocRef, { selected: p.id === perfilId });
  }
}

function renderAvatarOptions(categoryStyle) {
  if (!avatarGrid) return;
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

avatarCategories?.addEventListener("click", (e) => {
  if (e.target.classList.contains("category-btn")) {
    document
      .querySelectorAll(".category-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    currentCategory = e.target.getAttribute("data-style");
    renderAvatarOptions(currentCategory);
  }
});

function openProfileModal(perfil = null) {
  profileMenu?.classList.remove("open");

  if (perfil) {
    editingProfileId = perfil.id;
    if (modalTitle) modalTitle.innerText = "Editar Perfil";
    if (profileNameInput) profileNameInput.value = perfil.name;
    selectedAvatarUrl = perfil.avatarUrl;
  } else {
    editingProfileId = null;
    if (modalTitle) modalTitle.innerText = "Novo Perfil";
    if (profileNameInput) profileNameInput.value = "";
    selectedAvatarUrl = "";
  }

  currentCategory = "lorelei";
  document
    .querySelectorAll(".category-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector('[data-style="lorelei"]')?.classList.add("active");

  renderAvatarOptions("lorelei");
  createProfileModal?.classList.add("open");
  profileNameInput?.focus();
}

function closeProfileModal() {
  createProfileModal?.classList.remove("open");
  editingProfileId = null;
}

function openDeleteModal(perfil) {
  profileMenu?.classList.remove("open");
  deletingProfileId = perfil.id;
  if (deleteProfileNameText) deleteProfileNameText.innerText = perfil.name;
  deleteConfirmModal?.classList.add("open");
}

function closeDeleteModal() {
  deleteConfirmModal?.classList.remove("open");
  deletingProfileId = null;
}

// CORREÇÃO CRÍTICA AQUI: Usando for...of em vez de forEach assíncrono
saveProfileBtn?.addEventListener("click", async () => {
  const nome = profileNameInput ? profileNameInput.value.trim() : "";
  if (!nome) {
    alert("Informe o nome do perfil.");
    return;
  }

  if (editingProfileId) {
    const perfilRef = doc(db, "perfis", editingProfileId);
    await updateDoc(perfilRef, { name: nome, avatarUrl: selectedAvatarUrl });
  } else {
    const snapshot = await getDocs(profilesColRef);
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "perfis", docSnap.id), { selected: false });
    }

    await addDoc(profilesColRef, {
      name: nome,
      avatarUrl: selectedAvatarUrl,
      selected: true,
      createdAt: Date.now(),
    });
  }

  closeProfileModal();
  window.location.reload();
});

confirmDeleteBtn?.addEventListener("click", async () => {
  if (deletingProfileId) {
    await deleteDoc(doc(db, "perfis", deletingProfileId));
    closeDeleteModal();
    window.location.reload();
  }
});

// LISTENERS DE EVENTOS DOM
document
  .getElementById("closeModalBtn")
  ?.addEventListener("click", closeProfileModal);
document
  .getElementById("cancelModalBtn")
  ?.addEventListener("click", closeProfileModal);
document
  .getElementById("closeDeleteModalBtn")
  ?.addEventListener("click", closeDeleteModal);
document
  .getElementById("cancelDeleteBtn")
  ?.addEventListener("click", closeDeleteModal);

backButton?.addEventListener("click", () => window.history.back());
profileButton?.addEventListener("click", (e) => {
  e.stopPropagation();
  profileMenu?.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (
    profileMenu &&
    !profileMenu.contains(e.target) &&
    profileButton &&
    !profileButton.contains(e.target)
  ) {
    profileMenu.classList.remove("open");
  }

  if (!e.target.closest(".card-menu-wrapper")) {
    document
      .querySelectorAll(".card-dropdown-menu.open")
      .forEach((dropdown) => {
        dropdown.classList.remove("open");
      });
  }
});

switchProfileScreenBtn?.addEventListener("click", () => {
  profileMenu?.classList.remove("open");
  profileSelectionScreen?.classList.remove("hidden");
});

addProfileMenuBtn?.addEventListener("click", () => openProfileModal(null));

// EXPOSIÇÃO GLOBAL
window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

// INICIAR
listenToProfiles();
