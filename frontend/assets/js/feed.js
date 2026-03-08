const feedContainer = document.getElementById("feed-list");
let allVideos = [];
let loadedCount = 0;
const BATCH_SIZE = 20;

async function loadFeed() {
    const loadingSpinner = document.getElementById("loading-spinner");
    const loadingText = document.getElementById("loading-text");

    // Show spinner and loading text
    loadingSpinner.style.display = "block";
    loadingText.style.display = "block";

    try {
        // Fetching data from the API
        const res = await fetch("/api/feed");

        if (!res.ok) {
            throw new Error("Failed to load feed");
        }

        allVideos = await res.json();
        loadedCount = 0;
        feedContainer.innerHTML = ""; // Clear current content

        // Hide spinner and update loading text
        loadingSpinner.style.display = "none";
        loadingText.style.display = "none";

        loadMoreVideos(); // Load the videos

        // Infinite scroll
        window.addEventListener("scroll", handleScroll);
    } catch (err) {
        console.error("Error loading feed:", err);

        // Hide spinner and show error message
        loadingSpinner.style.display = "none";
        loadingText.textContent = "Error loading feed. Please try again later.";
    }
}

async function refreshFeed() {
    console.log("Refreshing feed and resetting cache...");

    try {
        const response = await fetch("/api/feed/refresh", { method: "POST" });

        if (response.ok) {
            console.log("Cache reset successfully.");
            window.location.reload();
        } else {
            console.error("Failed to reset the cache.");
        }
    } catch (error) {
        console.error("Error during refresh:", error);
    }
}

function formatDuration(seconds) {
    if (!seconds) return "";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

function loadMoreVideos() {
    const ul = feedContainer.querySelector("ul") || document.createElement("ul");

    const nextBatch = allVideos.slice(loadedCount, loadedCount + BATCH_SIZE);

    nextBatch.forEach(video => {
        const li = document.createElement("li");

        // Thumbnail clickable
        const thumb = document.createElement("img");
        thumb.src = video.thumbnail;
        thumb.alt = video.title;
        thumb.className = "thumbnail";
        thumb.addEventListener("click", () => window.open(video.url, "_blank"));
        li.appendChild(thumb);

        // Info container for the video details
        const infoDiv = document.createElement("div");
        infoDiv.className = "video-info";

        // Title
        const titleLink = document.createElement("a");
        titleLink.href = video.url;
        titleLink.target = "_blank";
        titleLink.textContent = video.title;
        titleLink.className = "video-title";
        infoDiv.appendChild(titleLink);

        // Channel name
        const channelLink = document.createElement("a");
        channelLink.href = video.channel_url;
        channelLink.target = "_blank";
        channelLink.textContent = video.channel_title;
        channelLink.className = "channel-link";
        infoDiv.appendChild(channelLink);

        // Published date
        const pubDate = document.createElement("div");
        pubDate.textContent = new Date(video.published).toLocaleString();
        pubDate.className = "published-date";
        infoDiv.appendChild(pubDate);

        // Append the video info to the list item
        li.appendChild(infoDiv);

        // Add the video to the list
        ul.appendChild(li);
    });

    if (!feedContainer.querySelector("ul")) feedContainer.appendChild(ul);

    loadedCount += nextBatch.length;
}

function handleScroll() {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (scrollBottom && loadedCount < allVideos.length) {
        loadMoreVideos();
    }
}

document.addEventListener("DOMContentLoaded", loadFeed);
