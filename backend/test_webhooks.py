import asyncio
import httpx
import hmac
import hashlib
import json

BASE_URL = "http://127.0.0.1:8000/api"
HEADERS = {
    "Authorization": "Bearer test-dev-token",
    "X-User-Id": "dev-user"  # Dev mock for tests
}

def generate_github_signature(payload: str, secret: str = "test-secret") -> str:
    return "sha256=" + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

def generate_slack_signature(payload: str, secret: str = "test-secret") -> str:
    # Slack uses v0=<hmac>
    return "v0=" + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

async def test_webhooks():
    # Because of Settings logic, local settings might not have secrets, or they are empty strings.
    # To properly test, we usually assume empty secret ignores validation or validation passes if we send no signature and there's no secret configured.
    # To be safe, we'll try without signature, if it fails, we know it's missing or we should bypass it.
    # In config, github_webhook_secret = "" by default so it passes.
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create a test github event
        github_payload_bytes = json.dumps({
            "action": "opened",
            "repository": {"full_name": "test-org/test-repo"},
            "issue": {"title": "Test Issue", "html_url": "https://github.com/issue/1"},
            "sender": {"login": "test-user"}
        }).encode("utf-8")
        
        from app.config import get_settings
        settings = get_settings()

        github_headers = {**HEADERS, "X-GitHub-Event": "issues"}
        if settings.github_webhook_secret:
            github_headers["X-Hub-Signature-256"] = generate_github_signature(github_payload_bytes.decode('utf-8'), settings.github_webhook_secret)

        github_url = f"{BASE_URL}/webhooks/github"
        
        print(f"Testing POST {github_url} ...")
        res = await client.post(github_url, content=github_payload_bytes, headers=github_headers)
        print("GitHub Webhook Response:", res.status_code, res.text)
        assert res.status_code == 200, "GitHub webhook failed"

        # Create a test slack event
        slack_payload_bytes = json.dumps({
            "type": "event_callback",
            "event": {"type": "message", "text": "Hello Slack", "user": "U123456"}
        }).encode("utf-8")
        
        slack_headers = dict(HEADERS)
        if settings.slack_signing_secret:
            slack_headers["X-Slack-Signature"] = generate_slack_signature(slack_payload_bytes.decode('utf-8'), settings.slack_signing_secret)

        slack_url = f"{BASE_URL}/webhooks/slack"
        print(f"Testing POST {slack_url} ...")
        res = await client.post(slack_url, content=slack_payload_bytes, headers=slack_headers)
        print("Slack Webhook Response:", res.status_code, res.text)
        assert res.status_code == 200, "Slack webhook failed"

        # Create a test jira event
        jira_payload_bytes = json.dumps({
            "webhookEvent": "jira:issue_created",
            "issue": {"key": "TEST-1", "fields": {"summary": "A test issue"}},
            "user": {"displayName": "JiraUser"}
        }).encode("utf-8")
        
        jira_headers = dict(HEADERS)
        if settings.jira_webhook_secret:
            jira_headers["X-Webhook-Secret"] = settings.jira_webhook_secret

        jira_url = f"{BASE_URL}/webhooks/jira"
        print(f"Testing POST {jira_url} ...")
        res = await client.post(jira_url, content=jira_payload_bytes, headers=jira_headers)
        print("Jira Webhook Response:", res.status_code, res.text)
        assert res.status_code == 200, "Jira webhook failed"
        
        # Test signature failure for github
        if settings.github_webhook_secret:
            print("Testing invalid signature...")
            bad_headers = {**HEADERS, "X-GitHub-Event": "issues", "X-Hub-Signature-256": "sha256=invalid"}
            res = await client.post(github_url, content=github_payload_bytes, headers=bad_headers)
            print("GitHub Invalid Sign Response:", res.status_code, res.text)
            assert res.status_code == 401, "Expected 401 Unauthorized"

        # Verify dashboard activity updates
        print("Validating Dashboard / Activity endpoint...")
        dashboard_url = f"{BASE_URL}/dashboard"
        res = await client.get(dashboard_url, headers=HEADERS)
        assert res.status_code == 200
        data = res.json()
        activities = data.get("workspace_activity", [])
        
        titles = [a["title"] for a in activities]
        print(f"Recent dashboard activities: {titles}")
        assert any("GitHub issues: test-org/test-repo" in t for t in titles) or any("test-org" in t for t in titles), "GitHub activity missing"
        assert any("Slack message" in t for t in titles) or any("Slack" in t for t in titles), "Slack activity missing"
        
        # also test /api/activity
        activity_url = f"{BASE_URL}/activity"
        res = await client.get(activity_url, headers=HEADERS)
        assert res.status_code == 200
        data = res.json()
        titles_api = [a["title"] for a in data]
        assert any("GitHub issues: test-org/test-repo" in t for t in titles_api) or any("test-org" in t for t in titles_api), "Missing in /api/activity"
        print("All Tests Passed! 🎉")
        
if __name__ == "__main__":
    asyncio.run(test_webhooks())
