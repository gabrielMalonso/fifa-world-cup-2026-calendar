from __future__ import annotations

import json
from typing import Any
from urllib.request import Request, urlopen

from .config import MATCHES_API_URL, STAGES_API_URL, USER_AGENT


def fetch_json(url: str) -> Any:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request) as response:
        return json.load(response)


def fetch_source_payloads() -> tuple[dict[str, Any], dict[str, Any]]:
    matches_payload = fetch_json(MATCHES_API_URL)
    stages_payload = fetch_json(STAGES_API_URL)
    return matches_payload, stages_payload
