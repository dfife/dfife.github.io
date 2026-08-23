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
        self.assertIn("records without a declared update time", ui)
        page = (ROOT / "evidence-monitor.html").read_text()
        self.assertIn(
            'assets/js/evidence-monitor.js?v=plain-language-20260823', page
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
        self.assertIn("Schwarzschild", page)
        self.assertIn("Kerr", page)
        self.assertIn("Infinite or unbounded", page)
        self.assertIn("organizes the work", page)
        self.assertIn("not a fourth model", page)
        self.assertIn("never counted as two independent votes", page)
        self.assertIn("There is no clear answer yet", page)
        self.assertIn("fragile, very slight tilt away", page)
        self.assertIn("If that single comparison is removed, the tilt disappears", page)
        self.assertIn("it does not show that the Infinite model is correct", page)
        self.assertNotIn("PLANCK_CMB_GEOMETRY/Q423", page)
        self.assertNotIn("S0=P1_BOUND_COSMOLOGICAL_CHASSIS", page)
        self.assertLess(len(page.splitlines()), 260)

    def test_bridge_is_always_running_and_crossings_are_retained(self):
        page = (ROOT / "bridge-map.html").read_text()
        script = (ROOT / "assets/js/bridge-map.js").read_text()
        self.assertIn("continuing check on every current result", page)
        self.assertIn("A local gap does not stop the whole program", page)
        self.assertIn("not 70 confirmations", page)
        self.assertIn('fetch("data/crossings.json"', script)
        self.assertIn("What connection is this entry testing?", script)
        self.assertIn("Technical details: inputs, outputs, formula", script)
        for channel in ("quantum", "quantum_gauge", "quantum_gravity"):
            self.assertIn(f'"{channel}"', script)

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
        self.assertIn("newcomer route", participate.lower())
        self.assertIn("formal expert route", participate.lower())
        self.assertIn("mailto:david@fife.cc", participate)

    def test_public_discord_placement_and_authority_boundary(self):
        invite = "https://discord.gg/TtdppFqZ99"
        safe_link = f'href="{invite}" rel="noreferrer" target="_blank"'
        home = (ROOT / "index.html").read_text()
        participate = (ROOT / "participate.html").read_text()

        self.assertIn("Discuss the evidence in public", home)
        self.assertIn(
            "Join enthusiasts and skeptics comparing the Schwarzschild, Kerr, and Infinite models. Discord is for provisional discussion; reviewed research is maintained in the lab’s internal ledger and this website publishes a reader-facing projection of it.",
            home,
        )
        self.assertIn(f'<a class="button button-primary" {safe_link}>Join the public Discord</a>', home)
        self.assertLess(home.index("Discuss the evidence in public"), home.index('id="program-branches"'))

        guard = (
            "Use Discord for questions, reproductions, counterevidence, and collaboration. "
            "Discussion is provisional. It becomes a reviewed lab result only through a "
            "separate internal review; the public website then reports current findings where appropriate."
        )
        self.assertIn(guard, participate)
        discord_cta = f'<a class="button button-primary" {safe_link}>Join the public Discord</a>'
        email_cta = '<a class="button button-secondary" href="mailto:david@fife.cc?subject=Bound-or-Unbound%20Evidence%20Program">Email David</a>'
        self.assertLess(participate.index(discord_cta), participate.index(email_cta))

        html_files = sorted(ROOT.glob("*.html")) + sorted((ROOT / "papers").glob("*.html"))
        footer_link = f'<a class="footer-link" {safe_link}>Public Discord</a>'
        for path in html_files:
            page = path.read_text()
            footer = re.search(r'<footer class="footer">.*?</footer>', page, re.S)
            nav = re.search(r'<nav[^>]*class="nav-links".*?</nav>', page, re.S)
            self.assertIsNotNone(footer, path.name)
            self.assertIsNotNone(nav, path.name)
            if path.name not in {"calculator.html", "calculator-theorems.html"}:
                self.assertIn(footer_link, footer.group(), path.name)
            self.assertNotIn(invite, nav.group(), path.name)

        for relative in ("evidence-monitor.html", "ask.html"):
            page = (ROOT / relative).read_text()
            self.assertEqual(page.count(invite), 1, relative)

    def test_accessibility_navigation_and_json_ld(self):
        html_files = sorted(ROOT.glob("*.html")) + sorted((ROOT / "papers").glob("*.html"))
        self.assertEqual(len(html_files), 50)
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
        css_path = ROOT / "assets/css/site.css"
        css = css_path.read_text()
        self.assertIn(
            '<meta content="width=device-width, initial-scale=1.0" name="viewport"/>',
            page,
        )
        css_sha256 = sha256_bytes(css_path.read_bytes())
        versioned_href = f'assets/css/site.css?v={css_sha256}'
        self.assertEqual(page.count("assets/css/site.css?v="), 1)
        self.assertIn(f'<link href="{versioned_href}" rel="stylesheet"/>', page)
        self.assertRegex(
            css,
            r"\.monitor-record\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;",
        )
        self.assertRegex(
            css,
            r"\.monitor-pill\s*\{[^}]*max-width:\s*100%;[^}]*overflow-wrap:\s*anywhere;",
        )
        self.assertRegex(
            css,
            r"\.monitor-dependency-root h3,[^}]*\.monitor-dependency-root code\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*word-break:\s*break-word;",
        )
        self.assertRegex(
            css,
            r"#monitor-authorities li,[^}]*#monitor-authorities code\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*word-break:\s*break-word;",
        )
        self.assertRegex(css, r"\.monitor-table-wrap\s*\{[^}]*overflow-x:\s*auto;")

    def test_sitemaps_and_metadata_expose_new_hierarchy(self):
        for relative in ("sitemap.xml", "sitemap-pages.xml"):
            text = (ROOT / relative).read_text()
            self.assertIn("evidence-monitor.html", text)
            self.assertIn("participate.html", text)
            self.assertIn("for-ai.html", text)
            self.assertIn("glossary.html", text)
        for relative in ("index.html", "evidence-monitor.html", "participate.html"):
            text = (ROOT / relative).read_text()
            self.assertIn("Interior Observer Cosmology Lab", text)

    def test_reader_first_monitor_keeps_machine_metadata_optional(self):
        page = (ROOT / "evidence-monitor.html").read_text()
        script = (ROOT / "assets/js/evidence-monitor.js").read_text()
        self.assertIn("It starts with ordinary language", page)
        self.assertIn("Technical details", page)
        self.assertIn("public projection from the lab’s internal research ledger", page)
        self.assertIn("No separate public proof document is linked", script)
        for phrase in (
            "question:",
            "finding:",
            "assumptions:",
            "unresolved:",
            "why:",
            "Plain confidence",
            "Public evidence path",
        ):
            self.assertIn(phrase, script)
        for record in json.loads((ROOT / "data/evidence-monitor.json").read_text())["records"]:
            self.assertIn(record["canonical_id"], script)
        self.assertIn("Canonical record ID", script)
        self.assertIn("Current source SHA256", script)
        self.assertIn("Exact GR–QM triage", script)
        for translation in (
            "Mathematically derived under stated assumptions",
            "Useful comparison, not evidence for a particular branch",
            "Applicability to this branch remains unresolved",
            "Does not determine whether the universe is bound or unbound",
            "Used in the current research program",
        ):
            self.assertIn(translation, script)

    def test_plain_language_glossary_has_required_terms(self):
        page = (ROOT / "glossary.html").read_text()
        required = (
            "Interior Observer (IO)",
            "Exterior Observer (EO)",
            "Branch",
            "Bound universe",
            "Unbounded or Infinite universe",
            "Compatibility",
            "Evidence direction or lean",
            "Selector",
            "Guard",
            "UNTESTED / not yet tested",
            "Governed or current result",
            "Archive",
            "GR–QM check",
            "Kerr branch",
            "Schwarzschild branch",
            "Infinite branch",
            "MOTS",
            "Observer readout",
            "Context or diagnostic",
        )
        for term in required:
            self.assertIn(term, page)

    def test_public_internal_boundary_is_consistent(self):
        index = (ROOT / "index.html").read_text()
        monitor = (ROOT / "evidence-monitor.html").read_text()
        for_ai = (ROOT / "for-ai.html").read_text()
        llms = (ROOT / "llms.txt").read_text()
        self.assertIn("website is a public projection", index)
        self.assertIn("some internal source records do not have a public proof document", monitor.lower())
        self.assertIn("This site is a projection, not the internal ledger", for_ai)
        self.assertIn("Do not tell a public reader to query the internal MCP service", llms)
        self.assertIn("does not by itself make the mathematics publicly inspectable", llms)
        for relative in ("index.html", "evidence-monitor.html", "ask.html", "participate.html"):
            self.assertNotIn("gathers auditable", (ROOT / relative).read_text().lower())

    def test_reader_page_internal_links_resolve(self):
        for relative in (
            "index.html",
            "evidence-monitor.html",
            "bridge-map.html",
            "glossary.html",
            "ask.html",
            "participate.html",
            "for-ai.html",
        ):
            parser = PageParser()
            parser.feed((ROOT / relative).read_text())
            for href in parser.links:
                if href.startswith(("https://", "http://", "mailto:")):
                    continue
                target, _, fragment = href.partition("#")
                if not target or target == "/":
                    target_path = ROOT / ("index.html" if target == "/" else relative)
                else:
                    target_path = ROOT / target
                self.assertTrue(target_path.exists(), f"{relative}: broken {href}")
                if fragment and target_path.suffix == ".html":
                    self.assertIn(f'id="{fragment}"', target_path.read_text(), f"{relative}: missing {href}")


if __name__ == "__main__":
    unittest.main()
