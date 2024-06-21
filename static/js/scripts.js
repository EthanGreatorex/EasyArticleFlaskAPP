// call function to clear page on load
clearText();

// Variables
url_array = []; // of string
pointer = -1

// function for displaying history drop down menu
document.addEventListener("DOMContentLoaded", function() {
  const button = document.getElementById("dropdownButton");
  const menu = document.getElementById("dropdownMenu");

  button.addEventListener("click", function(){
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  // Close the dropdown menu if user clicks outside of it
  window.addEventListener("click", function(event){
    if (!button.contains(event.target) && !menu.contains(event.target)){
      menu.style.display = "none";
    }
  })
})

function openHistoryURL(id){
  url = id
  document.getElementById("urlInput").value = url;
  fetchData();
}

// function for updating history list. Takes data.header (of article) as parameter and data.url (of article)
function updateHistory(url, header){
  duplicate = false
  for(let i = 0; i < url_array.length; i++){
    console.log(url_array[i])
    if (url_array[i] == url){
      duplicate = true;
    };
  }
  console.log(duplicate)
  if(duplicate == false){
    // update pointer
    pointer = pointer + 1
    // store the url in our url_array
    url_array[pointer] = url;
    // Add url to history list
    dropdownMenu = document.getElementById("dropdownMenu");
    const newLink = document.createElement("a");
    newLink.id = url;
    newLink.textContent = header;
    newLink.onclick = function(){
      openHistoryURL(newLink.id)
    }
    dropdownMenu.appendChild(newLink);
    }
   
};

async function fetchData() {
  // Fetch user URL input
  const url = document.getElementById("urlInput").value;

  // Fetch the new data
  const response = await fetch("/fetch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url }),
  });
  const data = await response.json();
  document.getElementById("headerText").innerText = data.header;
  document.getElementById(
    "readingTimeText"
  ).innerText = `Estimated reading time: ${data.reading_time} minutes`;
  document.getElementById("textArea").value = data.text.join("\n\n");

  updateHistory(url, data.header);
}

function saveText() {
  const text = document.getElementById("textArea").value;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "article.txt";
  a.click();
}

function openFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById("textArea").value = event.target.result;
    };
    reader.readAsText(file);
  };
  input.click();
}


// function which clears the article text box and url input box
function clearText() {
  document.getElementById("headerText").innerText = "";
  document.getElementById("readingTimeText").innerText = "";
  document.getElementById("urlInput").value = "";
  document.getElementById("textArea").value = "";
}

// function which opens the <url> in the input box at its source.
function openWebsite() {
  const url = document.getElementById("urlInput").value;
  if (url) {
    window.open(url);
  }
}

// Prompts the user for a wiki search term
function openWikiSearch() {
  const term = prompt("Enter wiki search term");
  if (term) {
    fetchWikiData(term);
  }
}

async function fetchWikiData(term) {

  const response = await fetch("/wiki_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ term: term }),
  });
  const data = await response.json();
  document.getElementById("urlInput").value = data.url;
  document.getElementById("headerText").innerText = data.header;
  document.getElementById(
    "readingTimeText"
  ).innerText = `Estimated reading time: ${data.reading_time} minutes`;
  document.getElementById("textArea").value = data.text.join("\n\n");

  updateHistory(`https://en.wikipedia.org/wiki/${term}`, data.header);
}

async function openHeadline() {
  const response = await fetch("/open_headline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  url = `https://www.bbc.co.uk${data.url}`;
  document.getElementById("urlInput").value = url;
  fetchData();
}

