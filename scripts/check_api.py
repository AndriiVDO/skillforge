import json
import time
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

BASE_URL = "http://127.0.0.1:5050"


def get_json(path):
    with urlopen(f"{BASE_URL}{path}", timeout=3) as response:
        return json.load(response)


def check(condition, message):
    if not condition:
        raise RuntimeError(message)


# Wait for the API process to start.
deadline = time.monotonic() + 30

while True:
    try:
        health = get_json("/api/health")
        check(health["status"] == "ok", "Unexpected API health status.")
        break
    except (URLError, TimeoutError):
        if time.monotonic() >= deadline:
            raise RuntimeError("API did not become available within 30 seconds.")
        time.sleep(1)

database = get_json("/api/health/db")
check(database["status"] == "ok", "Database connection failed.")

topics = get_json("/api/topics")
check(isinstance(topics, list), "Topics response must be a list.")

expected_slugs = {
    "web-development",
    "cms",
    "linux",
    "devops",
    "web-security",
}

actual_slugs = {topic["slug"] for topic in topics}

check(actual_slugs == expected_slugs, "Expected seeded topics are missing.")
check(len(topics) == len(expected_slugs), "Unexpected or duplicate topics.")

linux = get_json("/api/topics/linux")
check(linux["slug"] == "linux", "Topic detail returned the wrong topic.")
check(linux["taskCount"] == 3, "Linux task count is incorrect.")

try:
    get_json("/api/topics/unknown")
except HTTPError as error:
    check(error.code == 404, "Unknown topic should return HTTP 404.")
else:
    raise RuntimeError("Unknown topic unexpectedly returned success.")

print("PASS: database connection, seeded topics, topic detail, and HTTP 404.")