# paper/

The research paper of the project (CLAUDE.md hard rule 5): a high school investigatory paper, built from scratch in the
structure of the owner's reference (title page, Ch. 1 Introduction, Ch. 2 Methodology, Ch. 3 Presentation and
Analysis of Data, Ch. 4 Summary, References, Appendices).

| File | What it is |
|---|---|
| `Init_Research_Paper.docx` | The paper for Word. Short bond (8.5 x 11 in), Times New Roman 12, 1.5 spacing, 1 in margins. |
| `Init_Research_Paper.pdf` | The same text as a PDF (rendered by Chromium from the same blocks; page breaks may differ slightly from Word). |
| `content.mjs` | The text, tables and figure order. **Edit this, then rebuild.** |
| `diagrams.mjs` | The six diagrams as SVG (block, wiring, firmware flowchart, upload sequence, database, web pages). |
| `references.json` | Every reference, the date it was checked, how, and what it is used for. Only sources opened and read (rule 5). |
| `data/` | The 24 h run (P03-07) as JSON, from `fetch-data.mjs` (needs `.env`). |
| `build.mjs` | `node paper/build.mjs` writes the .docx and .pdf. `build/` holds the figure PNGs (gitignored). |

Update the paper in the same session as any feature, hardware or data change, then rebuild both files.
Researcher, coach and school names are left as `[...]` placeholders until the owner gives them.

## Chapter 4 parked (owner, s28)
Chapter 4 (Summary, Conclusions and Recommendations) is left out of the build until the owner says to put it back. Its text is kept in `chapter4.parked.txt`; to restore it, paste its lines into `content.mjs` just before the `refs` block.
