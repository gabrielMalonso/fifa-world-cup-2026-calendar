from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .config import (
    BRAZIL_CALENDAR_NAME,
    BRAZIL_ICS_PATH,
    BRAZIL_ICS_V2_PATH,
    BRAZIL_TEAM_NAMES,
    CALENDAR_TZ,
    FIXTURES_CSV_PATH,
    FIXTURES_ICS_PATH,
    FIXTURES_ICS_V2_PATH,
    FIXTURES_JSON_PATH,
    DEFAULT_MATCH_DURATION,
    DIFF_JSON_PATH,
    DIFF_TXT_PATH,
    COUNTRY_NAMES,
    LOGS_DIR,
    MATCHES_API_URL,
    NON_BRAZIL_CALENDAR_NAME,
    NON_BRAZIL_ICS_PATH,
    NON_BRAZIL_ICS_V2_PATH,
    OUTPUT_DIR,
    RAW_MATCHES_PATH,
    RAW_STAGES_PATH,
    RUN_SUMMARY_PATH,
    SOURCE_PAGE_URL,
)
from .exporters import write_csv, write_ics, write_json
from .fifa_api import fetch_source_payloads


def _localized_text(items: list[dict[str, Any]] | None) -> str | None:
    if not items:
        return None

    for locale in ("pt-BR", "pt", "en-GB", "en"):
        for item in items:
            if item.get("Locale") == locale and item.get("Description"):
                return item["Description"]

    for item in items:
        description = item.get("Description")
        if description:
            return description
    return None


def _team_name(side: dict[str, Any] | None, placeholder: str | None) -> str:
    if side:
        team_name = _localized_text(side.get("TeamName"))
        if team_name:
            return team_name
    return placeholder or "A definir"


def _host_country_name(code: str | None) -> str | None:
    if not code:
        return None
    return COUNTRY_NAMES.get(code, code)


def _stable_id(match_number: int | None, source_match_id: str) -> str:
    if match_number is not None:
        return f"fifa-wc2026-match-{match_number:03d}"
    return f"fifa-wc2026-source-{source_match_id}"


def _uid_for_fixture(stable_id: str) -> str:
    return f"{stable_id}@fifa-world-cup-2026-calendar.local"


def _parse_fifa_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def _canonical_hash(payload: dict[str, Any]) -> str:
    serialized = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def _build_stage_lookup(stages_payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        stage["IdStage"]: {
            "name": _localized_text(stage.get("Name")),
            "sequence_order": stage.get("SequenceOrder"),
        }
        for stage in stages_payload.get("Results", [])
    }


