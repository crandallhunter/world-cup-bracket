#!/usr/bin/env python3
"""
Extract FIFA 2026 Annexe C (third-placed teams combinations table) from the
official FIFA World Cup 26 Regulations PDF, and generate the TypeScript
lookup module at src/lib/tournament/annexC.ts.

Source PDF:
  https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf

Annex C is printed on book-pages 80-96 (PDF pages 41-49).

Run:
  pip install pdfplumber
  python3 scripts/parse-annex-c.py

The script performs three independent sanity checks:
  1. Every row has 8 distinct group letters drawn from A-L.
  2. Every slot assignment matches FIFA § 12.6 eligibility constraints.
  3. All 495 = C(12, 8) possible 8-group subsets are covered exactly once.

Any failure aborts the write.
"""

import os
import re
import sys
import json
from itertools import combinations
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    sys.exit("Install pdfplumber first: pip install pdfplumber")

REPO_ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = Path("/tmp/fifa2026_regs.pdf")
OUT_PATH = REPO_ROOT / "src" / "lib" / "tournament" / "annexC.ts"
JSON_DUMP = Path("/tmp/annex_c.json")

# FIFA § 12.6 eligibility for each of the 8 variable R32 slots, in the column
# order Annex C uses: 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L.
ELIGIBLE_PER_COLUMN = [
    set("CEFHI"),   # 1A → opponent of A1 (our M7)
    set("EFGIJ"),   # 1B → opponent of B1 (our M13)
    set("BEFIJ"),   # 1D → opponent of D1 (our M10)
    set("ABCDF"),   # 1E → opponent of E1 (our M3)
    set("AEHIJ"),   # 1G → opponent of G1 (our M9)
    set("CDFGH"),   # 1I → opponent of I1 (our M6)
    set("DEIJL"),   # 1K → opponent of K1 (our M15)
    set("EHIJK"),   # 1L → opponent of L1 (our M16)
]

PATTERN = re.compile(
    r"\b(\d{1,3})\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])"
    r"\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\b"
)


def extract_rows() -> dict[int, tuple[str, ...]]:
    """Parse PDF pages 41-49 and return {row_num: (col0..col7)}."""
    if not PDF_PATH.exists():
        sys.exit(
            f"PDF not found at {PDF_PATH}. Download it first:\n"
            "  curl -L -o /tmp/fifa2026_regs.pdf "
            "https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf"
        )

    rows: dict[int, tuple[str, ...]] = {}
    with pdfplumber.open(PDF_PATH) as pdf:
        for i in range(40, 50):
            page = pdf.pages[i]
            text = page.extract_text() or ""
            for m in PATTERN.finditer(text):
                row_num = int(m.group(1))
                if 1 <= row_num <= 495:
                    letters = tuple(m.group(k)[1] for k in range(2, 10))
                    if row_num in rows and rows[row_num] != letters:
                        sys.exit(
                            f"Conflicting extractions for row {row_num}: "
                            f"{rows[row_num]} vs {letters}"
                        )
                    rows[row_num] = letters
    return rows


def validate(rows: dict[int, tuple[str, ...]]) -> None:
    """Three independent sanity checks; abort on any failure."""
    # 1. Completeness
    missing = [r for r in range(1, 496) if r not in rows]
    if missing:
        sys.exit(f"Missing row numbers: {missing}")

    # 2. Shape: 8 distinct letters from A-L in every row
    for rn, letters in rows.items():
        if len(set(letters)) != 8:
            sys.exit(f"Row {rn} does not have 8 distinct letters: {letters}")
        for L in letters:
            if L not in "ABCDEFGHIJKL":
                sys.exit(f"Row {rn} has invalid letter {L!r}")

    # 3. Eligibility: every cell must be in its column's eligibility set
    violations = 0
    for rn, letters in rows.items():
        for col_idx, letter in enumerate(letters):
            if letter not in ELIGIBLE_PER_COLUMN[col_idx]:
                violations += 1
                if violations <= 5:
                    print(
                        f"  violation row {rn} col {col_idx}: "
                        f"{letter} not in {ELIGIBLE_PER_COLUMN[col_idx]}"
                    )
    if violations:
        sys.exit(f"{violations} eligibility violations")

    # 4. Combinatorial coverage: all 495 C(12,8) subsets present
    all_combos = {"".join(sorted(c)) for c in combinations("ABCDEFGHIJKL", 8)}
    table_combos = {"".join(sorted(set(v))) for v in rows.values()}
    if all_combos != table_combos:
        missing_c = sorted(all_combos - table_combos)[:5]
        extra_c = sorted(table_combos - all_combos)[:5]
        sys.exit(f"Subset mismatch. Missing: {missing_c} Extra: {extra_c}")


