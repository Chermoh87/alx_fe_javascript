let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>Category: ${quote.category}</small>
  `;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return;

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

newQuoteBtn.addEventListener("click", showRandomQuote);

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
