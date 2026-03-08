const feedContainer = document.getElementById("feed-list");

async function loadFeed() {
    feedContainer.innerHTML = "<p>Loading feed...</p>";

    try {
        const res = await fetch("/api/feed");
        if (!res.ok) throw new Error("Failed to load feed");

        const videos = await res.json();

        if (!videos.length) {
            feedContainer.innerHTML = "<p>No videos yet.</p>";
            return;
        }

        const ul = document.createElement("ul");

        videos.forEach(video => {
            const li = document.createElement("li");

            li.innerHTML = `
                <a href="${video.url}" target="_blank" class="video-title">${video.title}</a>
                <p>Channel: <a href="${video.channel_url}" target="_blank" class="channel-link">${video.channel_title}</a></p>
                <p>Published: ${new Date(video.published).toLocaleString()}</p>
            `;

            ul.appendChild(li);
        });

        feedContainer.innerHTML = "";
        feedContainer.appendChild(ul);

    } catch (err) {
        console.error(err);
        feedContainer.innerHTML = "<p>Error loading feed.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadFeed);
