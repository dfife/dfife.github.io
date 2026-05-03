# IO Framework Conventions, v2.0

**Unified Conventions for the Interior Observer Cosmological Framework**

**Date:** May 2026

**Author:** David Fife

---

## Preamble

IO Framework Observational Conventions v1.0 covered observational denominators
and external-code output conventions only.

This v2.0 document expands the convention scope to a unified framework
reference covering:

- observational conventions,
- labeling conventions,
- versioning conventions,
- cross-paper reference conventions.

Section 1 supersedes and reproduces IO Framework Observational Conventions v1.0
(https://dfife.github.io/data/observational_conventions_v1.md). Content is
identical; this section exists for unified citation.

The v1.0 file remains in place at its original URL for papers already citing
it. Future papers should cite this v2.0 document unless a paper deliberately
needs to cite the historical v1.0 convention.

---

## Section 1: Observational Conventions

Section 1 supersedes and reproduces IO Framework Observational Conventions v1.0
(https://dfife.github.io/data/observational_conventions_v1.md). Content is
identical; this section exists for unified citation.

### Reproduced v1.0 Document (Verbatim)

# IO Framework Observational Conventions

**Version 1.0 — May 2026**

David Fife, Independent Researcher
[david@fife.cc](mailto:david@fife.cc) · [https://dfife.github.io](https://dfife.github.io)
[https://zenodo.org/communities/interior-observer/](https://zenodo.org/communities/interior-observer/)

---

## Purpose

This document specifies the observational central values, uncertainties, and external-code output conventions used across all Interior Observer Cosmological Framework papers. All papers reporting σ-deviations against observation cite this document for their observational denominators and external-code output choices.

The goal is to prevent silent convention drift between papers and to give external reviewers a single source of truth for how the framework computes its σ-comparisons.

---

## Why this document exists

The framework was developed paper-by-paper across multiple sessions, and observational compilations evolved over the development period. Several papers inherited slightly different observational denominators or read different output indices from external BBN codes. A May 2026 audit identified one such drift (PRyMordial output index 4 vs index 3 for Y_p) that propagated across Papers 19, 20, 21, 22, and Paper 25 support scripts before being caught.

This document establishes the standard going forward. Affected papers have been corrected to match this standard.

---

## BBN observable conventions

### Y_p (primordial helium mass fraction)

**External code output:** `obj.YPCMB()` or equivalently `PRyMresults()[3]` from PRyMordial.

**Do not use:** `PRyMresults()[4]` (this is YPBBN, the helium fraction at the end of BBN, before post-BBN processing including e⁺e⁻ annihilation effects). YPBBN is the wrong quantity to compare against any observational compilation, because all Y_p observations are made downstream of BBN and are calibrated to YPCMB-equivalent quantities.

**Observational central value:** Y_p,obs = 0.245

**Observational uncertainty:** σ(Y_p) = 0.004

**Source of observational compilation:** Aver et al. 2015 (JCAP 07, 011) statistical + systematic combined uncertainty band. PRyMordial wrapper convention as adopted in Paper 24 v2.2.

**σ formula:** σ(Y_p) = (Y_p,predicted − 0.245) / 0.004

### D/H (deuterium-to-hydrogen ratio)

**External code output:** PRyMordial primary D/H output (PRyMresults default for D/H).

**Observational central value:** D/H,obs = 2.527 × 10⁻⁵

**Observational uncertainty:** σ(D/H) = 0.030 × 10⁻⁵

**Source of observational compilation:** PRyMordial internal compilation, Cooke et al. 2018 / Pitrou et al. 2018 lineage.

**σ formula:** σ(D/H) = (D/H,predicted − 2.527 × 10⁻⁵) / (0.030 × 10⁻⁵)

### Li-7 / H (primordial lithium-7 abundance)

**External code output:** PRyMordial primary Li-7/H output.

**Observational central value:** Li-7/H,obs = 1.58 × 10⁻¹⁰

**Observational uncertainty:** σ(Li-7) = 0.31 × 10⁻¹⁰

**Source of observational compilation:** Sbordone et al. 2010 / Spite plateau lineage as carried in PRyMordial. Used in Paper 24 v2.2.

**σ formula:** σ(Li-7) = (Li-7/H,predicted − 1.58 × 10⁻¹⁰) / (0.31 × 10⁻¹⁰)

---

## BBN input conventions

### Baryon density

**ω_b h² used as PRyMordial input:** 0.02108 (Paper 22 wrapper convention; consistent with framework projection from M_U through the Rosetta identity).

### Effective neutrino number

**N_eff used as PRyMordial input:** 3.044 (standard SM value; PRyMordial-default).

### CMB temperature today

**T_0,CMB used as PRyMordial input:** 2.6635 K (IO framework derivation; not the FIRAS observed value because the framework has its own derivation).

### η₁₀ (baryon-to-photon ratio)

**η₁₀ derived from ω_b h² and T_0,CMB above:** 6.183 × 10⁻¹⁰ (computed by PRyMordial from inputs).

---

## H₀ observable conventions

### Baseline IO prediction

**H₀,IO = 67.58 km/s/Mpc** (Paper 10 legacy branch, Paper 29 v1.2 sole surviving self-consistent branch).

### Observational comparison values used in Paper 34

| Method | Measured value | Source |
|--------|----------------|--------|
| Planck CMB | 67.4 ± 0.5 | Planck Collaboration 2020 |
| SH0ES Cepheid+SN Ia | 73.0 ± 1.0 | Riess et al. 2022 |
| TRGB direct | 70.39 ± 1.94 | Freedman et al. 2024 |
| TRGB+SN ladder | 73.18 ± 0.88 | Carnegie-Chicago Hubble Program |
| TDCOSMO lensing | 71.6 ± 3.6 | TDCOSMO Collaboration 2025 |
| GW standard sirens | 69.9 ± 4.1 | LIGO/Virgo/KAGRA combined |
| Cosmic chronometers | 35-point compilation | Jia et al. 2025 (MNRAS 542, 1063) |

---

## CMB and large-scale structure observable conventions

### Spectral index

**n_s,obs:** 0.9649 ± 0.0042 (Planck 2018, primary CMB-only constraint).

### Scalar amplitude

**A_s,obs:** 2.100 × 10⁻⁹ ± 0.030 × 10⁻⁹ (Planck 2018, primary CMB-only constraint, A_s × e^(−2τ) form per Paper 26 boundary state derivation).

### S₈

**S₈,obs:** 0.776 ± 0.017 (DES Y3 + KiDS-1000 weighted average per Paper 31 / 32 framing).

---

## Framework-internal constants (not observational, but standardized)

These are derived within the framework from M_U and γ_BI. They are listed here for reference because they appear in σ-comparison chains.

| Constant | Value | Source |
|----------|-------|--------|
| M_U | 4.50 × 10⁵³ kg | Observational input (Paper 1) |
| γ_BI | 0.2375 | LQG external (Bekenstein-Hawking entropy fit) |
| r_s | 6.685 × 10²⁶ m | Derived (Paper 1) |
| R_U | 4.40 × 10²⁶ m | Derived (Paper 1) |
| x = r_s/R_U | 1.51899 | Derived (Paper 1) |
| K_gauge = ln(1+γ²) | 0.054873 | Derived (Paper 10/18) |
| ⟨K⟩ = ln Δ | 1.72704 | Derived (Paper 18, CMP theorem) |
| Δ = x⁴(1+γ²) | 5.6240 | Derived (Paper 9 / Paper 10) |
| f_Γ = 1/(1+γ²) = e^(−K_gauge) | 0.9466 | Derived (Paper 32) |

---

## Citation

Papers in the IO Framework series cite this document at the location where the first σ-comparison appears, typically:

> Observational denominators and external-code output conventions follow IO Framework Observational Conventions v1 [reference].

In the bibliography:

> Fife, D. (2026). IO Framework Observational Conventions, v1.0. https://dfife.github.io/data/observational_conventions_v1.md

---

## Version history

**v1.0 (May 2026):** Initial release. Established YPCMB (PRyMordial index 3) as the standard Y_p output. Documented BBN, H₀, CMB observational denominators in current use across the framework. Established as the standard convention following the May 2026 audit that identified the YPBBN→YPCMB index error in Papers 19, 20, 21, 22, and Paper 25 support scripts.

---

## Future updates

This document is versioned. Material updates to observational compilations or external-code output conventions will increment the version number. Papers should cite the version they used; subsequent updates do not retroactively change earlier papers' σ-values unless those papers are explicitly republished citing the newer convention version.

---

## Section 2: Labeling Conventions

### 2.1 Base Five-Tier Taxonomy (Paper 14 §1.4 Origin)

The base taxonomy separates theorem-grade results from principles, selected
closures, structural observations, and discussion material.

**DERIVED/THEOREM:** A result proved mathematically from explicitly stated
framework assumptions, accepted definitions, and previously banked derived
results. Numerical agreement is not sufficient for this label.

**SEMICLASSICAL PRINCIPLE:** A principle imported from semiclassical reasoning
or from a controlled semiclassical limit. It can guide construction, but it is
not by itself a theorem of the full framework.

**OBSERVATIONALLY SELECTED CLOSURE:** A closure selected by matching an
observed datum or observationally fixed branch. It is admissible as an
observational closure, but it must not be described as derived from first
principles unless a separate derivation is supplied.

**STRUCTURAL OBSERVATION:** A reproducible pattern, relation, or organizing
fact observed in the framework's mathematics or computations. It can motivate
theorems, but it is not itself a theorem unless a proof is given.

**DISCUSSION:** Explanatory, interpretive, motivational, or contextual
material. Discussion may be useful, but it is not load-bearing.

### 2.2 Operational Labels (Papers 15-21 Extensions)

**DERIVED/NO-GO:** A theorem-grade exclusion result showing that a specified
route or class cannot deliver the target under stated assumptions.

**COMPUTATIONAL NO-GO:** A reproducible computational exclusion result. It is
verified within its numerical setup, but it is not automatically a mathematical
no-go theorem unless the numerical search space has also been proved complete.

**CONDITIONAL/THEOREM:** A theorem whose entire structure is conditional on a
specified premise package or class-membership assumption. The theorem is valid
inside that condition.

**CONSTRUCTED/VERIFIED:** An object has been explicitly constructed and checked
by reproducible computation or direct verification. This label does not by
itself mean the object is uniquely forced.

**SCOPE-BOUNDARY:** A result that clarifies where an identification, theorem,
or construction applies and where it does not. This label is used to prevent
overextension.

**STRUCTURALLY SUPPORTED CONSTRUCTION:** A construction strongly supported by
framework structure, prior routes, or compatible imports, but not yet promoted
to theorem-grade derivation.

**FRONTIER/SPECIFICATION:** A precise statement of the current open frontier,
including the object, missing bridge, or proof obligation that must be solved
next.

**DEFINITION:** A declared convention or formal definition. A definition is
allowed, but definitions do not prove physical truth or uniqueness.

**VALIDATED:** A computational or documentary result has passed the relevant
verification checks for its declared scope.

**RECALIBRATED:** A previous numerical or interpretive statement has been
updated after a convention, wrapper, denominator, or reference correction.

**CONDITIONAL/COMPUTATIONAL SCORECARD:** A numerical scorecard computed within
a stated conditional premise package. The computation may be verified while the
premise package remains conditional.

### 2.3 Compound Conditional Labels

Use the pattern:

```text
DERIVED/CONDITIONAL on [premise]
```

This form is required when a local derivation is mathematically valid but rests
on a premise, bridge, or prior theorem whose own status is conditional.

It is optional only when the dependency is already unambiguously stated in the
same theorem title, theorem statement, and surrounding paragraph. In revision
work, prefer the explicit compound label.

Examples:

- `DERIVED/CONDITIONAL on GMP + TBS`
- `DERIVED/CONDITIONAL on H1-H3`

Distinction from `CONDITIONAL/THEOREM`:

- `CONDITIONAL/THEOREM` is used for a theorem whose whole object is conditional
  on an assumed class or premise package.
- `DERIVED/CONDITIONAL on [premise]` is used for a derived result whose local
  reasoning is complete, but whose validity inherits a stated conditional
  premise.

### 2.4 Conditional Dependency Inheritance Rule

If theorem `T_2` depends on theorem `T_1`, and `T_1` is conditional on premise
`P`, then `T_2` inherits the conditionality.

Therefore `T_2` must be labeled:

```text
DERIVED/CONDITIONAL on P
```

even if `T_2`'s local statement does not mention `P`.

Example:

- Theorem 22.24 (Li-7 internal consistency) depends on Theorem 22.23
  (rate-dressing prediction).
- Therefore Theorem 22.24 is `DERIVED/CONDITIONAL on GMP + TBS` because
  Theorem 22.23 is conditional on GMP + TBS.

For appendix steps that report PRyMordial evaluations of conditional results,
use:

```text
STATUS: DERIVED/CONDITIONAL on [premise]; numerical evaluation DERIVED
computationally within that premise package.
```

### 2.5 Historical and Superseded Labeling Rules

When inherited material conflicts with the current framework state:

- `SUPERSEDED` is required when an active claim becomes wrong under a current
  correction.
- Use "Historical Paper N v.X-era [object]" for material whose original
  computation remains valid but whose framing has been superseded.
- Use the "computation valid, framing superseded" pattern when the numerical
  result should be retained but its active-resolution claim is no longer
  current.
- Preserve no-go findings that remain structurally valid even if their original
  motivation has changed.

Example:

Step 152 (Paper 20 D/H -3.9 sigma tension) was historically computed correctly.
The tension was real at that publication state. But the framing as an active
D/H tension requiring a DeltaN_eff radiation route is superseded by the YPCMB
wrapper correction.

### 2.6 Cross-Paper Inherited Material Conventions

Rules for appendix steps inherited from earlier papers:

- Inherited steps that reproduce earlier papers' content verbatim should
  preserve the original status labels.
- Inherited steps whose framework state has been retired by subsequent
  corrections must be marked `Historical/SUPERSEDED` with the active
  replacement cited.
- Inherited steps whose underlying computation is correct but whose physical
  interpretation has shifted should retain the computation and add a
  contextualizing note.
- When a paper's own Step N has the same number as an inherited Step N from an
  earlier paper, the paper's native step takes precedence and the inheritance
  relationship should be explicit in the step text.

---

## Section 3: Versioning Conventions

### 3.1 Version Bump Triggers

A version bump is required when:

- numerical values reported in the manuscript change,
- status labels on theorems or premises change (`DERIVED` to
  `DERIVED/CONDITIONAL` counts),
- new theorems, lemmas, or no-go results are added,
- cross-paper references are updated to current framework state,
- substantive editorial changes are made to claims, scope, or conclusions.

A version bump is not required for:

- pure typographical corrections,
- bibliography formatting,
- layout adjustments that do not change content.

### 3.2 Pre-Publication vs Post-Publication Revision Rules

Pre-publication, when the paper is not yet on Zenodo:

- in-place revision is acceptable,
- the version label may stay the same during active development,
- the final version label is set at upload.

Post-publication, when the paper has a Zenodo DOI:

- any substantive change requires a version bump,
- the previous version remains permanently citable at its original DOI,
- the new version is uploaded as a new Zenodo record under the same concept
  DOI.

### 3.3 Version History Entry Requirements

Each version bump must add a new entry to the version history block at the top
of the manuscript with:

- version number and month/year date,
- concise description of what changed,
- concrete numerical before/after if numerical values changed,
- explicit list of locations modified for non-trivial changes,
- cross-paper consistency note if the change affects sibling papers,
- statement of which distinctive results are unaffected, to assure readers the
  paper's main contribution is preserved.

Previous version-history entries are never deleted. They form the audit trail.

---

## Section 4: Cross-Paper Reference Conventions

### 4.1 Citing Framework-Active vs Historical Results

When a paper cites another paper's result:

- If the cited result remains the active framework position, cite the current
  version: "Paper N v.X".
- If citing the result as it appeared in a specific historical version, qualify
  explicitly: "Paper N v1.3 published, using YPBBN output".
- Numerical values should be cited from the most recent corrected version
  unless the citation is explicitly historical.

### 4.2 When to Update Cross-Paper References

Cross-paper references should be updated when:

- the cited paper undergoes a version bump that changes the cited numerical
  value or label,
- the citing paper itself undergoes a version bump, which is a good time to
  refresh references,
- the cited paper's central claim changes status, for example `DERIVED` to
  `DERIVED/CONDITIONAL`, or theorem promoted/retired.

Cross-paper references should not be silently updated mid-paragraph if the
original citation was historically meaningful, for example when describing the
state at first publication.

### 4.3 Bibliography Conventions

- Each cross-paper reference is a separate bibliography entry, not just an
  inline citation.
- Bibliography numbering must be contiguous within each paper.
- The Conventions reference should be cited in every paper's bibliography as a
  separate entry.
- Self-references, meaning the paper citing itself for clarity, are permitted
  and should be marked `[This paper]`.

---

## Closing Note

The IO Framework conventions will evolve as the framework matures. Version 2.0
is current as of May 2026. Future versions should be additive where possible so
that previously published papers' citations remain stable and backward
compatible.
