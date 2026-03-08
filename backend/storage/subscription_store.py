import csv
import os
from backend.utils.config import DATA_DIR

SUBSCRIPTIONS_FILE = os.path.join(DATA_DIR, "subscriptions.csv")


def clean_channel_title(title):
    """Remove quotes and trim whitespace from channel titles."""
    if not title:
        return ""
    return title.replace('"', "").strip()


def normalize_headers(row):
    mapping = {
        "Channel ID": "channel_id",
        "Channel URL": "channel_url",
        "Channel title": "channel_title",
        "channel_id": "channel_id",
        "channel_url": "channel_url",
        "channel_title": "channel_title"
    }

    normalized = {mapping.get(k, k): v for k, v in row.items()}

    if "channel_title" in normalized:
        normalized["channel_title"] = clean_channel_title(
            normalized["channel_title"]
        )

    return normalized


def sort_subscriptions(rows):
    """Sort rows alphabetically by channel_title (case-insensitive)."""
    return sorted(
        rows,
        key=lambda r: clean_channel_title(
            r.get("channel_title", "")
        ).lower()
    )


def write_csv(filepath, rows):
    """Write rows to CSV in canonical format."""
    canonical_fields = ["channel_id", "channel_url", "channel_title"]

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=canonical_fields)
        writer.writeheader()

        for row in rows:
            writer.writerow({
                "channel_id": row.get("channel_id", ""),
                "channel_url": row.get("channel_url", ""),
                "channel_title": clean_channel_title(
                    row.get("channel_title", "")
                )
            })


def normalize_csv_file(filepath):
    """
    Normalize headers, clean titles, and ensure sorted order.
    """
    if not os.path.exists(filepath):
        return

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [normalize_headers(r) for r in reader]

    rows = sort_subscriptions(rows)
    write_csv(filepath, rows)


class SubscriptionStore:
    def __init__(self, filepath=SUBSCRIPTIONS_FILE):
        self.filepath = filepath

        if not os.path.exists(self.filepath):
            write_csv(self.filepath, [])
        else:
            normalize_csv_file(self.filepath)

    def list_subscriptions(self):
        """Return all subscriptions."""
        with open(self.filepath, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = [normalize_headers(r) for r in reader]

        return rows

    def add_subscription(self, channel_id, channel_url, channel_title):
        """Add new subscription and keep CSV sorted."""
        subscriptions = self.list_subscriptions()

        existing_ids = [s["channel_id"] for s in subscriptions]
        if channel_id in existing_ids:
            return False

        subscriptions.append({
            "channel_id": channel_id,
            "channel_url": channel_url,
            "channel_title": clean_channel_title(channel_title)
        })

        subscriptions = sort_subscriptions(subscriptions)
        write_csv(self.filepath, subscriptions)

        return True

    def remove_subscription(self, channel_id):
        """Remove subscription and keep CSV sorted."""
        target_id = channel_id.strip()

        subscriptions = self.list_subscriptions()

        remaining = [
            s for s in subscriptions
            if s["channel_id"].strip() != target_id
        ]

        if len(remaining) == len(subscriptions):
            return False

        remaining = sort_subscriptions(remaining)
        write_csv(self.filepath, remaining)

        return True
