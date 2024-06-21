from flask import Flask, render_template, request, jsonify
import httpx
from selectolax.parser import HTMLParser

app = Flask(__name__)

# This function is responsible for getting the initial HTML from the webpage
def get_html(url):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    resp = httpx.get(url, headers=headers, follow_redirects=True)
    return resp

# This function extracts text from HTML using the provided selector
def extract_text(html, sel):
    try:
        parsed_html = HTMLParser(html.text)
        if sel == "p":
            return [element.text() for element in parsed_html.css(sel)]
        elif sel == "h1":
            return parsed_html.css_first(sel).text()
    except AttributeError:
        return None

# This function will fetch <a></a> element using its class name
def extract_headline_link(html, class_name):
    try:
        parsed_html = HTMLParser(html.text)
        element = parsed_html.css_first(f'.{class_name.replace(" ", ".")}')
        if element:
            return element.attrs.get('href')
        return None
    except AttributeError:
        return None

# This will format the inputted text depending on its type (e.g., h1 or p)
def format_text(text, type):
    if type == "p":
        formatted_text = []
        for element in text:
            if element:
                formatted_text.append(element.replace("ā", ''))
        return formatted_text
    elif type == "h1":
        return text

# This function calculates an estimated reading time based on the text
def get_reading_time(text):
    total_words = sum(len(paragraph.split()) for paragraph in text)
    return total_words // 200  # Calculates the reading time in minutes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch', methods=['POST'])
def fetch():
    data = request.json
    url = data['url']
    html = get_html(url)
    header = extract_text(html, "h1")
    text = extract_text(html, "p")
    header = format_text(header, "h1")
    text = format_text(text, "p")
    reading_time = get_reading_time(text)
    return jsonify(header=header, text=text, reading_time=reading_time)

@app.route('/wiki_search', methods=['POST'])
def wiki_search():
    data = request.json
    search_term = data['term']
    wiki_url = f"https://en.wikipedia.org/wiki/{search_term}"
    html = get_html(wiki_url)
    header = extract_text(html, "h1")
    text = extract_text(html, "p")
    header = format_text(header, "h1")
    text = format_text(text, "p")
    reading_time = get_reading_time(text)
    return jsonify(header=header, text=text, reading_time=reading_time, url=wiki_url)

@app.route('/open_headline', methods=['POST'])
def open_headline():
    base_url = "https://www.bbc.co.uk/news"
    html = get_html(base_url)
    headline_link = extract_headline_link(html, "ssrcss-afqep1-PromoLink exn3ah91")
    return jsonify(url=headline_link)

if __name__ == '__main__':
    app.run(debug=True)
