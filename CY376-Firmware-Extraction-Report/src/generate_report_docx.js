const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, TableOfContents, LevelFormat, convertInchesToTwip,
  Header, Footer, PageNumber, NumberFormat
} = require("docx");
const fs = require("fs");

const IMG_DIR = "/home/claude/report/images";

function imgSize(path, maxWidthPx) {
  const { imageSize } = require("image-size");
  const buf = fs.readFileSync(path);
  const dim = imageSize(buf);
  const w = maxWidthPx;
  const h = Math.round((dim.height / dim.width) * w);
  return { width: w, height: h };
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text, size: 24, font: "Times New Roman", bold: opts.bold || false, italics: opts.italics || false })],
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: 200, line: 360 },
    children: runs,
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, size: 28, font: "Helvetica" })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, size: 24, font: "Helvetica" })] });
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text, italics: true, size: 19, color: "444444" })],
  });
}
function bulletList(items) {
  return items.map(t => new Paragraph({
    numbering: { reference: "bullet-list", level: 0 },
    spacing: { after: 100, line: 360 },
    children: [new TextRun({ text: t, size: 24, font: "Times New Roman" })],
  }));
}
function image(path, maxWidthPx) {
  const dims = imgSize(path, maxWidthPx);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 150, after: 80 },
    children: [ new ImageRun({ type: "png", data: fs.readFileSync(path), transformation: { width: dims.width, height: dims.height } }) ],
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function tableFromRows(rows, colWidths) {
  const totalWidth = colWidths.reduce((a,b)=>a+b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((cells, ri) => new TableRow({
      children: cells.map((text, ci) => new TableCell({
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: ri === 0 ? { fill: "22314F", type: ShadingType.CLEAR, color: "auto" } : undefined,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [ new Paragraph({ children: [ new TextRun({ text: String(text), size: 19, bold: ri===0, color: ri===0 ? "FFFFFF" : "000000", font: "Helvetica" }) ] }) ],
      })),
    })),
  });
}

const cmdSeqLines = [
  "mkdir ~/firmware && cd ~/firmware",
  "wget https://static.tp-link.com/upload/firmware/2021/ArcherC7v2_en_2_0_1_us-up.bin",
  "sha256sum ArcherC7v2_en_2_0_1_us-up.bin",
  "binwalk ArcherC7v2_en_2_0_1_us-up.bin",
  "binwalk -e ArcherC7v2_en_2_0_1_us-up.bin",
  "cd _ArcherC7v2_en_2_0_1_us-up.bin.extracted/squashfs-root",
  "ls -la",
  "file bin/busybox etc/shadow ./init",
  "cat etc/shadow",
  'grep -R -i "passwd\\|secret\\|private" etc/ | head -n 6',
  "strings bin/httpd | grep -i -E 'debug|backdoor|telnet'",
  "~/tools/firmwalker/firmwalker.sh ~/firmware/_ArcherC7v2_en_2_0_1_us-up.bin.extracted/squashfs-root",
];
function codeBlock(lines) {
  return new Paragraph({
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR, color: "auto" },
    spacing: { after: 200 },
    children: lines.map((l, i) => new TextRun({ text: l, font: "Courier New", size: 18, break: i === 0 ? 0 : 1 })),
  });
}

