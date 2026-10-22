import json
import time
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = "http://127.0.0.1:5051"


def request(method, path, data=None):
    body = None if data is None else json.dumps(data).encode("utf-8")

    http_request = Request(
        f"{BASE_URL}{path}",
        data=body,
        headers={"Content-Type": "application/json"},
        method=method,
    )

    try:
        with urlopen(http_request, timeout=5) as response:
            return response.status, json.load(response)
    except HTTPError as error:
        return error.code, error.read().decode("utf-8")


def check(condition, message):
    if not condition:
        raise RuntimeError(message)


deadline = time.monotonic() + 30

while True:
    try:
        status, _ = request("GET", "/api/health")
        check(status == 200, "API health check failed.")
        break
    except (URLError, TimeoutError):
        if time.monotonic() >= deadline:
            raise RuntimeError("API did not start within 30 seconds.")
        time.sleep(1)


slug = f"ci-topic-{uuid.uuid4().hex[:12]}"

topic_input = {
    "slug": slug,
    "title": "CI learning topic",
    "category": "Testing",
    "description": "Created by the automated integration check.",
    "outcome": "Verify that writing data works.",
}

# Invalid topic must be rejected.
invalid_topic = {**topic_input, "title": ""}
status, _ = request("POST", "/api/topics", invalid_topic)
check(status == 400, "An empty topic title should return HTTP 400.")

# Create a topic.
status, _ = request("POST", "/api/topics", topic_input)
check(status == 201, "Creating a topic should return HTTP 201.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "The created topic cannot be retrieved.")
check(topic["lessons"] == [], "A new topic should have no tasks.")
check(topic["taskCount"] == 0, "A new topic should have taskCount 0.")

# Duplicate slugs must be rejected.
status, _ = request("POST", "/api/topics", topic_input)
check(status == 409, "A duplicate slug should return HTTP 409.")

# Edit the topic.
updated_topic = {**topic_input, "title": "Updated CI topic"}
status, _ = request("PUT", f"/api/topics/{slug}", updated_topic)
check(status == 200, "Editing a topic should return HTTP 200.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "The edited topic cannot be retrieved.")
check(topic["title"] == "Updated CI topic", "The edited title was not saved.")

# Changing the slug must be rejected.
changed_slug = {**updated_topic, "slug": f"{slug}-changed"}
status, _ = request("PUT", f"/api/topics/{slug}", changed_slug)
check(status == 400, "Changing a topic slug should return HTTP 400.")

# Invalid tasks must be rejected.
status, _ = request(
    "POST",
    f"/api/topics/{slug}/lessons",
    {"title": "", "description": "Invalid task"},
)
check(status == 400, "An empty task title should return HTTP 400.")

# Add two tasks.
lesson_ids = []

for title in ["First task", "Second task"]:
    status, lesson = request(
        "POST",
        f"/api/topics/{slug}/lessons",
        {
            "title": title,
            "description": f"Complete and explain the {title.lower()}.",
        },
    )

    check(status == 201, "Adding a task should return HTTP 201.")
    lesson_ids.append(lesson["id"])

check(len(set(lesson_ids)) == 2, "Tasks must have different IDs.")

# Verify persistence, order, and count.
status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the topic after adding tasks.")
check(topic["taskCount"] == 2, "The topic should contain two tasks.")

check(
    [lesson["title"] for lesson in topic["lessons"]]
    == ["First task", "Second task"],
    "Tasks were not saved in the correct order.",
)

check(
    [lesson["id"] for lesson in topic["lessons"]] == lesson_ids,
    "Saved task IDs do not match the returned IDs.",
)

# Editing topic details must preserve its tasks.
status, _ = request("PUT", f"/api/topics/{slug}", updated_topic)
check(status == 200, "Editing a populated topic failed.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the populated topic.")
check(len(topic["lessons"]) == 2, "Editing topic details removed its tasks.")

# A task cannot be added to a missing topic.
status, _ = request(
    "POST",
    f"/api/topics/missing-{slug}/lessons",
    {"title": "Example task", "description": "Example description"},
)
check(status == 404, "A missing topic should return HTTP 404.")

print("PASS: topic creation, editing, validation, and task persistence.")