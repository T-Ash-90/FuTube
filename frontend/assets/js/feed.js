const feedContainer = document.getElementById("feed-list");
let allVideos = [];
let loadedCount = 0;
const BATCH_SIZE = 20;

async function loadFeed() {
    feedContainer.innerHTML = "<p>Loading feed...</p>";

    try {
        const res = await fetch("/api/feed");
        if (!res.ok) throw new Error("Failed to load feed");

        allVideos = await res.json();
        loadedCount = 0;
        feedContainer.innerHTML = "";

        loadMoreVideos();

        // Infinite scroll
        window.addEventListener("scroll", handleScroll);
    } catch (err) {
        console.error(err);
        feedContainer.innerHTML = "<p>Error loading feed.</p>";
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

        // Info container
        const infoDiv = document.createElement("div");
        infoDiv.className = "video-info";

        // Title
        const titleLink = document.createElement("a");
        titleLink.href = video.url;
        titleLink.target = "_blank";
        titleLink.textContent = video.title;
        titleLink.className = "video-title";
        infoDiv.appendChild(titleLink);

        // Channel
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

        li.appendChild(infoDiv);
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
