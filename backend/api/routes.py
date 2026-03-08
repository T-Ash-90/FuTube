from flask import Blueprint, jsonify, request
from backend.storage.subscription_store import SubscriptionStore
from datetime import datetime
import yt_dlp
import feedparser
import time

FEED_CACHE = {
    "feed": [],
    "last_updated": 0
}

CACHE_TTL = 300

bp = Blueprint("api", __name__)
store = SubscriptionStore()

# --------------------------
# Test connection
# --------------------------
@bp.route("/api/test")
def test():
    return jsonify({"status": "ok", "message": "API is operational"})

# --------------------------
# Subscriptions endpoints
# --------------------------
@bp.route("/api/subscriptions", methods=["GET"])
def get_subscriptions():
    return jsonify(store.list_subscriptions()), 200

@bp.route("/api/subscriptions", methods=["POST"])
def add_subscription():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    channel_id = data.get("channel_id")
    channel_url = data.get("channel_url")
    channel_title = data.get("channel_title")

    if not all([channel_id, channel_url, channel_title]):
        return jsonify({"error": "Missing fields"}), 400

    added = store.add_subscription(channel_id, channel_url, channel_title)
    if not added:
        return jsonify({"error": "Subscription already exists"}), 409

    return jsonify({"message": "Subscription added"}), 201

@bp.route("/api/subscriptions/<channel_id>", methods=["DELETE"])
def remove_subscription(channel_id):
    removed = store.remove_subscription(channel_id)
    if not removed:
        return jsonify({"error": "Subscription not found"}), 404
    return jsonify({"message": "Subscription removed"}), 200

# --------------------------
# Search videos endpoint
# --------------------------
@bp.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": True,
    }

    search_results = []

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(f"ytsearch10:{query}", download=False)
            entries = result.get("entries", [])

            for entry in entries:
                video_url = entry.get("url")
                if not video_url.startswith("http"):
                    video_url = f"https://www.youtube.com/watch?v={entry.get('id')}"

                channel_id = entry.get("channel_id")
                channel_url = f"https://www.youtube.com/channel/{channel_id}" if channel_id else None

                search_results.append({
                    "id": entry.get("id"),
                    "title": entry.get("title"),
                    "webpage_url": video_url,
                    "duration": entry.get("duration"),
                    "uploader": entry.get("uploader"),
                    "channel_id": channel_id,
                    "channel_url": channel_url,
                    "channel_title": entry.get("uploader")
                })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(search_results), 200

# --------------------------
# Get latest videos for a channel
# --------------------------
@bp.route("/api/channel_videos/<channel_id>", methods=["GET"])
def get_channel_videos(channel_id):
    import yt_dlp

    if not channel_id:
        return jsonify({"error": "Missing channel_id"}), 400

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            channel_url = f"https://www.youtube.com/channel/{channel_id}"
            result = ydl.extract_info(channel_url, download=False)
            entries = result.get("entries", [])

            videos = []
            for entry in entries[:25]:  # latest 25 videos
                video_url = entry.get("url")
                if not video_url.startswith("http"):
                    video_url = f"https://www.youtube.com/watch?v={entry.get('id')}"

                videos.append({
                    "id": entry.get("id"),
                    "title": entry.get("title"),
                    "webpage_url": video_url,
                    "thumbnail": entry.get("thumbnail"),
                    "duration": entry.get("duration"),
                    "upload_date": entry.get("upload_date"),
                    "channel_id": entry.get("channel_id"),
                    "channel_url": f"https://www.youtube.com/channel/{entry.get('channel_id')}",
                    "channel_title": entry.get("uploader")
                })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(videos), 200

# --------------------------
# Video streaming endpoint
# --------------------------
@bp.route("/api/stream", methods=["GET"])
def stream_video():
    youtube_url = request.args.get("url", "").strip()
    if not youtube_url:
        return jsonify({"error": "Missing URL parameter"}), 400

    try:
        ydl_opts = {
            "quiet": True,
            "skip_download": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            stream_url = info.get("url")
            if not stream_url:
                return jsonify({"error": "Could not get stream URL"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"stream_url": stream_url})


# --------------------------
# Youtube RSS feed parser
# --------------------------

@bp.route("/api/feed", methods=["GET"])
def get_feed():
    global FEED_CACHE
    now = time.time()

    if FEED_CACHE["feed"] and now - FEED_CACHE["last_updated"] < CACHE_TTL:
        return jsonify(FEED_CACHE["feed"]), 200

    subscriptions = store.list_subscriptions()
    feed_videos = []

    for sub in subscriptions:
        channel_id = sub.get("channel_id")
        if not channel_id:
            continue

        feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        feed = feedparser.parse(feed_url)

        for entry in feed.entries[:10]:
            feed_videos.append({
                "video_id": entry.yt_videoid,
                "title": entry.title,
                "url": entry.link,
                "published": entry.published,
                "channel_id": channel_id,
                "channel_title": sub.get("channel_title"),
                "channel_url": sub.get("channel_url")
            })

    feed_videos.sort(key=lambda v: datetime.fromisoformat(v["published"]), reverse=True)

    FEED_CACHE["feed"] = feed_videos
    FEED_CACHE["last_updated"] = now

    return jsonify(feed_videos), 200
