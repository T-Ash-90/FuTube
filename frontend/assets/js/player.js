function playVideo(youtubeUrl) {
    if (!youtubeUrl) {
        alert("No video URL provided");
        return;
    }

    if (!youtubeUrl.startsWith("http")) {
        youtubeUrl = "https://www.youtube.com/watch?v=" + youtubeUrl;
    }

    window.open(youtubeUrl, "_blank");
}
