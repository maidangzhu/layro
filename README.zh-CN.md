# layro

`layro` 是一个面向 AI Agent 和自动化流程的小型 CLI，目标是把本地文件处理里那些高频、低价值、容易反复折腾的部分，收敛成稳定命令。

当前提供两类能力：

- `extract`：提取本地文件中的可读文本
- `ocr`：识别本地图像中的文字

它不是一个“大而全”的文档平台，而是一个给 Agent 用的、接口稳定的本地文本摄取层。

[English README](./README.md)

## 这个项目解决什么问题

你把一个本地文件交给 Agent 后，经常会发生同样的事：

1. Agent 先猜该装哪个包
2. 再写一点临时脚本
3. 然后输出格式还不稳定

`layro` 想做的事很简单：把这层摩擦拿掉。

## 安装

```bash
npm install -g layro
```

也可以直接用：

```bash
npx layro extract ./resume.pdf
npx layro ocr ./screenshot.png
```

## 命令

### `extract`

用于提取本地文件中的可读文本。

当前支持：

- `pdf`
- `docx`
- `html`
- `txt`
- `md`

示例：

```bash
layro extract ./resume.pdf
layro extract ./resume.pdf --json
layro extract ./report.docx --output ./report.txt
layro extract ./notes.custom --type txt
```

### `ocr`

用于识别本地图像中的文字。

当前范围：

- 处理图片，不处理原生文本文件
- 适合截图、扫描片段、图片导出、文字照片
- 这一版还不包含扫描 PDF OCR

常见输入格式：

- `png`
- `jpg` / `jpeg`
- `webp`
- `tiff`
- `gif`
- 以及 `sharp` 可读取的其他图像格式

示例：

```bash
layro ocr ./receipt.png
layro ocr ./receipt.png --json
layro ocr ./mixed-language.png --lang eng+chi_sim
layro ocr ./single-line.png --psm SINGLE_LINE
layro ocr ./screenshot.jpg --output ./screenshot.txt
```

## OCR 到底是针对图片还是文件

严格来说，OCR 识别的是“图像中的文字”。

所以更准确的说法不是“它针对文件还是文本”，而是：

- 如果文件里本来就有文本层，用 `extract`
- 如果文件本质上是图像，比如截图、照片、扫描图，用 `ocr`
- 如果是带文本层的 PDF，用 `extract`
- 如果是扫描 PDF，那本质上还是图片型文档，需要单独做 PDF OCR，这一版暂未支持

## 开发

要求：

- Node.js `>=18`
- pnpm `>=10`

```bash
pnpm install
pnpm test
pnpm build
```

本地 link 验证：

```bash
npm link
layro extract ./tests/fixtures/resume.pdf --json
npm unlink -g layro
```

## 文档

- [命令说明](./docs/COMMANDS.zh-CN.md)
- [贡献指南](./CONTRIBUTING.md)
- [安全策略](./SECURITY.md)
- [变更记录](./CHANGELOG.md)

## License

ISC