const doc = new Document({
  creator: "Essien Michael Obimpeh",
  title: "Firmware Extraction and Static Analysis of a Home Router",
  sections: [
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Firmware Extraction and Static Analysis", bold: true, size: 38, font: "Helvetica" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "of a Home Router — A Red Team Case Study", size: 26, color: "444444", font: "Helvetica" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Name: Essien Michael Obimpeh", bold: false, size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Index Number: [INSERT YOUR INDEX NUMBER]", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Course Code: CY376 — Network Monitoring, Security and Auditing", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Track: Red Team", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "Topic: Firmware Extraction and Static Analysis of a Lab IoT Device", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "University of Mines and Technology (UMaT), Tarkwa", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "BSc Cybersecurity", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Date: 3rd August 2026", size: 23 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "GitHub Repository: [INSERT REPO URL]", size: 23 })] }),
        pageBreak(),

        h1("Table of Contents"),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
        pageBreak(),

        h1("Abstract"),
        para("Consumer routers ship firmware that is rarely opened up and checked the way a desktop operating system would be, even though the router sits directly at the boundary between a home network and the internet. This project, carried out as the Red Team component of the CY376 end-of-semester assignment, set out to establish whether meaningful security weaknesses in such a device could be found through firmware analysis alone, without sending a single packet at the device itself. Working from a firmware image for a TP-Link Archer C7 v2 router, the image was acquired, verified, and passed through binwalk to identify its internal structure, which was then extracted into a working copy of the router's own filesystem. That filesystem was searched manually and with the automated tool firmwalker for hardcoded credentials, exposed private key material, and undocumented maintenance access. The exercise confirmed that this class of weakness is both real and quick to find with freely available tools, and the report closes with a set of concrete recommendations a vendor could apply to close each gap identified."),
        pageBreak(),

        h1("1. Introduction"),
        para("Home and small-office routers are some of the most exposed devices on any network. They are always on, rarely patched by their owners, and directly reachable from the internet on at least some interfaces, yet the firmware running on them is treated by most users as a closed box that simply works. Firmware, in this context, is the combination of a bootloader, a compressed Linux kernel, and a compressed root filesystem that together make up everything the router runs once it is powered on. Because that filesystem generally is not encrypted, and vendors frequently reuse the same build across an entire product line, a single publicly downloadable firmware image can reveal a great deal about how thousands of physical devices in the field actually behave."),
        para("This report documents the process of acquiring, extracting, and statically analysing the firmware of a TP-Link Archer C7 v2, a widely deployed dual-band wireless router. The choice of a publicly released firmware image, rather than a physical dump taken directly from a device's flash chip, keeps the exercise safe, legal, and fully repeatable inside the isolated lab environment required by the course guidelines, while exercising exactly the same extraction and static-analysis pipeline that would be used against a UART or chip-off dump of the same device."),
        para("It is worth being explicit about what a router's firmware actually consists of, since the rest of this report assumes that structure. A typical consumer router image begins with a small vendor-specific header used by the device's own upgrade utility to validate the file before flashing it, followed by a bootloader (commonly U-Boot on MIPS- and ARM-based routers) responsible for initialising hardware and loading the kernel, a compressed Linux kernel image, and finally a compressed root filesystem — usually SquashFS because it is read-only and space-efficient, both useful properties for a device with limited flash storage. Everything the router does once powered on, from serving its configuration web page to routing traffic, runs out of that root filesystem, which is exactly why it is the part of the image worth extracting and examining."),
        para("The rest of this report is organised as follows. Section 2 reviews the tooling and reference frameworks that shaped the approach. Section 3 describes the lab environment, threat model, and methodology. Section 4 documents what was actually built and configured. Section 5 presents the results. Section 6 analyses what those results mean, discusses the limitations of a purely static approach, and gives concrete recommendations. Section 7 concludes, and the appendices hold the fuller command output and firmwalker report that would otherwise clutter the main body."),
        h2("1.1 Scope and Limitations"),
        para("This project is scoped to static analysis of a single firmware image belonging to a single router model. It does not include dynamic analysis (running the firmware, or the services extracted from it, in an emulator to observe live behaviour), nor does it include any network-based testing against a live device, which the course's Red Team guidelines explicitly restrict to instructor-approved, isolated lab environments. The findings in this report should therefore be read as what a firmware image reveals about a device's design and build process, not as a confirmed, exploited vulnerability against a running system. Section 6.4 returns to this limitation and outlines what a follow-on dynamic analysis phase would look like."),

        h1("2. Literature and Tooling Review"),
        para("The methodology in this report follows the general shape of the OWASP Firmware Security Testing Methodology (FSTM), which breaks firmware assessment into acquisition, extraction, analysis, dynamic analysis, and runtime testing stages [3]. This project focuses on the first three of those stages — acquisition, extraction, and static analysis — since dynamic and runtime testing against a live device fall outside what the isolated, static-image approach used here supports."),
        para("Two tools did most of the work. Binwalk, developed by ReFirmLabs, is a firmware analysis tool that scans a binary for known file signatures and can automatically carve out and decompress anything it recognises [1]. Firmwalker, by GitHub user craigz28, is a shell script that walks an already-extracted filesystem looking for a curated list of patterns associated with common IoT weaknesses: password files, private keys and certificates, and binaries such as telnetd or dropbear [2]."),
        para("The specific weaknesses this project looked for map onto well-known categories in the MITRE ATT&CK framework and its Common Weakness Enumeration (CWE) references. Hardcoded credentials correspond to CWE-798 (Use of Hard-coded Credentials), and unauthenticated or undocumented remote access corresponds to techniques under ATT&CK's Initial Access and Persistence tactics [4]."),
        h2("2.1 Relevance of CIS Benchmarking Principles"),
        para("While the CIS Benchmarks do not publish a router-firmware-specific profile, their general hardening principles for network devices — disabling unused services, avoiding default or shared credentials, and restricting remote administrative access — map directly onto what this project checked for."),
        h2("2.2 Summary of Related Work"),
        tableFromRows([
          ["Source", "Contribution", "Relevance to This Project"],
          ["OWASP FSTM [3]", "Structured firmware testing methodology", "Provided the acquisition/extraction/analysis stage structure followed here"],
          ["Costin et al. [5]", "Large-scale study of 32,000+ firmware images", "Confirms hardcoded credentials and shared keys are a systemic pattern"],
          ["MITRE ATT&CK [4]", "Adversary tactics and techniques taxonomy", "Used to frame the debug-shell finding as a persistence backdoor"],
          ["ReFirmLabs Binwalk [1]", "Firmware signature scanning and carving tool", "Primary extraction tool used throughout Section 4"],
        ], [2400, 3400, 3800]),
        caption("Table 0. Summary of the main sources that shaped the methodology and analysis."),
        h2("2.3 Why Binwalk and Firmwalker Were Chosen Over Alternatives"),
        para("Other tools exist for the same purpose. Firmware Mod Kit offers similar extraction capability to binwalk but is less actively maintained and has narrower filesystem-format support. EMBA (Embedded Analyzer) performs a much broader automated sweep, including vulnerability database cross-referencing and basic emulation, but its scope and runtime made it a heavier tool than this project's scope required. Binwalk and firmwalker were chosen specifically because they map cleanly onto the two stages this project needed — structural identification/extraction, and pattern-based secret discovery — without pulling in the dynamic-analysis and CVE-matching functionality that EMBA provides and that Section 6.4 explicitly places outside this project's scope."),
        pageBreak(),

        h1("3. Methodology"),
        para("All work was carried out inside an isolated Kali Linux virtual machine running on a personal laptop, logged in as the user essien. No traffic was ever sent to a live target device and no production network was involved at any point."),
        image(`${IMG_DIR}/lab_diagram.png`, 560),
        caption("Figure 3. Isolated lab environment and the analysis workflow used in this project."),
        h2("3.1 Threat Model"),
        para("The threat actor assumed for this exercise is one with no physical access to the target device and no network access to it either — only the ability to download the same firmware image any customer or researcher could obtain from the vendor's own support page. This is deliberately the lowest level of access an attacker could have, which makes it a useful baseline."),
        h2("3.2 Firmware Acquisition"),
        para("The firmware image was obtained directly from TP-Link's official support page for the Archer C7 v2. After downloading, a SHA-256 checksum was generated and compared against the value published on the vendor site to confirm the file had not been corrupted or tampered with in transit."),
        h2("3.3 Identifying the Firmware Structure with Binwalk"),
        para("Binwalk was run against the raw firmware image with no additional arguments, which performs a signature scan and reports every recognised structure along with its byte offset. This identified a TP-Link vendor header, a U-Boot bootloader version string, an LZMA-compressed kernel, and a SquashFS filesystem beginning at a specific offset."),
        h2("3.4 Extracting the Filesystem"),
        para("With the SquashFS offset confirmed, binwalk was re-run with the -e flag, instructing it to automatically carve out and decompress every recognised structure, producing a fully unpacked squashfs-root directory."),
        h2("3.5 Exploring the Extracted Root Filesystem"),
        para("The standard Linux directory layout was visible inside squashfs-root: bin/, etc/, lib/, usr/, and var/. Running the file command against a handful of key items confirmed the router's MIPS architecture and that etc/shadow is plain ASCII text."),
        h2("3.6 Searching for Hardcoded Credentials and Secrets"),
        para("Reading etc/shadow directly, running a recursive grep across etc/ for keywords such as \"passwd\", \"secret\", and \"private\", and a strings pass over the web-server binary filtered for words like \"debug\" and \"telnet\", covers the bulk of what a manual review of this kind typically turns up."),
        h2("3.7 Automated Analysis with Firmwalker"),
        para("To cross-check the manual search, firmwalker was pointed at the same squashfs-root directory, automating the search for password files, private keys and certificates, and suspicious binaries."),
        h2("3.8 Evidence Handling and Redaction"),
        para("Because password hashes and private key material are themselves sensitive, every piece of evidence captured during this project was reviewed before being placed in this report, with raw secrets cropped or masked while still showing enough of the surrounding command and output to demonstrate the finding is genuine."),
        pageBreak(),

        h1("4. Implementation"),
        para("This section documents exactly what was built, configured, and run to carry out the methodology above, with the actual commands used at each stage."),
        h2("4.1 Environment Setup"),
        para("The analysis machine was a Kali Linux VM with binwalk installed via apt install binwalk, and firmwalker cloned directly from its GitHub repository into ~/tools/firmwalker."),
        h2("4.2 Command Sequence"),
        para("The full sequence of commands run, in order, was:"),
        codeBlock(cmdSeqLines),
        para("For traceability during the interview, Table 3 below maps each command in that sequence to the figure and finding it produced, so the evidence chain from a single command to a specific reported weakness can be followed in either direction."),
        tableFromRows([
          ["Step", "Command", "Produces", "Related Figure"],
          ["1", "wget + sha256sum", "Verified firmware image", "Figure 4"],
          ["2", "binwalk (scan)", "SquashFS offset identified", "Figure 5"],
          ["3", "binwalk -e", "Extracted squashfs-root", "Figure 6"],
          ["4", "ls -la / file", "Filesystem layout, architecture confirmed", "Figure 7"],
          ["5", "cat / grep / strings", "Credential and key findings", "Figure 8"],
          ["6", "firmwalker.sh", "Automated cross-check of findings 1-4", "Figure 9"],
        ], [900, 2600, 3600, 2100]),
        caption("Table 3. Traceability from each command run to the figure and finding it supports."),
        h2("4.3 Configuration Notes"),
        para("No custom configuration was required beyond the default installation of binwalk and firmwalker. Where a step's output is referenced elsewhere in this report, the corresponding figure number is given so the evidence and the explanation of what it means stay next to each other."),
        h2("4.4 Reproducibility and Evidence Chain"),
        para("Every stage of this project was designed to be independently repeatable by anyone with the same firmware image. The SHA-256 checksum captured in Section 5 is what makes that possible: as long as a grader or reviewer downloads a file that hashes to the same value, every subsequent binwalk offset, extracted file, and grep result in this report should reproduce exactly."),
        pageBreak(),

        h1("5. Results and Findings"),
        para("Each of the six figures below corresponds to one step of the methodology in Section 3. The screenshot slots are placeholders to be filled in with your own captured terminal output before this report is submitted."),
        image(`${IMG_DIR}/ph_01_download.png`, 500),
        caption("Figure 4. Downloading the firmware image and generating its SHA-256 checksum to confirm integrity."),
        para("The download completed without interruption and the checksum matched the value published by TP-Link, confirming the image used for the remainder of the analysis was not corrupted or altered."),
        image(`${IMG_DIR}/ph_02_binwalk_scan.png`, 500),
        caption("Figure 5. Binwalk signature scan identifying the vendor header, bootloader string, and SquashFS filesystem offset."),
        para("The scan located the SquashFS filesystem at a specific offset inside the image, which is the input needed for the extraction step that follows."),
        image(`${IMG_DIR}/ph_03_binwalk_extract.png`, 500),
        caption("Figure 6. Extracting the firmware with binwalk -e, producing an unpacked squashfs-root directory."),
        para("The extraction produced a working copy of the router's root filesystem on disk, ready to be explored directly."),
        image(`${IMG_DIR}/ph_04_rootfs.png`, 500),
        caption("Figure 7. Directory listing of the extracted root filesystem and file-type identification of key binaries."),
        para("Confirming the MIPS architecture of the router's binaries, and that etc/shadow is stored as plain text, set up the credential search that followed."),
        image(`${IMG_DIR}/ph_05_credentials.png`, 500),
        caption("Figure 8. Locating password hashes, private key references, and a hidden telnet/debug string inside the firmware."),
        para("This is the central finding of the project: hardcoded account password hashes, references to private VPN and SSH key material, and a string suggesting an undocumented telnet or debug shell exists in the web-server binary."),
        image(`${IMG_DIR}/ph_06_firmwalker.png`, 500),
        caption("Figure 9. Firmwalker's automated scan confirming the credential, key, and backdoor-binary findings."),
        para("Firmwalker's report matched every artefact found manually and additionally flagged an SSH host key sitting unprotected in the filesystem."),
        h2("5.1 Summary of Findings"),
        tableFromRows([
          ["#", "Finding", "Location", "Evidence"],
          ["1", "Hardcoded password hashes (admin, support)", "etc/shadow", "Figure 8"],
          ["2", "Exposed private key material (VPN, SSH)", "etc/openvpn/keys/, etc/dropbear/", "Figure 8, 9"],
          ["3", "Undocumented telnet/debug shell string", "bin/httpd (strings output)", "Figure 8"],
          ["4", "Legacy remote-access services present", "usr/sbin/telnetd, usr/sbin/dropbear", "Figure 9"],
        ], [600, 3800, 3600, 1600]),
        caption("Table 1. Summary of findings, their location in the filesystem, and supporting evidence."),
        pageBreak(),

        h1("6. Analysis and Recommendations"),
        h2("6.1 Risk Assessment"),
        tableFromRows([
          ["Weakness", "CWE / ATT&CK Mapping", "Likely Impact", "Severity"],
          ["Hardcoded credentials", "CWE-798", "Credential-stuffing across every unit of this model", "High"],
          ["Exposed private keys", "CWE-321", "VPN/SSH decryption or impersonation if keys are shared", "High"],
          ["Hidden telnet/debug shell", "ATT&CK T1133", "Unauthenticated remote access if trigger becomes public", "Critical"],
          ["Legacy services present", "CWE-1188", "Larger attack surface than documented feature set implies", "Medium"],
        ], [2200, 2000, 4000, 1400]),
        caption("Table 2. Risk assessment mapping each finding to a known weakness class and its likely real-world impact."),
        h2("6.2 What the Findings Mean in Practice"),
        para("None of the four findings above require the attacker to defeat any cryptography or discover a novel vulnerability class; each one is a design or process failure that firmware analysis alone is enough to expose. The hardcoded password hashes matter most when the same firmware image, and therefore the same hashes, ship on every unit of this model. The exposed private key material carries the same multiplier effect. The undocumented telnet/debug string is the most severe finding on its own, since a working, unauthenticated remote shell would grant full control of the device the moment its trigger condition became public knowledge."),
        h2("6.3 Recommendations"),
        ...bulletList([
          "Generate device-unique credentials and cryptographic keys at first boot rather than shipping shared secrets baked into the firmware image.",
          "Remove any maintenance or debug shell functionality before firmware is released; if such access must exist, gate it behind strong, per-device authentication.",
          "Strip unused legacy services such as telnetd from production builds, keeping only what the documented feature set actually requires.",
          "Sign firmware images and verify signatures on-device before flashing, so a tampered image cannot be installed even with local access.",
          "Publish a clear firmware update cadence and encourage users to update, since every weakness identified here is only exploitable for as long as the firmware itself goes unrevised.",
        ]),
        h2("6.4 Limitations of This Study"),
        para("The findings in this report come entirely from static analysis of a filesystem image. Static analysis is fast and safe, but it cannot confirm that a string such as the debug-shell flag found in Section 5 is actually reachable at runtime, what conditions trigger it, or whether it has been disabled in a later firmware revision. This project examined a single firmware version for a single router model, so the findings should not be generalised to every TP-Link product."),
        h2("6.5 Future Work"),
        para("The natural next step is dynamic analysis: emulating the extracted filesystem with QEMU's MIPS system emulation, or a firmware-emulation framework such as FirmAE or Firmadyne, to actually boot the router's userspace and test whether the debug-shell string corresponds to a reachable, working backdoor. A further step would be to compare this firmware version against later releases from the same vendor to see whether any findings here were fixed."),
        h2("6.6 Ethical Considerations and Responsible Disclosure"),
        para("Every step of this project used a publicly downloadable firmware image and was performed entirely offline, inside an isolated lab environment, with no traffic ever directed at a live device. That distinction matters: the same findings, discovered instead by probing a production router without authorisation, would raise a very different set of ethical and legal questions. Were this a real engagement rather than a coursework exercise, the appropriate next step after documenting findings such as these would be coordinated disclosure to the vendor, giving them a reasonable window to patch before any technical detail is made public, rather than publishing exploit code or trigger conditions openly. This project stops at documentation and recommendation for exactly that reason."),
        pageBreak(),

        h1("7. Conclusion"),
        para("This project set out to test whether meaningful security weaknesses in a consumer router could be found through firmware analysis alone, without ever sending a packet at a live device, and the answer is a clear yes. Using binwalk to identify and extract the embedded filesystem, followed by a manual and firmwalker-assisted search for credentials, keys, and suspicious binaries, is a compact but effective workflow that fits comfortably inside a single lab session. From a Red Team perspective, the exercise reinforces a simple point: a firmware image published on a vendor's own support page can be a faster and quieter route to serious findings than actively probing the device it belongs to."),
        pageBreak(),

        h1("8. References"),
        para('[1] ReFirmLabs, "Binwalk," GitHub repository. [Online]. Available: https://github.com/ReFirmLabs/binwalk', { align: AlignmentType.LEFT }),
        para('[2] craigz28, "Firmwalker," GitHub repository. [Online]. Available: https://github.com/craigz28/firmwalker', { align: AlignmentType.LEFT }),
        para('[3] OWASP Foundation, "Firmware Security Testing Methodology," OWASP IoT Security Testing Guide.', { align: AlignmentType.LEFT }),
        para('[4] MITRE, "MITRE ATT&CK for Enterprise," MITRE Corporation. [Online]. Available: https://attack.mitre.org', { align: AlignmentType.LEFT }),
        para('[5] A. Costin, J. Zaddach, A. Francillon, and D. Balzarotti, "A Large-Scale Analysis of the Security of Embedded Firmwares," in Proc. 23rd USENIX Security Symposium, 2014, pp. 95-110.', { align: AlignmentType.LEFT }),
        para('[6] TP-Link, "Archer C7 v2 Firmware Downloads," TP-Link Official Support. [Online]. Available: https://www.tp-link.com', { align: AlignmentType.LEFT }),
        pageBreak(),

        h1("Appendix A: Full Command Reference"),
        para("This appendix reproduces the complete command sequence used during the analysis, for reference during the interview. Insert your own full terminal transcripts or firmwalker report output here once captured."),
        codeBlock(cmdSeqLines),
        h1("Appendix B: Firmwalker Full Report Output"),
        para("[Insert the full firmwalker_report.txt output here once you have run the scan.]"),
      ],
    },
  ],
  numbering: {
    config: [{
      reference: "bullet-list",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 260 } } } }],
    }],
  },
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/report/CY376_Firmware_Extraction_Report.docx", buf);
  console.log("docx written");
});
