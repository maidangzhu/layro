# layro

`layro` is a small CLI for AI agents and automation workflows that need stable local file operations without ad-hoc package installs.

It currently focuses on two high-friction jobs:

- `extract`: extract readable text from local files
- `ocr`: recognize text inside local image files

`layro` is intentionally narrow. It does not try to be a full document platform. It aims to give agents one reliable command surface for common local text-ingestion work.

[中文说明](./README.zh-CN.md)

## Why

Agent workflows often break on the same pattern:

1. You pass a local file to an agent.
2. The agent spends time trying packages, scripts, or shell hacks.
3. The output shape is inconsistent, noisy, or fragile.

`layro` packages that boring plumbing into a CLI with stable outputs.

## Install

```bash
npm install -g layro
```

Or run it without installing globally:

```bash
npx layro extract ./resume.pdf
npx layro ocr ./screenshot.png
```

## Commands

### `extract`

Extract readable text from local files.

Supported file types:

- `pdf`
- `docx`
- `html`
- `txt`
- `md`

Examples:

```bash
layro extract ./resume.pdf
layro extract ./resume.pdf --json
layro extract ./report.docx --output ./report.txt
layro extract ./notes.custom --type txt
```

### `ocr`

Recognize text from local image files.

Current scope:

- Works on image files, not native text files
- Best for screenshots, scanned snippets, photos of text, and exported images
- Scanned PDF OCR is not included yet in this release

Common image inputs:

- `png`
- `jpg` / `jpeg`
- `webp`
- `tiff`
- `gif`
- other formats readable by `sharp`

Examples:

```bash
layro ocr ./receipt.png
layro ocr ./receipt.png --json
layro ocr ./screenshot.jpg --lang eng+chi_sim
layro ocr ./hero-image.png --output ./hero-image.txt
layro ocr ./single-line.png --psm SINGLE_LINE
```

## JSON Output

Both commands support `--json` for programmatic consumption.

Example:

```json
{
  "ok": true,
  "command": "ocr",
  "file": "/abs/path/screenshot.png",
  "text": "Recognized text...",
  "meta": {
    "extractor": "tesseract",
    "language": "eng",
    "confidence": 94.2,
    "preprocessed": true
  }
}
```

## OCR Notes

OCR is for text inside images.

- If your input is a native text document like `.txt`, `.md`, `.html`, or `.docx`, use `extract`
- If your input is a screenshot, scan, or photo, use `ocr`
- If your input is a PDF that already contains text, use `extract`
- If your input is a scanned PDF made of images, PDF OCR is a separate feature and is not in scope yet

## Development

Requirements:

- Node.js `>=18`
- pnpm `>=10`

Setup:

```bash
pnpm install
pnpm test
pnpm build
```

Local linking:

```bash
npm link
layro extract ./tests/fixtures/resume.pdf --json
npm unlink -g layro
```

## Docs

- [Command Reference](./docs/COMMANDS.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
- [Changelog](./CHANGELOG.md)

## License

ISC