def emit_typescript(rows: dict[int, tuple[str, ...]]) -> None:
    lookup = {}
    for rn, letters in rows.items():
        key = "".join(sorted(set(letters)))
        lookup[key] = letters

    out = []
    out.append("// ─── FIFA 2026 Annexe C — Third-placed teams combinations table ────────────")
    out.append("// Source: FIFA World Cup 26 Regulations (March 2026)")
    out.append("//   https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf")
    out.append("//   PDF pages 41-49 (printed pages 80-96), heading \"ANNEXE C — COMBINATIONS")
    out.append("//   FOR EIGHT BEST THIRD-PLACED TEAMS\".")
    out.append("//")
    out.append("// This file is AUTO-GENERATED by scripts/parse-annex-c.py from the FIFA PDF.")
    out.append("// Do not hand-edit. If FIFA publishes a revision, re-run the extraction.")
    out.append("//")
    out.append("// Structure:")
    out.append("//   Key   = sorted 8-letter string of advancing group labels (e.g. \"ABCDEFGH\").")
    out.append("//   Value = 8-tuple of group labels, one per R32 slot, in the order FIFA")
    out.append("//           publishes them: [1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L]")
    out.append("//           which in this app corresponds to:")
    out.append("//             index 0 → M7  (opponent of A1)")
    out.append("//             index 1 → M13 (opponent of B1)")
    out.append("//             index 2 → M10 (opponent of D1)")
    out.append("//             index 3 → M3  (opponent of E1)")
    out.append("//             index 4 → M9  (opponent of G1)")
    out.append("//             index 5 → M6  (opponent of I1)")
    out.append("//             index 6 → M15 (opponent of K1)")
    out.append("//             index 7 → M16 (opponent of L1)")
    out.append("//")
    out.append("// Row count: 495 = C(12, 8). Every possible combination of 8 advancing")
    out.append("// groups out of 12 is covered exactly once.")
    out.append("")
    out.append("import type { GroupLabel } from '@/types/tournament';")
    out.append("")
    out.append("/** Order in which the Annex-C row is stored: [M7, M13, M10, M3, M9, M6, M15, M16]. */")
    out.append("export const ANNEX_C_SLOT_ORDER = ['M7', 'M13', 'M10', 'M3', 'M9', 'M6', 'M15', 'M16'] as const;")
    out.append("")
    out.append("export type AnnexCRow = readonly [")
    out.append("  GroupLabel, GroupLabel, GroupLabel, GroupLabel,")
    out.append("  GroupLabel, GroupLabel, GroupLabel, GroupLabel,")
    out.append("];")
    out.append("")
    out.append("export const ANNEX_C_TABLE: Readonly<Record<string, AnnexCRow>> = {")
    for key in sorted(lookup.keys()):
        values = lookup[key]
        tup = ", ".join(f"'{v}'" for v in values)
        out.append(f"  {key!r}: [{tup}],")
    out.append("};")
    out.append("")
    out.append("/**")
    out.append(" * Look up the Annex-C assignment for a given set of 8 advancing group labels.")
    out.append(" * Returns `null` if the set is not exactly 8 distinct groups from A-L, or if the")
    out.append(" * combination is not in the table (which should never happen — every C(12,8)")
    out.append(" * combination is covered).")
    out.append(" */")
    out.append("export function lookupAnnexC(groups: readonly GroupLabel[]): AnnexCRow | null {")
    out.append("  if (groups.length !== 8) return null;")
    out.append("  const unique = new Set(groups);")
    out.append("  if (unique.size !== 8) return null;")
    out.append("  const key = [...unique].sort().join('');")
    out.append("  return ANNEX_C_TABLE[key] ?? null;")
    out.append("}")
    out.append("")

    OUT_PATH.write_text("\n".join(out))
    print(f"Wrote {len(lookup)} rows to {OUT_PATH}")


def main() -> None:
    rows = extract_rows()
    print(f"Extracted {len(rows)} rows")
    validate(rows)
    print("All 3 sanity checks passed (completeness, eligibility, combinatorial coverage)")
    JSON_DUMP.write_text(json.dumps({str(k): list(v) for k, v in sorted(rows.items())}, indent=2))
    emit_typescript(rows)


if __name__ == "__main__":
    main()
