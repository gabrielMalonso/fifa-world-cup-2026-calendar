from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import CALENDAR_NAME, CALENDAR_TZID, CSV_FIELD_ORDER


def write_json(path: Path, payload: Any) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELD_ORDER, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _escape_ics_text(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("\n", "\\n")
        .replace(";", r"\;")
        .replace(",", r"\,")
    )


def _fold_ics_line(line: str) -> str:
    chunks: list[str] = []
    current = ""
    current_limit = 75

    for character in line:
        encoded = character.encode("utf-8")
        if len(current.encode("utf-8")) + len(encoded) > current_limit:
            chunks.append(current)
            current = character
            current_limit = 74
            continue
        current += character

    chunks.append(current)
    head, *tail = chunks
    return head + "".join(f"\r\n {chunk}" for chunk in tail)


def _format_local_timestamp(value: str) -> str:
    return datetime.fromisoformat(value).strftime("%Y%m%dT%H%M%S")


def build_ics(fixtures: list[dict[str, Any]]) -> str:
    generated_at = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//fifa-world-cup-2026-calendar//ICS Generator//PT-BR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{_escape_ics_text(CALENDAR_NAME)}",
        f"X-WR-TIMEZONE:{CALENDAR_TZID}",
        "BEGIN:VTIMEZONE",
        f"TZID:{CALENDAR_TZID}",
        f"X-LIC-LOCATION:{CALENDAR_TZID}",
        "BEGIN:STANDARD",
        "TZOFFSETFROM:-0300",
        "TZOFFSETTO:-0300",
        "TZNAME:BRT",
        "DTSTART:19700101T000000",
        "END:STANDARD",
        "END:VTIMEZONE",
    ]

    for fixture in fixtures:
        match_number = fixture.get("fifa_match_number")
        if match_number is not None:
            summary = (
                f"Copa do Mundo 2026 - Jogo {match_number} - "
                f"{fixture['home_team']} x {fixture['away_team']}"
            )
        else:
            summary = f"Copa do Mundo 2026 - {fixture['home_team']} x {fixture['away_team']}"

        description_lines = [
            f"Fase: {fixture['stage']}",
            f"Grupo/Rodada: {fixture['group_or_round']}",
            f"Horário UTC oficial: {fixture['kickoff_utc']}",
            f"Horário BRT: {fixture['kickoff_brt']}",
            f"Horário bruto da fonte: {fixture['kickoff_source_raw']}",
            f"URL oficial da FIFA: {fixture['source_url']}",
            f"Endpoint oficial usado: {fixture['source_api_url']}",
            f"Gerado em: {fixture['source_last_seen_at']}",
        ]
        location = ", ".join(
            item for item in [fixture["venue_name"], fixture["city"], fixture["country"]] if item
        )

        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{fixture['uid']}",
                f"DTSTAMP:{generated_at}",
                f"SUMMARY:{_escape_ics_text(summary)}",
                f"DTSTART;TZID={CALENDAR_TZID}:{_format_local_timestamp(fixture['kickoff_brt'])}",
                f"DTEND;TZID={CALENDAR_TZID}:{_format_local_timestamp(fixture['end_brt'])}",
                f"LOCATION:{_escape_ics_text(location)}",
                f"DESCRIPTION:{_escape_ics_text(chr(10).join(description_lines))}",
                "STATUS:CONFIRMED",
                "TRANSP:OPAQUE",
                "END:VEVENT",
            ]
        )

    lines.append("END:VCALENDAR")
    return "".join(f"{_fold_ics_line(line)}\r\n" for line in lines)


def write_ics(path: Path, fixtures: list[dict[str, Any]]) -> str:
    ics_text = build_ics(fixtures)
    path.write_text(ics_text, encoding="utf-8", newline="")
    return ics_text
