import csv
import os
from backend.utils.config import DATA_DIR

SUBSCRIPTIONS_FILE = os.path.join(DATA_DIR, "subscriptions.csv")


def normalize_headers(row):
    mapping = {
        "Channel ID": "channel_id",
        "Channel URL": "channel_url",
        "Channel title": "channel_title",
        "channel_id": "channel_id",
        "channel_url": "channel_url",
        "channel_title": "channel_title"
    }
    return {mapping.get(k, k): v for k, v in row.items()}


def normalize_csv_file(filepath):
    """
    Reads the CSV, normalizes headers, and rewrites it in canonical format.
    """
    canonical_fields = ["channel_id", "channel_url", "channel_title"]

    if not os.path.exists(filepath):
        return

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [normalize_headers(r) for r in reader]

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=canonical_fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


class SubscriptionStore:
    def __init__(self, filepath=SUBSCRIPTIONS_FILE):
        self.filepath = filepath
        if not os.path.exists(self.filepath):
            with open(self.filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["channel_id", "channel_url", "channel_title"])

    def list_subscriptions(self):
        """Return all subscriptions as list of dicts with normalized keys"""
        subscriptions = []
        with open(self.filepath, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                subscriptions.append(normalize_headers(row))
        return subscriptions

    def add_subscription(self, channel_id, channel_url, channel_title):
        """Add new subscription, avoid duplicates"""
        existing_ids = [s["channel_id"] for s in self.list_subscriptions()]
        if channel_id in existing_ids:
            return False
        with open(self.filepath, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([channel_id, channel_url, channel_title])
        return True

    def remove_subscription(self, channel_id):
        """Remove a subscription by channel_id"""
        target_id = channel_id.strip()
        subscriptions = self.list_subscriptions()
        remaining_subs = [s for s in subscriptions if s["channel_id"].strip() != target_id]

        if len(remaining_subs) == len(subscriptions):
            return False

        canonical_fields = ["channel_id", "channel_url", "channel_title"]
        with open(self.filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=canonical_fields)
            writer.writeheader()
            for sub in remaining_subs:
                writer.writerow({
                    "channel_id": sub.get("channel_id", ""),
                    "channel_url": sub.get("channel_url", ""),
                    "channel_title": sub.get("channel_title", "")
                })

        return True
