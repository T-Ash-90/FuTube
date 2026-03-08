// feed.js - fully refactored
const feedContainer = document.getElementById("feed-list");
let allVideos = [];
let loadedCount = 0;
const BATCH_SIZE = 20;

// Load feed from API
async function loadFeed() {
    feedContainer.innerHTML = "";
    const loading = document.createElement("p");
    loading.textContent = "Loading feed...";
    feedContainer.appendChild(loading);

    try {
        const res = await fetch("/api/feed");
        if (!res.ok) throw new Error("Failed to load feed");

        allVideos = await res.json();
        loadedCount = 0;
        feedContainer.innerHTML = "";

        // Create the grid container
        const ul = document.createElement("ul");
        feedContainer.appendChild(ul);

        loadMoreVideos(ul);

        // Infinite scroll
        window.addEventListener("scroll", () => handleScroll(ul));
    } catch (err) {
        console.error(err);
        feedContainer.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Error loading feed.";
        feedContainer.appendChild(errorMsg);
    }
}

// Format duration in seconds -> mm:ss
function formatDuration(seconds) {
    if (!seconds) return "";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

// Load next batch of videos
function loadMoreVideos(ul) {
    const nextBatch = allVideos.slice(loadedCount, loadedCount + BATCH_SIZE);

    nextBatch.forEach(video => {
        const li = document.createElement("li");

        // Thumbnail wrapper
        const thumbWrapper = document.createElement("div");
        thumbWrapper.className = "thumbnail-wrapper";
        thumbWrapper.style.position = "relative";

        const img = document.createElement("img");
        img.src = video.thumbnail;
        img.alt = video.title;
        img.style.width = "100%";
        img.style.display = "block";
        thumbWrapper.appendChild(img);

        if (video.duration) {
            const durationDiv = document.createElement("div");
            durationDiv.className = "duration";
            durationDiv.textContent = formatDuration(video.duration);
            durationDiv.style.position = "absolute";
            durationDiv.style.bottom = "5px";
            durationDiv.style.right = "5px";
            durationDiv.style.background = "rgba(0,0,0,0.8)";
            durationDiv.style.color = "#fff";
            durationDiv.style.padding = "2px 5px";
            durationDiv.style.fontSize = "12px";
            durationDiv.style.borderRadius = "3px";
            thumbWrapper.appendChild(durationDiv);
        }

        // Video info
        const infoDiv = document.createElement("div");
        infoDiv.className = "video-info";
        infoDiv.style.padding = "10px";
        infoDiv.style.display = "flex";
        infoDiv.style.flexDirection = "column";
        infoDiv.style.justifyContent = "space-between";

        const titleLink = document.createElement("a");
        titleLink.href = video.url;
        titleLink.target = "_blank";
        titleLink.className = "video-title";
        titleLink.textContent = video.title;
        titleLink.style.fontWeight = "bold";
        titleLink.style.color = "#0073e6";
        titleLink.style.textDecoration = "none";
        titleLink.style.marginBottom = "5px";

        const channelLink = document.createElement("a");
        channelLink.href = video.channel_url;
        channelLink.target = "_blank";
        channelLink.className = "channel-link";
        channelLink.textContent = video.channel_title;
        channelLink.style.color = "#555";
        channelLink.style.fontStyle = "italic";
        channelLink.style.fontSize = "14px";
        channelLink.style.textDecoration = "none";

        const publishedDiv = document.createElement("div");
        publishedDiv.className = "published-date";
        publishedDiv.textContent = new Date(video.published).toLocaleString();
        publishedDiv.style.fontSize = "12px";
        publishedDiv.style.color = "#888";
        publishedDiv.style.marginTop = "5px";

        infoDiv.appendChild(titleLink);
        infoDiv.appendChild(channelLink);
        infoDiv.appendChild(publishedDiv);

        li.appendChild(thumbWrapper);
        li.appendChild(infoDiv);

        ul.appendChild(li);
    });

    loadedCount += nextBatch.length;
}

// Infinite scroll handler
function handleScroll(ul) {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (scrollBottom && loadedCount < allVideos.length) {
        loadMoreVideos(ul);
    }
}

document.addEventListener("DOMContentLoaded", loadFeed);
