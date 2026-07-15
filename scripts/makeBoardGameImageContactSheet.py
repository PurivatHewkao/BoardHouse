from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageOps

ROOT = Path("public/images/boardgames")
OUT = ROOT / "_contact-sheet.jpg"
THUMB_W = 180
THUMB_H = 160
LABEL_H = 34
COLS = 7


def main():
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    rows = (len(manifest) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * THUMB_W, rows * (THUMB_H + LABEL_H)), "white")
    draw = ImageDraw.Draw(sheet)

    for index, item in enumerate(manifest):
        rel_path = item["file"].lstrip("/")
        path = Path("public") / rel_path
        image = Image.open(path).convert("RGB")
        image = ImageOps.contain(image, (THUMB_W - 12, THUMB_H - 12))

        x = (index % COLS) * THUMB_W
        y = (index // COLS) * (THUMB_H + LABEL_H)
        sheet.paste(image, (x + (THUMB_W - image.width) // 2, y + 6))
        draw.text((x + 6, y + THUMB_H + 4), item["name"][:24], fill=(20, 20, 20))

    sheet.save(OUT, quality=90)
    print(OUT.resolve())


if __name__ == "__main__":
    main()
