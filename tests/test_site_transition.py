import hashlib
import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_paper_identity(rows: list[dict]) -> str:
    keys = (
        "paper",
        "paper_url",
        "short_title",
        "short_form",
        "full_title",
        "zenodo",
        "support_bundle",
        "current_version",
        "support_bundle_tag",
        "support_bundle_sha256",
    )
    compact = [{key: row.get(key) for key in keys} for row in rows]
    payload = json.dumps(
        compact, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode()
    return sha256_bytes(payload)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.json_ld = []
        self._json_buffer = None
        self.has_skip_link = False
        self.has_main_target = False

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if tag == "a":
            href = attr.get("href")
            if href:
                self.links.append(href)
            if "skip-link" in attr.get("class", "").split() and href == "#main-content":
                self.has_skip_link = True
        if tag == "main" and attr.get("id") == "main-content":
            self.has_main_target = True
        if tag == "script" and attr.get("type") == "application/ld+json":
            self._json_buffer = []

    def handle_data(self, data):
        if self._json_buffer is not None:
            self._json_buffer.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._json_buffer is not None:
            self.json_ld.append("".join(self._json_buffer))
            self._json_buffer = None


class EvidenceMonitorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / "data/evidence-monitor.json").read_text())

    def test_program_hierarchy_is_exact(self):
        program = self.data["program"]
        self.assertEqual(program["program_id"], "BOUND_OR_UNBOUND_EVIDENCE_PROGRAM")
        self.assertEqual(program["name"], "Bound-or-Unbound Evidence Program")
        branches = [
            (row["branch_field"], row["boundedness"])
            for row in program["equal_scientific_branches"]
        ]
        self.assertEqual(
            branches,
            [
                ("schwarzschild", "bound"),
                ("kerr", "bound"),
                ("unbounded_universe", "unbound"),
            ],
        )
        container = program["operational_governance_container"]
        self.assertEqual(container["project_id"], "io_foundational_generating_principle_research")
        self.assertIn("not a fourth scientific branch", container["role_boundary"])
        self.assertEqual(program["selector_posture"], "optional_non_primary")
        self.assertEqual(
            program["gr_qm_crosscheck"]["lifecycle"], "always_running_crosscheck"
        )

    def test_current_surface_has_complete_separate_doctrine_fields(self):
        records = self.data["records"]
        self.assertEqual(len(records), 13)
        branches = {"schwarzschild", "kerr", "unbounded_universe"}
        evidence_fields = {
            "direction",
            "strength",
            "basis",
            "data_lineage",
            "independence_group",
            "selector_status",
        }
        debt = 0
        for record in records:
            self.assertEqual(set(record["per_branch_validity"]), branches)
            self.assertTrue(evidence_fields.issubset(record["evidential_assessment"]))
            self.assertIn(
                record["evidential_assessment"]["direction"],
                {"bound", "unbound", "neutral", "indeterminate"},
            )
            self.assertIn(
                record["evidential_assessment"]["selector_status"],
                {"nonselector", "selector"},
            )
            self.assertTrue(record["qm_gr_map_triage"]["classification"])
            self.assertRegex(record["source_sha256"], r"^[0-9a-f]{64}$")
            for branch in record["per_branch_validity"].values():
                if branch["value"] == "UNTESTED":
                    debt += 1
                    self.assertTrue(branch.get("named_obstruction"))
                    self.assertTrue(branch.get("resolution_route"))
        self.assertEqual(debt, 3)
        self.assertEqual(self.data["summary"]["compatibility_debt_cells"], debt)

    def test_governed_full_corpus_assessment_is_separate_from_register(self):
        self.assertEqual(
            self.data["overall"]["status"],
            "governed_qualitative_assessment_available",
        )
        self.assertEqual(
            self.data["overall"]["display"],
            "Very slight unbound-facing empirical tilt",
        )
        self.assertEqual(self.data["overall"]["direction"], "unbound")
        self.assertEqual(self.data["overall"]["strength"], "slight")
        self.assertEqual(self.data["overall"]["selector_status"], "nonselector")
        self.assertEqual(
            self.data["summary"]["evidential_direction_counts"],
            {"indeterminate": 12, "neutral": 1},
        )
        self.assertIn("Never add Schwarzschild and Kerr", self.data["semantics"]["aggregation_rule"])
        self.assertIn("separate layers", self.data["semantics"]["layer_rule"])
        assessment = self.data["directional_assessment"]
        self.assertEqual(
            assessment["empirical"]["driver"], "PLANCK_CMB_GEOMETRY/Q423"
        )
        self.assertEqual(
            assessment["structural_economy"]["driver"],
            "S0=P1_BOUND_COSMOLOGICAL_CHASSIS",
        )
        self.assertEqual(
            assessment["structural_economy"]["independent_parent_groups"], 1
        )
        self.assertFalse(
            assessment["structural_economy"]["arithmetic_combination_with_empirical"]
        )
        for record in self.data["records"]:
            basis = record["evidential_assessment"]["basis"].lower()
            if record["evidential_assessment"]["direction"] == "indeterminate":
                self.assertTrue("no sourced" in basis or "supplies no" in basis)

    def test_full_inventory_dependence_exclusions_and_sensitivity(self):
        inventory = self.data["full_evidential_inventory"]
        self.assertEqual(len(inventory), 28)
        by_id = {row["evidence_id"]: row for row in inventory}
        self.assertEqual(
            by_id["INV-07"]["aggregate_treatment"],
            "INCLUDED_EMPIRICAL_ONE_GROUP",
        )
        self.assertEqual(by_id["INV-07"]["direction"], "unbound")
        self.assertIn("Kerr stack only", by_id["INV-07"]["limitations"])
        self.assertEqual(
            by_id["INV-04"]["aggregate_treatment"],
            "DISPLAYED_DEPENDENT_CHILD_NO_EMPIRICAL_VOTE",
        )
        self.assertIn("M_U cancels", by_id["INV-04"]["limitations"])
        self.assertEqual(
            by_id["INV-28"]["aggregate_treatment"],
            "EXCLUDED_COMPATIBILITY_IS_NOT_EVIDENCE",
        )
        root = self.data["dependency_hierarchy"]["structural_parent"]
        self.assertEqual(root["dependency_group"], "S0=P1_BOUND_COSMOLOGICAL_CHASSIS")
        self.assertEqual(len(root["subgroups"]), 5)
        sensitivity = self.data["directional_assessment"]["sensitivity_audit"]
        self.assertTrue(any(
            row["perturbation"] == "Omit PLANCK_CMB_GEOMETRY/Q423"
            and row["empirical_posture"] == "mixed/no lean"
            for row in sensitivity
        ))
        self.assertTrue(any(
            row["perturbation"] == "Remove the entire S0=P1_BOUND_COSMOLOGICAL_CHASSIS family"
            and row["empirical_posture"] == "mixed with a very slight unbound-facing tilt"
            for row in sensitivity
        ))

    def test_completed_checks_retain_exact_three_debts(self):
        checks = self.data["compatibility_checks"]
        self.assertEqual(len(checks), 3)
        self.assertEqual({row["outcome"] for row in checks}, {"RETAIN_UNTESTED"})
        self.assertEqual(self.data["summary"]["compatibility_checks_completed"], 3)
        self.assertEqual(self.data["summary"]["compatibility_cells_promoted"], 0)
        self.assertEqual(
            {row["cell_id"] for row in checks},
            {
                "IO_MODEL_INDEPENDENT_HORIZON_INTERIOR_CLASSIFICATION_NONCATEGORICITY_2026_07_30::schwarzschild",
                "Q243_PAPER1_KERR_HORIZON_LOCAL_SPECTRAL_THEOREM_SCHEMA_V6_WRAPPER_2026_07_09::schwarzschild",
                "Q243_PAPER1_KERR_HORIZON_LOCAL_SPECTRAL_THEOREM_SCHEMA_V6_WRAPPER_2026_07_09::unbounded_universe",
            },
        )

    def test_authority_hashes_are_present(self):
        self.assertEqual(
            self.data["authorities"]["program_registry"]["sha256"],
            "36e987bd23fd393441ce12b974a109de83cbb56cf2315e24d57b05b53bd371c7",
        )
        for authority in self.data["authorities"].values():
            self.assertRegex(authority["sha256"], r"^[0-9a-f]{64}$")

    def test_timestamp_metadata_is_not_a_projection_coverage_cutoff(self):
        self.assertEqual(self.data["schema_version"], "IO_PUBLIC_EVIDENCE_MONITOR_v3")
        self.assertNotIn("generated_from_authoritative_records_through", self.data)
        basis = self.data["projection_basis"]
        self.assertEqual(basis["membership_source"], "mcp_current_status_projection")
        self.assertIn("No per-record timestamp", basis["coverage_semantics"])

        timestamps = self.data["authority_timestamps"]
        self.assertEqual(
            timestamps["program_registry_updated_at"], "2026-08-22T15:25:04Z"
        )
        self.assertEqual(
            timestamps["latest_declared_per_record_updated_utc"],
            "2026-08-22T14:48:44Z",
        )
        self.assertEqual(timestamps["records_with_declared_updated_utc"], 10)
        self.assertEqual(timestamps["records_without_declared_updated_utc"], 3)
        self.assertIn("not a projection-coverage cutoff", timestamps["per_record_updated_utc_scope"])

        later_missing_id = (
            "IO_EMPIRICAL_MATTER_AND_GRAVITATING_RESIDUAL_EXISTENCE_"
            "DISPOSITION_CC037_JOB1_2026_08_18"
        )
        self.assertIn(
            later_missing_id,
            timestamps["records_without_declared_updated_utc_ids"],
        )
        later_record = next(
            record for record in self.data["records"]
            if record["canonical_id"] == later_missing_id
        )
        self.assertEqual(
            later_record["source_record_timestamps"]["created_utc"],
            "2026-08-18T16:00:00Z",
        )
        self.assertIsNone(later_record["source_record_timestamps"]["updated_utc"])

        ui = (ROOT / "assets/js/evidence-monitor.js").read_text()
        self.assertNotIn("records current through", ui)
        self.assertIn("Latest declared per-record", ui)
        self.assertIn("records that omit", ui)
        page = (ROOT / "evidence-monitor.html").read_text()
        self.assertIn(
            'assets/js/evidence-monitor.js?v=full-corpus-assessment-v3', page
        )


