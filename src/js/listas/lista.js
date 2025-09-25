// ===================================
// Lógica para o Bloco de Ideias
// ===================================
let currentEmoji = "😀";

function saveIdea() {
  const input = document.getElementById("idea-input");
  const newIdea = {
    text: input.value.trim(),
    emoji: currentEmoji,
  };
  if (newIdea.text === "") {
    return;
  }
  let ideias = JSON.parse(localStorage.getItem("ideias")) || [];
  ideias.push(newIdea);
  localStorage.setItem("ideias", JSON.stringify(ideias));
  input.value = "";
  renderIdeias();
}

function renderIdeias() {
  const container = document.getElementById("ideias-container");
  let ideias = JSON.parse(localStorage.getItem("ideias")) || [];
  container.innerHTML = "";
  ideias.forEach((idea, index) => {
    const ideaDiv = document.createElement("div");
    ideaDiv.className = "ideia-item";
    ideaDiv.innerHTML = `
      <div class="ideia-content">
        <span class="emoji">${idea.emoji}</span>
        <span>${idea.text}</span>
      </div>
      <button class="delete-button" onclick="deleteIdea(${index})">Excluir</button>
    `;
    container.appendChild(ideaDiv);
  });
}

function deleteIdea(index) {
  let ideias = JSON.parse(localStorage.getItem("ideias")) || [];
  ideias.splice(index, 1);
  localStorage.setItem("ideias", JSON.stringify(ideias));
  renderIdeias();
}

// Lógica para esconder e mostrar a lista de ideias
const toggleIdeasButton = document.getElementById("toggle-ideas-button");
const ideasListWrapper = document.getElementById("ideas-list-wrapper");

toggleIdeasButton.addEventListener("click", () => {
  if (ideasListWrapper.style.display === "none") {
    ideasListWrapper.style.display = "block";
    toggleIdeasButton.textContent = "Esconder Lista";
  } else {
    ideasListWrapper.style.display = "none";
    toggleIdeasButton.textContent = "Mostrar Lista";
  }
});

// Lógica para o seletor de emoji
const emojiPicker = document.querySelector("emoji-picker");
const emojiButton = document.getElementById("emoji-button");
const selectedEmojiSpan = document.getElementById("selected-emoji");

emojiButton.addEventListener("click", () => {
  emojiPicker.style.display =
    emojiPicker.style.display === "block" ? "none" : "block";
});

emojiPicker.addEventListener("emoji-click", (event) => {
  currentEmoji = event.detail.unicode;
  selectedEmojiSpan.textContent = currentEmoji;
  emojiPicker.style.display = "none";
});

// ===================================
// Lógica para a Lista de Compras
// ===================================
function addItem() {
  const quantity = document.getElementById("quantity-input").value;
  const productName = document
    .getElementById("product-name-input")
    .value.trim();
  const unitPrice = document.getElementById("price-input").value;

  if (productName === "" || quantity <= 0 || unitPrice < 0) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  const totalPrice = (parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2);

  const newItem = {
    quantity: quantity,
    productName: productName,
    unitPrice: parseFloat(unitPrice).toFixed(2),
    totalPrice: parseFloat(totalPrice),
  };

  let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
  shoppingList.push(newItem);
  localStorage.setItem("shoppingList", JSON.stringify(shoppingList));

  document.getElementById("quantity-input").value = "1";
  document.getElementById("product-name-input").value = "";
  document.getElementById("price-input").value = "";

  renderShoppingList();
}

function renderShoppingList() {
  const container = document.getElementById("item-list-container");
  let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

  container.innerHTML = "";
  let grandTotal = 0;

  shoppingList.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-list";
    itemDiv.innerHTML = `
      <span>${item.quantity}</span>
      <span>${item.productName}</span>
      <span>R$ ${item.unitPrice}</span>
      <span>R$ ${item.totalPrice.toFixed(2)}</span>
      <button class="delete-button" onclick="deleteItem(${index})">Excluir</button>
    `;
    container.appendChild(itemDiv);

    grandTotal += item.totalPrice;
  });

  document.getElementById("total-price").textContent = `R$ ${grandTotal.toFixed(
    2
  )}`;
}

function deleteItem(index) {
  let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
  shoppingList.splice(index, 1);
  localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
  renderShoppingList();
}

// Lógica para esconder e mostrar a lista de compras
const toggleShoppingButton = document.getElementById("toggle-shopping-button");
const shoppingListWrapper = document.getElementById("shopping-list-wrapper");

toggleShoppingButton.addEventListener("click", () => {
  if (shoppingListWrapper.style.display === "none") {
    shoppingListWrapper.style.display = "block";
    toggleShoppingButton.textContent = "Esconder Lista";
  } else {
    shoppingListWrapper.style.display = "none";
    toggleShoppingButton.textContent = "Mostrar Lista";
  }
});

// ===================================
// Lógica para a Lista de Viagens
// ===================================
function saveTrip() {
  const date = document.getElementById("trip-date-input").value.trim();
  const location = document.getElementById("trip-location-input").value.trim();

  if (date === "" || location === "") {
    alert("Por favor, preencha a data e o local da viagem.");
    return;
  }

  const newTrip = {
    date: date,
    location: location,
  };

  let tripList = JSON.parse(localStorage.getItem("tripList")) || [];
  tripList.push(newTrip);
  localStorage.setItem("tripList", JSON.stringify(tripList));

  document.getElementById("trip-date-input").value = "";
  document.getElementById("trip-location-input").value = "";

  renderTripList();
}

function renderTripList() {
  const container = document.getElementById("trip-list-container");
  let tripList = JSON.parse(localStorage.getItem("tripList")) || [];

  container.innerHTML = "";

  tripList.forEach((trip, index) => {
    const tripDiv = document.createElement("div");
    tripDiv.className = "trip-item";
    tripDiv.innerHTML = `
      <div>
        <p><strong>Local:</strong> ${trip.location}</p>
        <p><strong>Data:</strong> ${trip.date}</p>
      </div>
      <button class="delete-button" onclick="deleteTrip(${index})">Excluir</button>
    `;
    container.appendChild(tripDiv);
  });
}

function deleteTrip(index) {
  let tripList = JSON.parse(localStorage.getItem("tripList")) || [];
  tripList.splice(index, 1);
  localStorage.setItem("tripList", JSON.stringify(tripList));
  renderTripList();
}

// Lógica para esconder e mostrar a lista de viagens
const toggleTripButton = document.getElementById("toggle-trip-button");
const tripListWrapper = document.getElementById("trip-list-wrapper");

toggleTripButton.addEventListener("click", () => {
  if (tripListWrapper.style.display === "none") {
    tripListWrapper.style.display = "block";
    toggleTripButton.textContent = "Esconder Lista";
  } else {
    tripListWrapper.style.display = "none";
    toggleTripButton.textContent = "Mostrar Lista";
  }
});

// Chamar as funções de renderização ao carregar a página
window.onload = () => {
  renderIdeias();
  renderShoppingList();
  renderTripList();
};
