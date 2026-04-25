# Command Reference

## `layro extract <file>`

Extract readable text from a local file.

Options:

- `--json`: output structured JSON
- `-o, --output <path>`: write extracted text to a file
- `--type <type>`: override file type detection

Supported types:

- `pdf`
- `docx`
- `html`
- `txt`
- `md`

Examples:

```bash
layro extract ./resume.pdf
layro extract ./resume.pdf --json
layro extract ./notes.custom --type txt
layro extract ./report.docx --output ./report.txt
```

## `layro ocr <file>`

Recognize text from a local image.

Options:

- `--json`: output structured JSON
- `-o, --output <path>`: write recognized text to a file
- `-l, --lang <language>`: OCR language, e.g. `eng`, `chi_sim`, or `eng+chi_sim`
- `--psm <mode>`: page segmentation mode, e.g. `AUTO`, `SINGLE_LINE`, or `7`
- `--no-preprocess`: skip image preprocessing

Behavior:

- Validates the input as a local file
- Reads the image with `sharp`
- Preprocesses to improve OCR by default
- Runs recognition with `tesseract.js`
- Returns plain text or structured JSON

Recommended use cases:

- screenshots
- scans
- receipts
- photos of printed text
- exported slides or images with text

Not in scope yet:

- scanned PDF OCR
- layout reconstruction
- handwriting-specific models

Examples:

```bash
layro ocr ./receipt.png
layro ocr ./receipt.png --json
layro ocr ./mixed-language.png --lang eng+chi_sim
layro ocr ./single-line.png --psm SINGLE_LINE
layro ocr ./photo.jpg --output ./photo.txt
```
