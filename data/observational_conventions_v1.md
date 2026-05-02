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
