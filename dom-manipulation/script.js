/* =========================
    CORE DATA & INITIALIZATION
   ========================= */
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

/* =========================
    TASK 0: DOM MANIPULATION
   ========================= */

// Renamed to showRandomQuote per Task 0 requirements
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><em>Category: ${quote.category}</em></p>`;
  
  // Task 1: Store last viewed quote in session storage
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Requirement: Add Quote function
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";
    
    // Task 3: Post to server when adding
    postQuoteToServer(newQuote);
    alert("Quote added successfully!");
  }
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

/* =========================
    TASK 1: WEB STORAGE & JSON
   ========================= */

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const exportFileDefaultName = 'quotes.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

/* =========================
    TASK 2: FILTERING
   ========================= */

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Clear and reset
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem('lastFilter') || 'all';
  categoryFilter.value = lastFilter;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem('lastFilter', selectedCategory);
  
  const quoteDisplay = document.getElementById("quoteDisplay");
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const quote = filteredQuotes[0]; // Show the first one in that category
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><em>Category: ${quote.category}</em></p>`;
  } else {
    quoteDisplay.innerHTML = "No quotes in this category.";
  }
}

/* =========================
    TASK 3: SERVER SYNC
   ========================= */

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    // Simulate mapping server data to our quote format
    return serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  
  if (serverQuotes) {
    // Simple conflict resolution: server quotes are added if unique
    let newQuotesFound = false;
    serverQuotes.forEach(sQuote => {
      if (!quotes.some(lQuote => lQuote.text === sQuote.text)) {
        quotes.push(sQuote);
        newQuotesFound = true;
      }
    });

    if (newQuotesFound) {
      saveQuotes();
      populateCategories();
    }
    
    // Specific string requirement: "Quotes synced with server"
    document.getElementById("syncStatus").innerText = "Quotes synced with server";
    // Clear notification after 3 seconds
    setTimeout(() => { document.getElementById("syncStatus").innerText = ""; }, 3000);
  }
}

// Initial Setup
populateCategories();
showRandomQuote();
// Periodically sync every 30 seconds
setInterval(syncQuotes, 30000);