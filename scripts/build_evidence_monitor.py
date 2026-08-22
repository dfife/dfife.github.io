#!/usr/bin/env python3
"""Build the public Evidence Monitor from the authoritative MCP projection.

This exporter is deliberately conservative: it publishes only current
ACTIVE_LOAD_BEARING rows with complete doctrine metadata. It never infers a
lean from branch compatibility and never computes an overall bound/unbound
score. A governed aggregate must exist before the overall display can move
away from ``Not yet assessed``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from collections import Counter
from pathlib import Path


DEFAULT_DB = Path("/mnt/nvme4tb2/cosmology-mcp/indexes/lab_state.sqlite")
DEFAULT_REGISTRY = Path(
    "/mnt/nvme4tb2/cosmology-mcp/state/automation_project_registry.json"
)
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "data" / "evidence-monitor.json"
BRANCHES = ("schwarzschild", "kerr", "unbounded_universe")
ALLOWED_DIRECTIONS = {"bound", "unbound", "neutral", "indeterminate"}
ALLOWED_SELECTOR = {"nonselector", "selector"}

AUTHORITY_PATHS = {
    "program_registry": DEFAULT_REGISTRY,
    "method_charter": Path(
        "/mnt/nvme4tb2/cosmology-mcp/state/mcp_bank_artifact_gateway/"
        "io_current_working_theory_and_method_charter_2026_07_22/"
        "io_current_working_theory_and_research_method_charter_2026_07_22.json"
    ),
    "consumer_policy": Path(
        "/mnt/nvme4tb2/cosmology-mcp/state/consumer_surface_governance_2026_06_23/"
        "io_mcp_consumer_surface_policy_2026_06_23.json"
    ),
    "schema_pointer": Path(
        "/mnt/nvme4tb2/cosmology-mcp/state/governed_schema/"
        "current_governed_schema_pointer.json"
    ),
    "gr_qm_board": Path(
        "/mnt/nvme4tb2/cosmology-mcp/state/io_gr_qm_bridge/bridge_board_latest.json"
    ),
}

DISPLAY_TITLES = {
    "IO_MODEL_INDEPENDENT_COMPACT_CAUCHY_LCQFT_THERMODYNAMIC_INFORMATION_BASIS_2026_08_02":
        "Compact-Cauchy locally covariant QFT information basis",
    "IO_MODEL_INDEPENDENT_COMPACT_CAUCHY_MAXWELL_CHARGE_CLOSURE_AND_U1_FLUX_SECTOR_FRONTIER_2026_08_03":
        "Compact-Cauchy Maxwell charge closure and U(1) flux frontier",
    "IO_MODEL_INDEPENDENT_COMPACT_TOPOLOGY_GLOBAL_GR_BASIS_2026_08_02":
        "Compact-topology global-GR basis",
    "IO_MODEL_INDEPENDENT_GAUGE_INVARIANT_MAXWELL_COHERENCY_PLANCK_MEAN_RESPONSE_BRIDGE_AND_QUANTUM_LIFT_NONUNIQUENESS_2026_08_02":
        "Gauge-invariant Maxwell coherency and Planck mean-response bridge",
    "IO_MODEL_INDEPENDENT_LOCAL_SCALAR_GAUSSIAN_MEASUREMENT_CHANNEL_AND_SELECTOR_FRONTIER_2026_08_02":
        "Local scalar Gaussian measurement channel and optional-selector frontier",
    "IO_MODEL_INDEPENDENT_OBSERVATION_CHANNEL_IDENTIFIABILITY_AND_FINITE_DATA_FOUNDATION_2026_08_02":
        "Observation-channel identifiability and finite-data foundation",
    "IO_MODEL_INDEPENDENT_PLANCK_HFI_STOKES_RESPONSE_QUOTIENT_AND_MAXWELL_STATE_NONIDENTIFIABILITY_2026_08_02":
        "Planck HFI Stokes-response quotient and Maxwell-state nonidentifiability",
    "IO_MODEL_INDEPENDENT_QUANTUM_TO_CLASSICAL_RELATIVE_ENTROPY_OBSERVATION_BRIDGE_2026_08_02":
        "Quantum-to-classical relative-entropy observation bridge",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def friendly_title(record: dict, canonical_id: str) -> str:
    for key in ("title", "artifact_title"):
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    if canonical_id in DISPLAY_TITLES:
        return DISPLAY_TITLES[canonical_id]
    words = canonical_id.removeprefix("IO_").replace("_", " ").lower()
    return words.rsplit(" 2026 ", 1)[0].capitalize()


def compact_branch(entry: dict) -> dict:
    result = {
        "value": entry["value"],
        "scope": entry.get("scope", ""),
    }
    for key in ("named_obstruction", "resolution_route"):
        if entry.get(key):
            result[key] = entry[key]
    return result


def build(db_path: Path, registry_path: Path) -> dict:
    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    program = registry["overarching_program"]
    if program["program_id"] != "BOUND_OR_UNBOUND_EVIDENCE_PROGRAM":
        raise RuntimeError("authoritative registry does not expose the expected program")
    declared = tuple(row["branch_field"] for row in program["equal_scientific_branches"])
    if declared != BRANCHES:
        raise RuntimeError(f"authoritative branch vector changed: {declared!r}")

    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT canonical_id, current_label, source_artifact, detail_json
        FROM mcp_current_status_projection
        WHERE live = 1
          AND json_extract(detail_json, '$.consumer_surface') = 'ACTIVE_LOAD_BEARING'
        ORDER BY canonical_id
        """
    ).fetchall()
    aggregate_rows = connection.execute(
        """
        SELECT canonical_id
        FROM mcp_current_status_projection
        WHERE live = 1
          AND canonical_id LIKE 'BOUND_OR_UNBOUND_EVIDENCE_AGGREGATE%'
        """
    ).fetchall()
    connection.close()

    records = []
    declared_record_updates = []
    records_without_declared_update = []
    for row in rows:
        detail = json.loads(row["detail_json"])
        if not detail.get("doctrine_metadata_complete"):
            raise RuntimeError(f"incomplete doctrine metadata: {row['canonical_id']}")
        source = Path(row["source_artifact"])
        record = json.loads(source.read_text(encoding="utf-8"))
        if sha256(source) != detail["source_sha256"]:
            raise RuntimeError(f"current-source SHA mismatch: {row['canonical_id']}")
        branch_vector = record.get("per_branch_validity", {})
        missing = [branch for branch in BRANCHES if branch not in branch_vector]
        if missing:
            raise RuntimeError(f"missing branch entries for {row['canonical_id']}: {missing}")
        evidence = record.get("evidential_assessment")
        if not isinstance(evidence, dict) or evidence.get("direction") not in ALLOWED_DIRECTIONS:
            raise RuntimeError(f"invalid evidential assessment: {row['canonical_id']}")
        if evidence.get("selector_status") not in ALLOWED_SELECTOR:
            raise RuntimeError(f"invalid selector status: {row['canonical_id']}")
        triage = record.get("qm_gr_map_triage")
        if not isinstance(triage, dict) or not triage.get("classification"):
            raise RuntimeError(f"missing canonical GR-QM triage: {row['canonical_id']}")

        record_updated_utc = record.get("updated_utc")
        if record_updated_utc is not None and not isinstance(record_updated_utc, str):
            raise RuntimeError(f"invalid updated_utc: {row['canonical_id']}")
        if record_updated_utc:
            declared_record_updates.append(record_updated_utc)
        else:
            records_without_declared_update.append(row["canonical_id"])

        records.append(
            {
                "canonical_id": row["canonical_id"],
                "title": friendly_title(record, row["canonical_id"]),
                "current_label": row["current_label"],
                "consumer_surface": "ACTIVE_LOAD_BEARING",
                "source_sha256": detail["source_sha256"],
                "source_record_timestamps": {
                    "created_utc": record.get("created_utc"),
                    "updated_utc": record_updated_utc,
                },
                "per_branch_validity": {
                    branch: compact_branch(branch_vector[branch]) for branch in BRANCHES
                },
                "evidential_assessment": {
                    key: evidence[key]
                    for key in (
                        "direction",
                        "strength",
                        "basis",
                        "data_lineage",
                        "independence_group",
                        "selector_status",
                    )
                },
                "qm_gr_map_triage": {
                    key: triage[key]
                    for key in ("classification", "directionality", "scope")
                    if key in triage
                },
            }
        )

    directions = Counter(r["evidential_assessment"]["direction"] for r in records)
    debt_cells = sum(
        branch["value"] == "UNTESTED"
        for record in records
        for branch in record["per_branch_validity"].values()
    )
    project_posture = [
        {
            "project_id": item["project_id"],
            "name": item["name"],
            "status": item["status"],
            **({"results_relevance": item["results_relevance"]} if item.get("results_relevance") else {}),
        }
        for item in registry["projects"]
    ]

    overall = (
        {
            "status": "governed_aggregate_available",
            "display": "Governed aggregate available",
            "record_ids": [row["canonical_id"] for row in aggregate_rows],
        }
        if aggregate_rows
        else {
            "status": "not_yet_assessed",
            "display": "Not yet assessed",
            "reason": "No live governed Bound-or-Unbound evidence aggregate exists. Per-result assessments are shown without arithmetic aggregation or branch double-counting.",
        }
    )

    authorities = {
        name: {
            "record_id": (
                "AUTOMATION_PROJECT_REGISTRY"
                if name == "program_registry"
                else json.loads(path.read_text(encoding="utf-8")).get("artifact_id", path.stem)
            ),
            "sha256": sha256(path),
        }
        for name, path in AUTHORITY_PATHS.items()
    }

    return {
        "schema_version": "IO_PUBLIC_EVIDENCE_MONITOR_v2",
        "projection_basis": {
            "membership_source": "mcp_current_status_projection",
            "membership_predicate": "live = 1 AND consumer_surface = ACTIVE_LOAD_BEARING",
            "record_verification": "Each projected member is read from its current source_artifact and must match its indexed source_sha256.",
            "coverage_semantics": "Current projection membership and exact source identity define this public surface. No per-record timestamp is used as a coverage cutoff.",
        },
        "authority_timestamps": {
            "program_registry_updated_at": registry.get("updated_at"),
            "program_registry_updated_at_scope": "This timestamps the current program and project-governance registry only; it is not a blanket update time for every scientific record.",
            "latest_declared_per_record_updated_utc": (
                max(declared_record_updates) if declared_record_updates else None
            ),
            "records_with_declared_updated_utc": len(declared_record_updates),
            "records_without_declared_updated_utc": len(records_without_declared_update),
            "records_without_declared_updated_utc_ids": records_without_declared_update,
            "per_record_updated_utc_scope": "updated_utc is source-record metadata only when that record declares it. The latest declared value is not a projection-coverage cutoff, and no timestamp is inferred for records that omit the field.",
        },
        "program": {
            "program_id": program["program_id"],
            "name": program["program_name"],
            "objective": program["scientific_objective"],
            "operational_governance_container": program["operational_governance_container"],
            "equal_scientific_branches": program["equal_scientific_branches"],
            "gr_qm_crosscheck": program["gr_qm_crosscheck"],
            "selector_posture": "optional_non_primary",
        },
        "semantics": {
            "compatibility": "Per-branch validity says where a result applies. It is not evidential weight.",
            "untested": "UNTESTED is explicit check debt, never incompatibility.",
            "evidence": "Evidential direction is recorded independently as bound, unbound, neutral, or indeterminate.",
            "aggregation_rule": "Never add Schwarzschild and Kerr as two independent bound votes; preserve independence_group and use no overall score without a governed aggregate.",
            "selector": "A selector is neither presumed nor primary. Only an explicitly governed selector result may be labeled selector.",
        },
        "overall": overall,
        "summary": {
            "current_consumer_facing_records": len(records),
            "compatibility_debt_cells": debt_cells,
            "evidential_direction_counts": dict(sorted(directions.items())),
        },
        "project_posture": project_posture,
        "authorities": authorities,
        "records": records,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = json.dumps(build(args.db, args.registry), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not args.output.exists() or args.output.read_text(encoding="utf-8") != rendered:
            raise SystemExit("Evidence Monitor projection is stale")
        print(f"Evidence Monitor projection is current: {args.output}")
        return 0
    args.output.write_text(rendered, encoding="utf-8")
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
