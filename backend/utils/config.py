import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
DOWNLOADS_DIR = os.path.join(BASE_DIR, "..", "downloads")
CACHE_DIR = os.path.join(DATA_DIR, "cache")