class PreservationTests(unittest.TestCase):
    def test_all_paper_identities_urls_releases_and_hashes_are_preserved(self):
        papers = json.loads((ROOT / "data/papers.json").read_text())
        self.assertEqual(len(papers), 35)
        self.assertEqual(
            canonical_paper_identity(papers),
            "b902858d37b202991c68ef6b8dbf0f0fa58cf2d0098a315ae67df88e2a6da2f3",
        )
        for number, paper in enumerate(papers, start=1):
            self.assertEqual(paper["paper"], number)
            self.assertEqual(paper["paper_url"], f"papers/paper-{number:02d}.html")
            self.assertTrue((ROOT / paper["paper_url"]).is_file())
            self.assertTrue(paper["short_form"].startswith(f"Paper {number} "))
            self.assertRegex(paper["zenodo"], r"^https://zenodo\.org/records/\d+/latest$")
            if paper.get("support_bundle_sha256"):
                self.assertRegex(paper["support_bundle_sha256"], r"^[0-9a-f]{64}$")
                self.assertTrue(paper.get("support_bundle"))

    def test_crossings_are_byte_identical(self):
        raw = (ROOT / "data/crossings.json").read_bytes()
        self.assertEqual(
            sha256_bytes(raw),
            "a73b1f3614c9b6c07e312d2103c95bbdef6be8c3e1f37a92c6bf93979a05e1f7",
        )
        self.assertEqual(len(json.loads(raw)), 70)

    def test_scorecard_and_lithium_scientific_surfaces_are_unchanged(self):
        scorecard = (ROOT / "scorecard.html").read_bytes()
        table = re.search(rb'<table[^>]*class="scorecard-table".*?</table>', scorecard, re.S)
        self.assertIsNotNone(table)
        self.assertEqual(
            sha256_bytes(table.group()),
            "6dc37137972ce1fd37929c2283bf5a5b46411f3a1f2c07c3831743894b716f58",
        )
        lithium = (ROOT / "lithium.html").read_bytes()
        science = re.search(rb'<section class="content-section compact">.*?</section>', lithium, re.S)
        self.assertIsNotNone(science)
        self.assertEqual(
            sha256_bytes(science.group()),
            "e0f65333c5a53b661e4fcc73e06f24af500c0006da6da58f319feaad01c5a061",
        )

    def test_preserved_public_tools_and_archive_labels(self):
        for relative in (
            "calculator.html",
            "calculator-theorems.html",
            "lithium.html",
            "scorecard.html",
            "io-framework.html",
            "data/aio_calculator_bundle.json",
        ):
            self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertIn("Archived IO Framework Scorecard", (ROOT / "scorecard.html").read_text())
        self.assertRegex(
            (ROOT / "scorecard.html").read_text(),
            r"not the .*?Bound-or-Unbound Evidence Monitor",
        )
        self.assertIn("Preserved continuing bound-work archive", (ROOT / "io-framework.html").read_text())


