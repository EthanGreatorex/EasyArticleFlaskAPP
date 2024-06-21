// call function to clear page on load
clearText();

// Variables
url_array = []; // of string
pointer = -1;

async function fetchData() {
  // Fetch user URL input
  const url = document.getElementById("urlInput").value;
  // increase our pointer
  pointer += 1;
  // store the url in our url_array
  // url_array.push(url);
  url_array[pointer] = url;

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

function clearText() {
  document.getElementById("headerText").innerText = "";
  document.getElementById("readingTimeText").innerText = "";
  document.getElementById("urlInput").value = "";
  document.getElementById("textArea").value = "";
}

function openWebsite() {
  const url = document.getElementById("urlInput").value;
  if (url) {
    window.open(url);
  }
}

function openWikiSearch() {
  const term = prompt("Enter wiki search term");
  if (term) {
    fetchWikiData(term);
  }
}

async function fetchWikiData(term) {
  // store the url in our url_array
  url_array.push(`https://en.wikipedia.org/wiki/${term}`);
  // increase our pointer
  pointer += 1;

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

function previousArticle() {
  // only attempt to access previous url if not first article
  if (pointer > 0) {
    pointer -= 1;
    // set the url input to the previous url
    document.getElementById("urlInput").value = url_array[pointer];
    // decrease pointer again to compensate for the pointer increase inside fetch function
    pointer -= 1;
    // fetch the url at that pointer and display on page
    fetchData();
  } else {
    console.log("no option to go back");
  }
}

function forwardArticle() {
  // only attempt if there is an article infront of our current one
  length = url_array.length - 1;
  if ((pointer < length) & (pointer != length)) {
    pointer += 1;
    // set the url input to the new url
    document.getElementById("urlInput").value = url_array[pointer];
    // decrease pointer again to compensate for the pointer increase inside fetch function
    pointer -= 1;
    // fetch the url
    fetchData();
  } else {
    console.log("no article to move forwards to.");
  }
}
