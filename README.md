# FuTube: A Simple YouTube Feed & Subscription Client

FuTube started as a self-learning project to practice Python, Flask, JavaScript, and front-end integration. The aim of the project was to create a simple local YouTube client that allows the user to subscribe to channels and view video feeds without being logged in. Videos still open on YouTube itself, but this tool lets you quickly browse and manage subscriptions in a lightweight web app.

---

## Features

- Subscribe to YouTube channels without needing to be logged into a Google Account.
- View the latest videos from your subscriptions.
- Search for channels.
- Open videos directly on YouTube in your browser.

---

## Installation

#### Clone the repository:

<pre>git clone <your-repo-url>
cd futube</pre>

#### Create and activate a virtual environment:

<pre>source .venv/bin/activate   # On Windows: .venv\Scripts\activate</pre>

#### Install dependencies:

<pre>pip install -r requirements.txt</pre>

Make sure you have Python 3.10+ installed.

---

## Usage

Run the App in a Browser.

Start the Flask server with:

<pre>python3 run.py</pre>

Then open your browser and navigate to:
http://127.0.0.1:5000

---

## Learning Goals

- Understand how to use Flask for backend APIs.
- Build a small front-end interface with HTML, CSS, and JavaScript.
- Fetch and parse YouTube data using yt-dlp and RSS feeds.
- Practice caching and data handling.
- Build a functional full-stack Python project.

---

## Future Improvements

- Implement per-channel caching for faster feed updates.
- Pre-fetch feeds asynchronously.
- Improve error handling.
- Enhance UI with thumbnails and better styling.

---

## License

This project is for learning and personal use only. It is not intended for commercial production or redistribution.
