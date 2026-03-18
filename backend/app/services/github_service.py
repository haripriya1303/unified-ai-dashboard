import uuid
from datetime import datetime
import asyncio
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.user_integration import UserIntegration
from app.db.models.integration import Integration
from app.db.models.workspace_activity import WorkspaceActivity
from app.db.models.user import User

from app.config import get_settings

async def sync_github_activity(session: AsyncSession, user_id: str):
    # 1. Get user integration for GitHub
    stmt = (
        select(UserIntegration)
        .join(Integration)
        .where(UserIntegration.user_id == user_id)
        .where(Integration.name == "GitHub")
    )
    result = await session.execute(stmt)
    user_integration = result.scalar_one_or_none()

    if not user_integration or not user_integration.config or "access_token" not in user_integration.config:
        return

    access_token = user_integration.config["access_token"]
    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        # GET /user/repos
        repos_resp = await client.get("https://api.github.com/user/repos", headers=headers)
        if repos_resp.status_code != 200:
            return
        repos = repos_resp.json()

        for repo in repos:
            owner = repo["owner"]["login"]
            repo_name = repo["name"]

            # GET /repos/{owner}/{repo}/issues
            issues_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}/issues", headers=headers)
            if issues_resp.status_code == 200:
                issues = issues_resp.json()
                for issue in issues:
                    if "pull_request" not in issue: # skip PRs in issues response
                        await add_github_event(
                            session=session,
                            user_id=user_id,
                            title=issue["title"],
                            description=f"Issue #{issue['number']}",
                            url=issue["html_url"],
                            type="comment",
                            actor=issue["user"]["login"],
                            created_at=issue["created_at"]
                        )
            
            # GET /repos/{owner}/{repo}/pulls
            pulls_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}/pulls", headers=headers)
            if pulls_resp.status_code == 200:
                pulls = pulls_resp.json()
                for pr in pulls:
                    await add_github_event(
                        session=session,
                        user_id=user_id,
                        title=pr["title"],
                        description=f"PR #{pr['number']}",
                        url=pr["html_url"],
                        type="pr",
                        actor=pr["user"]["login"],
                        created_at=pr["created_at"]
                    )
        
        await session.commit()

async def add_github_event(session: AsyncSession, user_id: str, title: str, description: str, url: str, type: str, actor: str, created_at: str):
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    except:
        dt = datetime.utcnow()
        
    activity = WorkspaceActivity(
        id=str(uuid.uuid4()),
        user_id=user_id,
        source="GitHub",
        title=title,
        description=description,
        url=url,
        type=type,
        actor=actor,
        event_at=dt,
        created_at=dt
    )
    session.add(activity)

async def register_github_webhooks(session: AsyncSession, user_id: str):
    stmt = (
        select(UserIntegration)
        .join(Integration)
        .where(UserIntegration.user_id == user_id)
        .where(Integration.name == "GitHub")
    )
    result = await session.execute(stmt)
    user_integration = result.scalar_one_or_none()

    if not user_integration or not user_integration.config or "access_token" not in user_integration.config:
        return

    access_token = user_integration.config["access_token"]
    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    
    settings = get_settings()

    webhook_url = f"{settings.api_url}/api/webhooks/github"  # placeholder base url

    async with httpx.AsyncClient() as client:
        repos_resp = await client.get("https://api.github.com/user/repos", headers=headers)
        if repos_resp.status_code == 200:
            repos = repos_resp.json()
            for repo in repos:
                owner = repo["owner"]["login"]
                repo_name = repo["name"]
                
                hook_data = {
                    "name": "web",
                    "active": True,
                    "events": ["push", "pull_request", "issues"],
                    "config": {
                        "url": webhook_url,
                        "content_type": "json",
                        "insecure_ssl": "0"
                    }
                }
                
                from app.config import get_settings
                settings = get_settings()
                if settings.github_webhook_secret:
                    hook_data["config"]["secret"] = settings.github_webhook_secret
                
                await client.post(
                    f"https://api.github.com/repos/{owner}/{repo_name}/hooks",
                    headers=headers,
                    json=hook_data
                )

