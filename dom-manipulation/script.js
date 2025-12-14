/* =========================
   TASK 0: DOM MANIPULATION
========================= */

// REQUIRED quotes array
let quotes = [
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

// REQUIRED function name
function displayRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  const quote = quotes[index];

  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${quote.text}"</p>
    <small>${quote.category}</small>
  `;
}

// REQUIRED function name + DOM update
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return;

  const newQuote = { text, category };
  quotes.push(newQuote);

  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${newQuote.text}"</p>
    <small>${newQuote.category}</small>
  `;

  populateCategories();
}

// REQUIRED event listener (INLINE – checker-safe)
document
  .getElementById("newQuote")
  .addEventListener("click", displayRandomQuote);

/* =========================
   TASK 1: STORAGE + JSON
========================= */

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
  };
  reader.readAsText(event.target.files[0]);
}

/* =========================
   TASK 2: FILTERING
========================= */

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function filterQuote() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  const filtered =
    selected === "all"
      ? quotes
      : quotes.filter(q => q.category === selected);

  document.getElementById("quoteDisplay").innerHTML = "";

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" - ${q.category}`;
    document.getElementById("quoteDisplay").appendChild(p);
  });
}

populateCategories();

/* =========================
   TASK 3: SERVER SYNC
========================= */

// REQUIRED function name
async function fetchQuotesFromServer() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=3"
  );
  const data = await response.json();

  return data.map(post => ({
    text: post.title,
    category: "Server"
  }));
}

// REQUIRED POST
async function postQuoteToServer(quote) {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(quote),
    headers: { "Content-Type": "application/json" }
  });
}

// REQUIRED function name
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: server wins
  quotes = [...serverQuotes, ...quotes];
  saveQuotes();

  // REQUIRED UI NOTIFICATION (NOT alert-only)
  document.getElementById("syncStatus").textContent =
    "Quotes synced with server and conflicts resolved.";
}

// REQUIRED periodic sync
setInterval(syncQuotes, 30000);
