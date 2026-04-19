from __future__ import annotations

from datetime import timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "output"
LOGS_DIR = PROJECT_ROOT / "logs"

SOURCE_PAGE_URL = (
    "https://www.fifa.com/pt/tournaments/mens/worldcup/"
    "canadamexicousa2026/scores-fixtures"
)
MATCHES_API_URL = (
    "https://api.fifa.com/api/v3/calendar/matches"
    "?language=pt&count=500&idSeason=285023"
)
STAGES_API_URL = "https://api.fifa.com/api/v3/stages?idSeason=285023&language=pt"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
)

CALENDAR_NAME = "Copa do Mundo FIFA 2026"
CALENDAR_TZID = "America/Sao_Paulo"
CALENDAR_TZ = ZoneInfo(CALENDAR_TZID)
DEFAULT_MATCH_DURATION = timedelta(hours=3)

FIXTURES_JSON_PATH = OUTPUT_DIR / "world_cup_2026_fixtures.json"
FIXTURES_CSV_PATH = OUTPUT_DIR / "world_cup_2026_fixtures.csv"
FIXTURES_ICS_PATH = OUTPUT_DIR / "world_cup_2026_fixtures.ics"
RAW_MATCHES_PATH = OUTPUT_DIR / "world_cup_2026_source_matches_raw.json"
RAW_STAGES_PATH = OUTPUT_DIR / "world_cup_2026_source_stages_raw.json"
DIFF_JSON_PATH = OUTPUT_DIR / "world_cup_2026_diff_summary.json"
DIFF_TXT_PATH = OUTPUT_DIR / "world_cup_2026_diff_summary.txt"
RUN_SUMMARY_PATH = LOGS_DIR / "last_run_summary.json"

COUNTRY_NAMES = {
    "CAN": "Canadá",
    "MEX": "México",
    "USA": "Estados Unidos",
}

CSV_FIELD_ORDER = [
    "stable_id",
    "uid",
    "source_match_id",
    "fifa_match_number",
    "stage",
    "group_or_round",
    "home_team",
    "away_team",
    "kickoff_source_raw",
    "kickoff_utc",
    "kickoff_brt",
    "venue_name",
    "city",
    "country",
    "source_url",
    "source_api_url",
    "source_last_seen_at",
    "source_hash",
    "stage_id",
    "group_id",
    "match_status",
    "time_defined",
    "home_team_code",
    "away_team_code",
    "venue_country_code",
    "duration_minutes",
]
