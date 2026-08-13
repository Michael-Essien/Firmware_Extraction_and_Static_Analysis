from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
f_title = ImageFont.truetype(FONT_B, 22)
f_box = ImageFont.truetype(FONT_B, 17)
f_small = ImageFont.truetype(FONT, 14)

W, H = 1400, 760
img = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(img)

NAVY = (30, 46, 74)
BLUE = (61, 111, 181)
LIGHT = (223, 234, 247)
GREY = (110, 110, 110)
GREEN = (46, 139, 87)
BORDER = (61, 111, 181)

def box(x, y, w, h, title, lines, fill=LIGHT, border=BORDER):
    d.rounded_rectangle([x, y, x+w, y+h], radius=14, fill=fill, outline=border, width=3)
    d.text((x + w/2, y + 28), title, font=f_box, fill=NAVY, anchor="mm")
    ty = y + 56
    for ln in lines:
        d.text((x + w/2, ty), ln, font=f_small, fill=GREY, anchor="mm")
        ty += 20

def arrow(x1, y1, x2, y2, label=None):
    d.line([x1, y1, x2, y2], fill=NAVY, width=3)
    # arrowhead
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    ah = 12
    d.polygon([
        (x2, y2),
        (x2 - ah*1.6*math.cos(ang - 0.4), y2 - ah*1.6*math.sin(ang - 0.4)),
        (x2 - ah*1.6*math.cos(ang + 0.4), y2 - ah*1.6*math.sin(ang + 0.4)),
    ], fill=NAVY)
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        d.text((mx, my - 18), label, font=f_small, fill=GREY, anchor="mm")

d.text((W/2, 34), "Figure 3. Isolated Lab Environment and Analysis Workflow", font=f_title, fill=NAVY, anchor="mm")

# Outer isolated lab boundary
d.rounded_rectangle([50, 90, W-50, H-40], radius=20, outline=(200,60,60), width=3)
d.text((70, 100), "Isolated Lab Network (no internet-facing / production traffic)", font=f_small, fill=(200,60,60))

# Host machine
box(100, 170, 320, 150, "Host Machine (Laptop)", ["Physical workstation", "Runs the analysis VM"])

# Kali VM
box(500, 170, 380, 150, "Kali Linux VM", ["User: essien", "binwalk / strings / grep", "firmwalker, file, sha256sum"])

# Firmware source
box(1000, 170, 300, 150, "Firmware Source", ["Vendor firmware download", "(or UART / chip-off dump", "from physical device)"])

arrow(420, 245, 500, 245, "hosts")
arrow(880, 245, 1000, 245, "acquires image")

# Analysis pipeline row
box(150, 400, 300, 150, "Extraction", ["binwalk signature scan", "binwalk -e carve/decompress"])
box(550, 400, 300, 150, "Static Analysis", ["Filesystem exploration", "strings / grep for secrets"])
box(950, 400, 300, 150, "Verification", ["firmwalker automated scan", "cross-check manual findings"])

arrow(1150, 320, 300, 400, None)
arrow(450, 475, 550, 475, "results feed into")
arrow(850, 475, 950, 475, "cross-checked by")

# Output
box(500, 610, 400, 110, "Findings & Report", ["Documented weaknesses", "Risk assessment + recommendations"])
arrow(700, 550, 700, 610, "written up as")

img.save("images/lab_diagram.png")
print("saved diagram")
