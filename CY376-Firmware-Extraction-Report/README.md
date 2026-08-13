# Firmware Extraction and Static Analysis of a Home Router

**CY376 — Network Monitoring, Security and Auditing**
End-of-Semester Project — Red Team Track

## Summary

This project acquires, extracts, and statically analyses the firmware of a
TP-Link Archer C7 v2 home router (firmware v260427, April 2026) to identify
security weaknesses visible from the firmware image alone — no live device
or network traffic involved. Using `binwalk` to identify and extract the
embedded filesystem, followed by manual inspection and an automated
`firmwalker` scan, the project confirmed a hardcoded root password hash
(weak MD5-crypt scheme) and a broader-than-necessary set of bundled
remote-access services (SSH, FTP, TFTP, SMB). It also directly tested for,
and did not find, exposed private key material or an undocumented
telnet/debug backdoor — both reported as genuine negative results rather
than assumed. Each finding is mapped to a CWE/MITRE ATT&CK category with
recommendations.

Full write-up: [`docs/report/CY376_Firmware_Extraction_Report.pdf`](docs/report/CY376_Firmware_Extraction_Report.pdf)
(also available as [`.docx`](docs/report/CY376_Firmware_Extraction_Report.docx))

Presentation deck: [`docs/report/CY376_Presentation.pptx`](docs/report/CY376_Presentation.pptx)

## Author

- **Name:** Essien Michael Obimpeh
- **Index Number:** _[insert your index number]_
- **Programme:** BSc Cybersecurity, University of Mines and Technology (UMaT), Tarkwa

## Tools Used

| Tool | Purpose |
|---|---|
| [binwalk](https://github.com/ReFirmLabs/binwalk) | Firmware signature scanning and filesystem extraction |
| [firmwalker](https://github.com/craigz28/firmwalker) | Automated search for credentials, keys, and backdoor binaries |
| `file`, `strings`, `grep`, `sha256sum` | Standard Linux utilities for filesystem and binary inspection |
| Python (`reportlab`, `Pillow`) | Generates the report PDF and lab diagram |
| Node.js (`docx`, `pptxgenjs`) | Generates the report `.docx` and presentation `.pptx` |

## How to Run

### 1. Reproduce the firmware analysis

```bash
sudo apt install -y binwalk unzip
git clone https://github.com/craigz28/firmwalker ~/tools/firmwalker
bash scripts/run_analysis.sh
```

Screenshots of each step are already captured in `evidence/` (see
`evidence/README.md` for what each file shows). Re-running the script
reproduces the same result end to end — the SHA-256 checksum in the report
confirms it's the same firmware image every time.

### 2. Regenerate the report (optional — only needed if you edit the content)

```bash
# PDF
pip install reportlab pillow --break-system-packages
python3 src/generate_lab_diagram.py
python3 src/generate_report_pdf.py

# DOCX
cd src && npm install docx image-size && node generate_report_docx.js
```

## Repository Structure

```
.
├── README.md
├── docs/
│   └── report/
│       ├── CY376_Firmware_Extraction_Report.pdf
│       ├── CY376_Firmware_Extraction_Report.docx
│       ├── CY376_Presentation.pptx
│       └── assets/              # lab diagram used in the report
├── src/                         # scripts used to generate the report itself
├── scripts/
│   └── run_analysis.sh          # the actual firmware extraction/analysis commands
├── evidence/                    # real screenshots + full firmwalker output
└── configs/                     # (unused — no device configuration was modified)
```

## Key Findings

| Finding | Severity | Type |
|---|---|---|
| Hardcoded root password hash (weak MD5-crypt scheme) | High | Positive |
| Bundled remote-access services (SSH, FTP, TFTP, SMB) | Medium | Positive |
| No private keys/certificates found at rest | Informational | Negative |
| No telnet/debug backdoor found | Informational | Negative |

Full detail, risk mapping, and recommendations are in the report.

## Scope Note

This is a static-analysis-only project against a publicly downloadable
firmware image. No live device was probed and no production network was
involved, per the course's requirement that Red Team work stay inside
instructor-approved, isolated lab environments.
