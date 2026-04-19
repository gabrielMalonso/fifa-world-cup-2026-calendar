from __future__ import annotations

import unittest
from datetime import UTC, datetime

from src.fifa_world_cup_2026_calendar.exporters import build_ics
from src.fifa_world_cup_2026_calendar.pipeline import normalize_fixture, validate_outputs


class PipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.raw_match = {
            "IdMatch": "400021443",
            "IdStage": "289273",
            "IdGroup": "289275",
            "Date": "2026-06-11T19:00:00Z",
            "LocalDate": "2026-06-11T13:00:00Z",
            "StageName": [{"Locale": "pt-BR", "Description": "Primeira fase"}],
            "GroupName": [{"Locale": "pt-BR", "Description": "Grupo A"}],
            "Home": {
                "TeamName": [{"Locale": "pt-BR", "Description": "México"}],
                "Abbreviation": "MEX",
            },
            "Away": {
                "TeamName": [{"Locale": "pt-BR", "Description": "África do Sul"}],
                "Abbreviation": "RSA",
            },
            "MatchNumber": 1,
            "TimeDefined": True,
            "MatchStatus": 1,
            "PlaceHolderA": "A1",
            "PlaceHolderB": "A2",
            "Stadium": {
                "Name": [{"Locale": "pt-BR", "Description": "Estádio da Cidade do México"}],
                "CityName": [{"Locale": "pt-BR", "Description": "Cidade do México"}],
                "IdCountry": "MEX",
            },
        }
        self.stage_lookup = {"289273": {"name": "Primeira fase", "sequence_order": 1}}
        self.fetched_at = datetime(2026, 4, 19, 20, 0, tzinfo=UTC)

    def test_normalize_fixture_uses_match_number_for_stable_id(self) -> None:
        fixture = normalize_fixture(self.raw_match, self.stage_lookup, self.fetched_at)
        self.assertEqual(fixture["stable_id"], "fifa-wc2026-match-001")
        self.assertEqual(fixture["uid"], "fifa-wc2026-match-001@fifa-world-cup-2026-calendar.local")
        self.assertEqual(fixture["kickoff_utc"], "2026-06-11T19:00:00Z")
        self.assertEqual(fixture["kickoff_brt"], "2026-06-11T16:00:00-03:00")
        self.assertEqual(fixture["country"], "México")

    def test_normalize_fixture_falls_back_to_placeholder(self) -> None:
        raw_match = dict(self.raw_match)
        raw_match["MatchNumber"] = None
        raw_match["Home"] = {}
        raw_match["Away"] = {}
        raw_match["PlaceHolderA"] = "1A"
        raw_match["PlaceHolderB"] = "2B"

        fixture = normalize_fixture(raw_match, self.stage_lookup, self.fetched_at)
        self.assertEqual(fixture["stable_id"], "fifa-wc2026-source-400021443")
        self.assertEqual(fixture["home_team"], "1A")
        self.assertEqual(fixture["away_team"], "2B")

    def test_ics_contains_one_event_per_fixture(self) -> None:
        fixture = normalize_fixture(self.raw_match, self.stage_lookup, self.fetched_at)
        ics_text = build_ics([fixture])

        self.assertIn("BEGIN:VCALENDAR", ics_text)
        self.assertEqual(ics_text.count("BEGIN:VEVENT"), 1)
        self.assertIn("SUMMARY:Copa do Mundo 2026 - Jogo 1 - México x África do Sul", ics_text)
        self.assertEqual(validate_outputs([fixture], ics_text), [])


if __name__ == "__main__":
    unittest.main()
