#!/bin/bash
# CY376 - Firmware Extraction and Static Analysis
# Run this yourself in your Kali VM. Screenshot each command as it runs
# (cropped to the terminal window) and save into ../evidence/ using the
# naming convention in evidence/README.md.
#
# Prerequisites:
#   sudo apt install binwalk unzip
#   git clone https://github.com/craigz28/firmwalker ~/tools/firmwalker

set -e

FW_URL="https://static.tp-link.com/upload/firmware/2026/202604/20260429/Archer%20C7(US)_V2_260427.zip"
ZIP_FILE="ArcherC7_V2_260427.zip"

mkdir -p ~/firmware && cd ~/firmware

echo "[1/6] Downloading firmware image..."
wget -O "$ZIP_FILE" "$FW_URL"

echo "Unzipping..."
rm -rf fw_extracted && mkdir fw_extracted
unzip -o "$ZIP_FILE" -d fw_extracted
ls -la fw_extracted/

# Find the actual firmware .bin inside the zip (TP-Link zips vary in exact name)
FW_FILE=$(find fw_extracted -iname "*.bin" | head -n 1)
if [ -z "$FW_FILE" ]; then
  echo "No .bin file found inside the zip — check 'ls -la fw_extracted/' above and tell Claude what you see."
  exit 1
fi
echo "Using firmware file: $FW_FILE"
cp "$FW_FILE" ./firmware.bin
FW_FILE="firmware.bin"

sha256sum "$FW_FILE"
# --- SCREENSHOT HERE: evidence/01_download.png ---

echo "[2/6] Binwalk signature scan..."
binwalk "$FW_FILE"
# --- SCREENSHOT HERE: evidence/02_binwalk_scan.png ---

echo "[3/6] Binwalk extraction..."
binwalk -e "$FW_FILE"
ls "_${FW_FILE}.extracted/"
# --- SCREENSHOT HERE: evidence/03_binwalk_extract.png ---

cd "_${FW_FILE}.extracted/"
# squashfs-root should exist if extraction found a filesystem; if the folder
# name differs, `ls` above will show you the real name — cd into that instead.
cd squashfs-root

echo "[4/6] Exploring extracted root filesystem..."
ls -la
file bin/busybox etc/shadow ./init 2>/dev/null || file bin/busybox* etc/shadow* ./init* 2>/dev/null || true
# --- SCREENSHOT HERE: evidence/04_rootfs.png ---

echo "[5/6] Searching for credentials and secrets..."
cat etc/shadow 2>/dev/null || echo "(no etc/shadow at this path — check ls -la output above)"
grep -R -i "passwd\|secret\|private" etc/ 2>/dev/null | head -n 6
strings bin/httpd 2>/dev/null | grep -i -E 'debug|backdoor|telnet' || echo "(no bin/httpd found — try grepping other binaries in bin/ or usr/sbin/)"
# --- SCREENSHOT HERE: evidence/05_credentials.png ---

echo "[6/6] Running firmwalker..."
~/tools/firmwalker/firmwalker.sh "$(pwd)"
# --- SCREENSHOT HERE: evidence/06_firmwalker.png ---

echo "Done. Now copy your screenshots into evidence/ and your firmwalker report into evidence/firmwalker_report.txt"
