import json
import time
import uuid
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = "http://127.0.0.1:5051"
access_token = None


def request(method, path, data=None, *, authenticated=True):
    body = None if data is None else json.dumps(data).encode("utf-8")

    headers = {"Content-Type": "application/json"}

    if authenticated and access_token:
        headers["Authorization"] = f"Bearer {access_token}"

    http_request = Request(
        f"{BASE_URL}{path}",
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(http_request, timeout=5) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw.strip() else None
    except HTTPError as error:
        return error.code, error.read().decode("utf-8")


def check(condition, message):
    if not condition:
        raise RuntimeError(message)


def check_public_visibility(slug, published):
    status, catalog = request(
        "GET", "/api/topics", authenticated=False
    )
    check(status == 200, "The public catalog is unavailable.")
    check(isinstance(catalog, list), "The catalog must be a list.")

    check(
        all(item.get("isPublished") is True for item in catalog),
        "The public catalog contains unpublished content.",
    )

    visible = any(item["slug"] == slug for item in catalog)
    check(
        visible == published,
        f"Unexpected public catalog visibility for {slug}.",
    )

    status, detail = request(
        "GET", f"/api/topics/{slug}", authenticated=False
    )

    if published:
        check(status == 200, "A published topic must be publicly accessible.")
        check(
            detail["isPublished"] is True,
            "The public topic must have isPublished=true.",
        )
        return detail

    check(status == 404, "A draft topic must return HTTP 404 publicly.")
    return None

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

# Write endpoints must reject anonymous requests.
anonymous_topic = {
    "slug": "anonymous-topic",
    "title": "Anonymous topic",
    "category": "Testing",
    "description": "This must not be saved.",
    "outcome": "Verify authorization.",
}

anonymous_requests = [
    ("POST", "/api/topics", anonymous_topic),
    (
        "PUT",
        "/api/topics/linux",
        {**anonymous_topic, "slug": "linux"},
    ),
    (
        "POST",
        "/api/topics/linux/lessons",
        {"title": "Blocked task", "description": "Must not be saved."},
    ),
    (
        "POST",
        "/api/topics/linux/resources",
        {"title": "Blocked resource", "url": "https://example.com/"},
    ),
        (
        "PUT",
        "/api/topics/linux/lessons/linux-files",
        {"title": "Blocked edit", "description": "Must not be saved."},
    ),
    ("DELETE", "/api/topics/linux/lessons/linux-files", None),
    (
        "PUT",
        "/api/topics/linux/resources/1",
        {"title": "Blocked edit", "url": "https://example.com/"},
    ),
    ("DELETE", "/api/topics/linux/resources/1", None),
    ("DELETE", "/api/topics/linux", None),
]

for method, path, payload in anonymous_requests:
    status, _ = request(method, path, payload)
    check(status == 401, f"Anonymous {method} {path} should return 401.")

# Sign in as the temporary CI administrator.
status, session = request(
    "POST",
    "/api/auth/login",
    {
        "email": os.environ["BootstrapAdmin__Email"],
        "password": os.environ["BootstrapAdmin__Password"],
    },
)

check(status == 200, "Administrator login failed.")
check(
    isinstance(session, dict) and bool(session.get("accessToken")),
    "Login did not return an access token.",
)

access_token = session["accessToken"]

status, identity = request("GET", "/api/auth/me")
check(status == 200, "Authenticated administrator could not access /me.")
check(identity["role"] == "Admin", "The account must have the Admin role.")


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

check(
    topic["isPublished"] is False,
    "A newly created topic must be a draft.",
)

check_public_visibility(slug, False)

status, admin_catalog = request("GET", "/api/topics")
check(status == 200, "The administrator catalog is unavailable.")
check(
    any(
        item["slug"] == slug and item["isPublished"] is False
        for item in admin_catalog
    ),
    "The administrator must see the draft in the catalog.",
)

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

# Invalid URL schemes must be rejected.
status, _ = request(
    "POST",
    f"/api/topics/{slug}/resources",
    {
        "title": "Invalid resource",
        "url": "javascript:alert(1)",
    },
)
check(status == 400, "A non-HTTP URL should return HTTP 400.")

# Invalid input must not create a resource.
status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the topic.")
check(topic["resources"] == [], "An invalid resource was saved.")

# Add a valid resource.
resource_input = {
    "title": "PostgreSQL Documentation",
    "url": "https://www.postgresql.org/docs/",
}

status, resource = request(
    "POST",
    f"/api/topics/{slug}/resources",
    resource_input,
)
check(status == 201, "Adding a resource should return HTTP 201.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the resource's topic.")
check(len(topic["resources"]) == 1, "The resource was not saved.")
check(
    topic["resources"][0]["url"] == resource_input["url"],
    "The saved resource URL is incorrect.",
)
check(
    len(topic["lessons"]) == 2,
    "Adding a resource changed the topic's tasks.",
)

# A populated draft must remain private.
check_public_visibility(slug, False)

status, draft_before = request("GET", f"/api/topics/{slug}")
check(status == 200, "The administrator cannot read the populated draft.")
check(draft_before["isPublished"] is False, "The topic must still be a draft.")

publication_path = f"/api/topics/{slug}/publication"

# Anonymous callers must not publish or unpublish content.
for published in [True, False]:
    status, _ = request(
        "PUT",
        publication_path,
        {"isPublished": published},
        authenticated=False,
    )
    check(status == 401, "Anonymous publication changes must return HTTP 401.")

check_public_visibility(slug, False)

# Missing, null, and incorrectly typed values must be rejected.
for invalid_payload in [
    {},
    {"isPublished": None},
    {"isPublished": "true"},
]:
    status, _ = request("PUT", publication_path, invalid_payload)
    check(status == 400, "Invalid publication input must return HTTP 400.")

status, unchanged = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not verify rejected publication changes.")
check(
    unchanged["isPublished"] is False,
    "A rejected request changed publication status.",
)

status, _ = request(
    "PUT",
    f"/api/topics/missing-{slug}/publication",
    {"isPublished": True},
)
check(status == 404, "Publishing a missing topic must return HTTP 404.")

# Publish and verify public access to the full content.
status, _ = request(
    "PUT", publication_path, {"isPublished": True}
)
check(status == 204, "Publishing must return HTTP 204.")

public_topic = check_public_visibility(slug, True)
check(
    public_topic["lessons"] == draft_before["lessons"],
    "Publishing changed or omitted the lessons.",
)
check(
    public_topic["resources"] == draft_before["resources"],
    "Publishing changed or omitted the resources.",
)
check(
    public_topic["taskCount"] == draft_before["taskCount"],
    "Publishing changed the task count.",
)

# Editing topic details must preserve publication status.
status, _ = request("PUT", f"/api/topics/{slug}", updated_topic)
check(status == 200, "Editing a published topic failed.")
check_public_visibility(slug, True)

# Move back to drafts and verify both public entry points.
status, _ = request(
    "PUT", publication_path, {"isPublished": False}
)
check(status == 204, "Moving a topic to drafts must return HTTP 204.")

check_public_visibility(slug, False)

status, draft_after = request("GET", f"/api/topics/{slug}")
check(status == 200, "The administrator must still access the draft.")
check(draft_after["isPublished"] is False, "The topic must be a draft.")
check(
    draft_after["lessons"] == draft_before["lessons"],
    "Unpublishing changed the lessons.",
)
check(
    draft_after["resources"] == draft_before["resources"],
    "Unpublishing changed the resources.",
)
check(
    draft_after["taskCount"] == draft_before["taskCount"],
    "Unpublishing changed the task count.",
)

status, admin_catalog = request("GET", "/api/topics")
check(status == 200, "Could not retrieve the administrator catalog.")
check(
    any(
        item["slug"] == slug and item["isPublished"] is False
        for item in admin_catalog
    ),
    "The unpublished topic disappeared from the administrator catalog.",
)

# Missing topics must be rejected.
status, _ = request(
    "POST",
    f"/api/topics/missing-{slug}/resources",
    resource_input,
)
check(status == 404, "A missing topic should return HTTP 404.")

# Resource IDs must be included in the public API response.
resource_id = resource["id"]

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the topic before editing.")
check(
    topic["resources"][0]["id"] == resource_id,
    "The resource ID is missing or incorrect.",
)

lesson_path = f"/api/topics/{slug}/lessons/{lesson_ids[0]}"
resource_path = f"/api/topics/{slug}/resources/{resource_id}"

lesson_update = {
    "title": "Updated first task",
    "description": "Updated task description.",
}
resource_update = {
    "title": "Updated documentation",
    "url": "https://www.postgresql.org/docs/current/",
}

# Invalid edits must be rejected.
status, _ = request("PUT", lesson_path, {**lesson_update, "title": ""})
check(status == 400, "An invalid task edit should return HTTP 400.")

status, _ = request(
    "PUT",
    resource_path,
    {**resource_update, "url": "javascript:alert(1)"},
)
check(status == 400, "An invalid resource edit should return HTTP 400.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not check rejected edits.")
check(
    topic["lessons"][0]["title"] == "First task",
    "A rejected task edit changed saved data.",
)
check(
    topic["resources"][0]["url"] == resource_input["url"],
    "A rejected resource edit changed saved data.",
)

# Another existing topic must not be able to address these items.
for collection, item_id, payload in [
    ("lessons", lesson_ids[0], lesson_update),
    ("resources", resource_id, resource_update),
]:
    wrong_topic_path = f"/api/topics/linux/{collection}/{item_id}"

    status, _ = request("PUT", wrong_topic_path, payload)
    check(status == 404, "Editing through the wrong topic must return 404.")

    status, _ = request("DELETE", wrong_topic_path)
    check(status == 404, "Deleting through the wrong topic must return 404.")

# Valid edits preserve IDs and ordering.
status, _ = request("PUT", lesson_path, lesson_update)
check(status == 204, "Editing a task should return HTTP 204.")

status, _ = request("PUT", resource_path, resource_update)
check(status == 204, "Editing a resource should return HTTP 204.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve edited content.")
check(
    [lesson["id"] for lesson in topic["lessons"]] == lesson_ids,
    "Editing changed task IDs or their order.",
)
check(
    topic["lessons"][0]["title"] == lesson_update["title"]
    and topic["lessons"][0]["description"] == lesson_update["description"],
    "The task edit was not saved.",
)
check(
    topic["resources"][0] == {"id": resource_id, **resource_update},
    "The resource edit was not saved correctly.",
)
check(topic["taskCount"] == 2, "Editing changed the task count.")

# Deletion removes only the selected item.
status, _ = request("DELETE", lesson_path)
check(status == 204, "Deleting a task should return HTTP 204.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the topic after deletion.")
check(
    [lesson["id"] for lesson in topic["lessons"]] == [lesson_ids[1]],
    "Deleting a task removed the wrong item.",
)
check(topic["taskCount"] == 1, "Task count was not updated.")
check(len(topic["resources"]) == 1, "Deleting a task removed a resource.")

status, _ = request("DELETE", lesson_path)
check(status == 404, "Deleting a missing task should return HTTP 404.")

status, _ = request("PUT", lesson_path, lesson_update)
check(status == 404, "Editing a missing task should return HTTP 404.")

status, _ = request("DELETE", resource_path)
check(status == 204, "Deleting a resource should return HTTP 204.")

status, _ = request("DELETE", resource_path)
check(status == 404, "Deleting a missing resource should return HTTP 404.")

status, _ = request("PUT", resource_path, resource_update)
check(status == 404, "Editing a missing resource should return HTTP 404.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not verify resource deletion.")
check(topic["resources"] == [], "The deleted resource is still present.")
check(topic["taskCount"] == 1, "Resource deletion changed the task count.")

# Adding after deletion must work with gaps in the stored positions.
status, new_lesson = request(
    "POST",
    f"/api/topics/{slug}/lessons",
    {"title": "New task", "description": "Added after deletion."},
)
check(status == 201, "Adding a task after deletion failed.")

status, new_resource = request(
    "POST",
    f"/api/topics/{slug}/resources",
    resource_input,
)
check(status == 201, "Adding a resource after deletion failed.")

status, topic = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the final topic.")
check(
    [lesson["id"] for lesson in topic["lessons"]]
    == [lesson_ids[1], new_lesson["id"]],
    "Task order is incorrect after deletion and insertion.",
)
check(topic["taskCount"] == 2, "Final task count is incorrect.")
check(
    [item["id"] for item in topic["resources"]] == [new_resource["id"]],
    "The replacement resource was not saved.",
)

# Delete the temporary topic after testing its lessons and resources.
status, _ = request("DELETE", f"/api/topics/{slug}")
check(status == 204, "Deleting a topic should return HTTP 204.")

status, _ = request("GET", f"/api/topics/{slug}")
check(status == 404, "The deleted topic is still accessible.")

status, catalog = request("GET", "/api/topics")
check(status == 200, "Could not retrieve the catalog after deletion.")
check(
    all(item["slug"] != slug for item in catalog),
    "The deleted topic is still present in the catalog.",
)

status, _ = request("DELETE", f"/api/topics/{slug}")
check(status == 404, "Deleting a missing topic should return HTTP 404.")

# Reusing the slug must create a fresh topic without old content.
status, _ = request("POST", "/api/topics", topic_input)
check(status == 201, "Could not recreate the deleted topic.")

status, recreated = request("GET", f"/api/topics/{slug}")
check(status == 200, "Could not retrieve the recreated topic.")
check(recreated["lessons"] == [], "The recreated topic has old tasks.")
check(recreated["resources"] == [], "The recreated topic has old resources.")
check(recreated["taskCount"] == 0, "The recreated topic has a stale task count.")

status, _ = request("DELETE", f"/api/topics/{slug}")
check(status == 204, "Could not clean up the recreated topic.")

print(
    "PASS: authorized content management, publication, "
    "draft privacy, and input validation."
)