class SiteContractTests(unittest.TestCase):
    def test_homepage_states_equal_branches_and_governance_boundary(self):
        page = (ROOT / "index.html").read_text()
        self.assertIn("Bound-or-Unbound Evidence Program", page)
        self.assertIn("Schwarzschild black-hole universe", page)
        self.assertIn("Kerr black-hole universe", page)
        self.assertIn("Infinite or unbounded universe", page)
        self.assertIn("operational and governance container only", page)
        self.assertIn("optional and non-primary", page)
        self.assertIn("not two independent votes", page)
        self.assertIn("very slight unbound-facing tilt", page)
        self.assertIn("PLANCK_CMB_GEOMETRY/Q423", page)
        self.assertIn("S0=P1_BOUND_COSMOLOGICAL_CHASSIS", page)

    def test_bridge_is_always_running_and_crossings_are_retained(self):
        page = (ROOT / "bridge-map.html").read_text()
        script = (ROOT / "assets/js/bridge-map.js").read_text()
        self.assertIn("Always-running cross-check", page)
        self.assertIn("one blocked seam never halts", page)
        self.assertIn("optional and non-primary", page)
        self.assertIn('fetch("data/crossings.json")', script)

    def test_ai_guidance_and_participation(self):
        for_ai = (ROOT / "for-ai.html").read_text()
        llms = (ROOT / "llms.txt").read_text()
        participate = (ROOT / "participate.html").read_text()
        for text in (for_ai, llms):
            self.assertIn("Bound-or-Unbound Evidence Program", text)
            self.assertIn("UNTESTED", text)
            self.assertIn("compatibility", text.lower())
            self.assertIn("evidential", text.lower())
            self.assertIn("very slight unbound-facing", text)
            self.assertIn("PLANCK_CMB_GEOMETRY/Q423", text)
            self.assertIn("S0=P1_BOUND_COSMOLOGICAL_CHASSIS", text)
            self.assertIn("not a fourth", text.lower())
        self.assertIn("enthusiasts", participate.lower())
        self.assertIn("skeptics", participate.lower())
        self.assertIn("mailto:david@fife.cc", participate)

    def test_accessibility_navigation_and_json_ld(self):
        html_files = sorted(ROOT.glob("*.html")) + sorted((ROOT / "papers").glob("*.html"))
        self.assertEqual(len(html_files), 49)
        for path in html_files:
            parser = PageParser()
            parser.feed(path.read_text())
            self.assertTrue(parser.has_skip_link, path.name)
            self.assertTrue(parser.has_main_target, path.name)
            joined = " ".join(parser.links)
            for target in (
                "evidence-monitor.html",
                "bridge-map.html",
                "papers.html",
                "calculator.html",
                "ask.html",
                "participate.html",
            ):
                self.assertIn(target, joined, f"{path.name}: {target}")
            for block in parser.json_ld:
                json.loads(block)
        css = (ROOT / "assets/css/site.css").read_text()
        self.assertIn(".skip-link", css)
        self.assertIn(":focus-visible", css)
        self.assertIn("@media (max-width: 820px)", css)

    def test_evidence_monitor_mobile_overflow_guards(self):
        page = (ROOT / "evidence-monitor.html").read_text()
        css = (ROOT / "assets/css/site.css").read_text()
        self.assertIn(
            '<meta content="width=device-width, initial-scale=1.0" name="viewport"/>',
            page,
        )
        self.assertRegex(
            css,
            r"\.monitor-record\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;",
        )
        self.assertRegex(
            css,
            r"\.monitor-pill\s*\{[^}]*max-width:\s*100%;[^}]*overflow-wrap:\s*anywhere;",
        )
        self.assertRegex(css, r"\.monitor-table-wrap\s*\{[^}]*overflow-x:\s*auto;")

    def test_sitemaps_and_metadata_expose_new_hierarchy(self):
        for relative in ("sitemap.xml", "sitemap-pages.xml"):
            text = (ROOT / relative).read_text()
            self.assertIn("evidence-monitor.html", text)
            self.assertIn("participate.html", text)
            self.assertIn("for-ai.html", text)
        for relative in ("index.html", "evidence-monitor.html", "participate.html"):
            text = (ROOT / relative).read_text()
            self.assertIn("Interior Observer Cosmology Lab", text)


if __name__ == "__main__":
    unittest.main()