def normalize_fixture(
    raw_match: dict[str, Any],
    stage_lookup: dict[str, dict[str, Any]],
    fetched_at: datetime,
) -> dict[str, Any]:
    kickoff_utc = _parse_fifa_datetime(raw_match["Date"])
    kickoff_brt = kickoff_utc.astimezone(CALENDAR_TZ)
    end_brt = kickoff_brt + DEFAULT_MATCH_DURATION

    stage_id = raw_match.get("IdStage")
    group_name = _localized_text(raw_match.get("GroupName"))
    stage_name = _localized_text(raw_match.get("StageName")) or stage_lookup.get(stage_id, {}).get("name")
    source_match_id = str(raw_match["IdMatch"])
    fifa_match_number = raw_match.get("MatchNumber")
    stable_id = _stable_id(fifa_match_number, source_match_id)
    home_team = _team_name(raw_match.get("Home"), raw_match.get("PlaceHolderA"))
    away_team = _team_name(raw_match.get("Away"), raw_match.get("PlaceHolderB"))
    is_brazil_match = home_team in BRAZIL_TEAM_NAMES or away_team in BRAZIL_TEAM_NAMES

    stadium = raw_match.get("Stadium") or {}
    venue_country_code = stadium.get("IdCountry")

    return {
        "stable_id": stable_id,
        "uid": _uid_for_fixture(stable_id),
        "source_match_id": source_match_id,
        "fifa_match_number": fifa_match_number,
        "stage": stage_name,
        "group_or_round": group_name or stage_name,
        "home_team": home_team,
        "away_team": away_team,
        "kickoff_source_raw": json.dumps(
            {
                "Date": raw_match.get("Date"),
                "LocalDate": raw_match.get("LocalDate"),
                "TimeDefined": raw_match.get("TimeDefined"),
            },
            ensure_ascii=False,
            sort_keys=True,
        ),
        "kickoff_utc": kickoff_utc.isoformat().replace("+00:00", "Z"),
        "kickoff_brt": kickoff_brt.isoformat(),
        "end_brt": end_brt.isoformat(),
        "venue_name": _localized_text(stadium.get("Name")),
        "city": _localized_text(stadium.get("CityName")),
        "country": _host_country_name(venue_country_code),
        "source_url": SOURCE_PAGE_URL,
        "source_api_url": MATCHES_API_URL,
        "source_last_seen_at": fetched_at.isoformat().replace("+00:00", "Z"),
        "source_hash": _canonical_hash(raw_match),
        "stage_id": stage_id,
        "group_id": raw_match.get("IdGroup"),
        "match_status": raw_match.get("MatchStatus"),
        "time_defined": raw_match.get("TimeDefined"),
        "home_team_code": (raw_match.get("Home") or {}).get("Abbreviation"),
        "away_team_code": (raw_match.get("Away") or {}).get("Abbreviation"),
        "venue_country_code": venue_country_code,
        "duration_minutes": int(DEFAULT_MATCH_DURATION.total_seconds() // 60),
        "is_brazil_match": is_brazil_match,
    }


def validate_outputs(fixtures: list[dict[str, Any]], ics_text: str) -> list[str]:
    issues: list[str] = []
    event_count = ics_text.count("BEGIN:VEVENT")

    if event_count != len(fixtures):
        issues.append(
            f"ICS com {event_count} eventos, mas a lista normalizada tem {len(fixtures)} partidas."
        )

    if "BEGIN:VCALENDAR" not in ics_text or "END:VCALENDAR" not in ics_text:
        issues.append("ICS sem cabeçalho/rodapé de calendário.")

    uids = [fixture["uid"] for fixture in fixtures]
    if len(uids) != len(set(uids)):
        issues.append("UIDs duplicados no conjunto de eventos.")

    for fixture in fixtures:
        if not fixture["kickoff_utc"].endswith("Z"):
            issues.append(f"{fixture['stable_id']} sem UTC canônico.")
        if not fixture["kickoff_brt"].endswith("-03:00"):
            issues.append(f"{fixture['stable_id']} sem horário BRT esperado.")

    return issues


def _load_previous_fixtures(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _comparable_fixture(fixture: dict[str, Any]) -> dict[str, Any]:
    ignored = {"source_last_seen_at"}
    return {key: value for key, value in fixture.items() if key not in ignored}


def build_diff_summary(
    previous: list[dict[str, Any]],
    current: list[dict[str, Any]],
) -> dict[str, Any]:
    previous_by_id = {item["stable_id"]: item for item in previous}
    current_by_id = {item["stable_id"]: item for item in current}

    new_ids = sorted(set(current_by_id) - set(previous_by_id))
    removed_ids = sorted(set(previous_by_id) - set(current_by_id))
    changed: list[dict[str, Any]] = []

    for stable_id in sorted(set(previous_by_id) & set(current_by_id)):
        before = _comparable_fixture(previous_by_id[stable_id])
        after = _comparable_fixture(current_by_id[stable_id])
        if before == after:
            continue

        field_changes = []
        for field_name in sorted(set(before) | set(after)):
            if before.get(field_name) != after.get(field_name):
                field_changes.append(
                    {
                        "field": field_name,
                        "before": before.get(field_name),
                        "after": after.get(field_name),
                    }
                )
        changed.append({"stable_id": stable_id, "changes": field_changes})

    return {
        "previous_count": len(previous),
        "current_count": len(current),
        "new_count": len(new_ids),
        "removed_count": len(removed_ids),
        "changed_count": len(changed),
        "new_matches": [current_by_id[stable_id] for stable_id in new_ids],
        "removed_matches": [previous_by_id[stable_id] for stable_id in removed_ids],
        "changed_matches": changed,
    }


def _render_diff_summary_text(diff_summary: dict[str, Any]) -> str:
    lines = [
        f"Anterior: {diff_summary['previous_count']}",
        f"Atual: {diff_summary['current_count']}",
        f"Novas: {diff_summary['new_count']}",
        f"Removidas: {diff_summary['removed_count']}",
        f"Alteradas: {diff_summary['changed_count']}",
    ]

    for label, key in (
        ("Novas", "new_matches"),
        ("Removidas", "removed_matches"),
    ):
        items = diff_summary[key]
        if not items:
            continue
        lines.append("")
        lines.append(label + ":")
        for item in items[:10]:
            lines.append(
                f"- {item['stable_id']} | Jogo {item.get('fifa_match_number')} | "
                f"{item['home_team']} x {item['away_team']}"
            )

    if diff_summary["changed_matches"]:
        lines.append("")
        lines.append("Alteradas:")
        for item in diff_summary["changed_matches"][:10]:
            fields = ", ".join(change["field"] for change in item["changes"])
            lines.append(f"- {item['stable_id']} | campos: {fields}")

    return "\n".join(lines) + "\n"


def run() -> dict[str, Any]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    previous_fixtures = _load_previous_fixtures(FIXTURES_JSON_PATH)
    fetched_at = datetime.now(UTC)
    matches_payload, stages_payload = fetch_source_payloads()

    write_json(RAW_MATCHES_PATH, matches_payload)
    write_json(RAW_STAGES_PATH, stages_payload)

    stage_lookup = _build_stage_lookup(stages_payload)
    fixtures = [
        normalize_fixture(raw_match, stage_lookup=stage_lookup, fetched_at=fetched_at)
        for raw_match in matches_payload.get("Results", [])
    ]
    fixtures.sort(key=lambda item: (item["fifa_match_number"] is None, item["fifa_match_number"] or 9999))

    write_json(FIXTURES_JSON_PATH, fixtures)
    write_csv(FIXTURES_CSV_PATH, fixtures)
    ics_text = write_ics(FIXTURES_ICS_PATH, fixtures)
    write_ics(FIXTURES_ICS_V2_PATH, fixtures)

    brazil_fixtures = [fixture for fixture in fixtures if fixture["is_brazil_match"]]
    non_brazil_fixtures = [fixture for fixture in fixtures if not fixture["is_brazil_match"]]
    write_ics(BRAZIL_ICS_PATH, brazil_fixtures, calendar_name=BRAZIL_CALENDAR_NAME)
    write_ics(BRAZIL_ICS_V2_PATH, brazil_fixtures, calendar_name=BRAZIL_CALENDAR_NAME)
    write_ics(
        NON_BRAZIL_ICS_PATH,
        non_brazil_fixtures,
        calendar_name=NON_BRAZIL_CALENDAR_NAME,
    )
    write_ics(
        NON_BRAZIL_ICS_V2_PATH,
        non_brazil_fixtures,
        calendar_name=NON_BRAZIL_CALENDAR_NAME,
    )

    validation_issues = validate_outputs(fixtures, ics_text)
    diff_summary = build_diff_summary(previous_fixtures, fixtures)
    write_json(DIFF_JSON_PATH, diff_summary)
    DIFF_TXT_PATH.write_text(_render_diff_summary_text(diff_summary), encoding="utf-8")

    run_summary = {
        "generated_at": fetched_at.isoformat().replace("+00:00", "Z"),
        "source_page_url": SOURCE_PAGE_URL,
        "source_api_url": MATCHES_API_URL,
        "fixture_count": len(fixtures),
        "validation_issues": validation_issues,
        "paths": {
            "json": str(FIXTURES_JSON_PATH),
            "csv": str(FIXTURES_CSV_PATH),
            "ics": str(FIXTURES_ICS_PATH),
            "ics_v2": str(FIXTURES_ICS_V2_PATH),
            "ics_brazil": str(BRAZIL_ICS_PATH),
            "ics_brazil_v2": str(BRAZIL_ICS_V2_PATH),
            "ics_non_brazil": str(NON_BRAZIL_ICS_PATH),
            "ics_non_brazil_v2": str(NON_BRAZIL_ICS_V2_PATH),
            "diff_json": str(DIFF_JSON_PATH),
            "diff_txt": str(DIFF_TXT_PATH),
        },
    }
    write_json(RUN_SUMMARY_PATH, run_summary)
    return run_summary


def main() -> int:
    run_summary = run()
    print(f"Fonte oficial: {run_summary['source_api_url']}")
    print(f"Partidas processadas: {run_summary['fixture_count']}")
    print(f"JSON: {run_summary['paths']['json']}")
    print(f"CSV: {run_summary['paths']['csv']}")
    print(f"ICS: {run_summary['paths']['ics']}")
    print(f"ICS V2: {run_summary['paths']['ics_v2']}")
    print(f"ICS Brasil: {run_summary['paths']['ics_brazil']}")
    print(f"ICS Brasil V2: {run_summary['paths']['ics_brazil_v2']}")
    print(f"ICS Sem Brasil: {run_summary['paths']['ics_non_brazil']}")
    print(f"ICS Sem Brasil V2: {run_summary['paths']['ics_non_brazil_v2']}")
    print(f"Diff: {run_summary['paths']['diff_txt']}")
    if run_summary["validation_issues"]:
        print("Validação: com alertas")
        for issue in run_summary["validation_issues"]:
            print(f"- {issue}")
        return 1

    print("Validação: ok")
    return 0
