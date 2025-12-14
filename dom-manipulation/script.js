// Required quotes array
const quotes = [
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

// Required DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// REQUIRED NAME
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>${quote.category}</small>
  `;
}

// REQUIRED NAME
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return;

  quotes.push({ text, category });
}

// REQUIRED EVENT LISTENER
newQuoteBtn.addEventListener("click", displayRandomQuote);

// Export JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}
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

  quoteDisplay.innerHTML = "";

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" - ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

// Restore filter on load
const savedCategory = localStorage.getItem("selectedCategory");
if (savedCategory) {
  document.getElementById("categoryFilter").value = savedCategory;
  filterQuote();
}

async function fetchServerQuotes() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
  const data = await res.json();

  return data.map(post => ({
    text: post.title,
    category: "Server"
  }));
}

async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();
  quotes = [...serverQuotes, ...quotes];
  saveQuotes();
  populateCategories();
  alert("Server sync completed. Server data applied.");
}

setInterval(syncWithServer, 30000);


