const searchBtn = document.getElementById("search-btn");
const searchQuery = document.getElementById("search-query");
const resultsContainer = document.getElementById("search-results");

let subscribedChannels = new Set(); // store subscribed channel IDs

// Fetch current subscriptions
async function loadSubscriptions() {
    try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) throw new Error("Failed to load subscriptions");
        const subs = await res.json();
        subscribedChannels = new Set(subs.map(s => s.channel_id));
    } catch (err) {
        console.error("Error loading subscriptions", err);
        subscribedChannels = new Set();
    }
}

// Search channels
async function searchChannels() {
    const query = searchQuery.value.trim();
    if (!query) return;

    resultsContainer.innerHTML = "<p>Searching...</p>";

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");

        const videos = await res.json();

        // Extract unique channels
        const channelsMap = {};
        videos.forEach(v => {
            if (v.channel_id && !channelsMap[v.channel_id]) {
                channelsMap[v.channel_id] = {
                    channel_id: v.channel_id,
                    channel_title: v.channel_title,
                    channel_url: v.channel_url
                };
            }
        });

        const channels = Object.values(channelsMap);

        if (!channels.length) {
            resultsContainer.innerHTML = "<p>No channels found.</p>";
            return;
        }

        // Render channels
        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.padding = "0";

        channels.forEach(ch => {
            const li = document.createElement("li");
            li.style.background = "#fff";
            li.style.padding = "10px";
            li.style.marginBottom = "10px";
            li.style.borderRadius = "6px";
            li.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.1)";
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";

            const isSubscribed = subscribedChannels.has(ch.channel_id);
            const btnText = isSubscribed ? "Subscribed" : "Subscribe";

            li.innerHTML = `
                <span>
                    <a href="${ch.channel_url}" target="_blank" class="channel-link">${ch.channel_title}</a>
                </span>
                <button ${isSubscribed ? "disabled" : ""} onclick="subscribeChannel('${ch.channel_id}', '${ch.channel_url}', '${ch.channel_title}', this)">
                    ${btnText}
                </button>
            `;

            ul.appendChild(li);
        });

        resultsContainer.innerHTML = "";
        resultsContainer.appendChild(ul);

    } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = "<p>Error searching channels.</p>";
    }
}

// Subscribe function with button update
async function subscribeChannel(channelId, channelUrl, channelTitle, btn) {
    try {
        const res = await fetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                channel_id: channelId,
                channel_url: channelUrl,
                channel_title: channelTitle
            })
        });

        if (!res.ok) {
            const data = await res.json();
            alert(data.error || "Failed to subscribe");
            return;
        }

        // Update UI
        subscribedChannels.add(channelId);
        btn.innerText = "Subscribed";
        btn.disabled = true;

        alert(`Subscribed to ${channelTitle}!`);
    } catch (err) {
        console.error(err);
        alert("Error subscribing to channel");
    }
}

// Event listeners
searchBtn.addEventListener("click", searchChannels);
searchQuery.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchChannels();
});

// Load subscriptions on page load
document.addEventListener("DOMContentLoaded", loadSubscriptions);
