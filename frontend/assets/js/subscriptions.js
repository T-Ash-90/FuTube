const subscriptionsContainer = document.getElementById("subscriptions-list");

// -------------------
// Fetch and display subscriptions
// -------------------
async function loadSubscriptions() {
    subscriptionsContainer.innerHTML = "<p>Loading subscriptions...</p>";

    try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) throw new Error("Failed to load subscriptions");

        const subscriptions = await res.json();

        if (!subscriptions.length) {
            subscriptionsContainer.innerHTML = "<p>No subscriptions yet.</p>";
            return;
        }

        // Render as list
        const ul = document.createElement("ul");
        subscriptions.forEach(sub => {
            const li = document.createElement("li");

            li.innerHTML = `
                <span>${sub.channel_title}</span>
                <div>
                    <button onclick="window.open('${sub.channel_url}', '_blank')">Open Channel</button>
                    <button onclick="unsubscribe('${sub.channel_id}')">Unsubscribe</button>
                </div>
            `;

            ul.appendChild(li);
        });

        subscriptionsContainer.innerHTML = "";
        subscriptionsContainer.appendChild(ul);

    } catch (err) {
        console.error(err);
        subscriptionsContainer.innerHTML = "<p>Error loading subscriptions.</p>";
    }
}

// -------------------
// Unsubscribe from a channel
// -------------------
async function unsubscribe(channelId) {
    try {
        const res = await fetch(`/api/subscriptions/${channelId}`, { method: "DELETE" });

        if (!res.ok) {
            const data = await res.json();
            alert(data.error || "Failed to unsubscribe");
            return;
        }

        // Refresh the list after removing
        loadSubscriptions();
    } catch (err) {
        console.error(err);
        alert("Error unsubscribing from channel");
    }
}

// -------------------
// Add subscription (if you have inputs for adding)
// -------------------
const addBtn = document.getElementById("add_subscription_btn");
if (addBtn) {
    addBtn.addEventListener("click", async () => {
        const channelIdInput = document.getElementById("channel_id");
        const channelUrlInput = document.getElementById("channel_url");
        const channelTitleInput = document.getElementById("channel_title");

        const payload = {
            channel_id: channelIdInput.value.trim(),
            channel_url: channelUrlInput.value.trim(),
            channel_title: channelTitleInput.value.trim()
        };

        try {
            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to add subscription");
            } else {
                // Clear inputs
                channelIdInput.value = "";
                channelUrlInput.value = "";
                channelTitleInput.value = "";
                // Reload subscriptions
                loadSubscriptions();
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// -------------------
// Load subscriptions on page load
// -------------------
document.addEventListener("DOMContentLoaded", loadSubscriptions);
