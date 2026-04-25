# 命令说明

## `layro extract <file>`

提取本地文件中的可读文本。

参数：

- `--json`：输出结构化 JSON
- `-o, --output <path>`：把提取结果写入文件
- `--type <type>`：覆盖自动识别的文件类型

支持类型：

- `pdf`
- `docx`
- `html`
- `txt`
- `md`

示例：

```bash
layro extract ./resume.pdf
layro extract ./resume.pdf --json
layro extract ./notes.custom --type txt
layro extract ./report.docx --output ./report.txt
```

## `layro ocr <file>`

识别本地图像中的文字。

参数：

- `--json`：输出结构化 JSON
- `-o, --output <path>`：把识别结果写入文件
- `-l, --lang <language>`：OCR 语言，例如 `eng`、`chi_sim`、`eng+chi_sim`
- `--psm <mode>`：页面分割模式，例如 `AUTO`、`SINGLE_LINE` 或 `7`
- `--no-preprocess`：跳过图像预处理

行为：

- 先校验输入文件
- 使用 `sharp` 读取图像
- 默认做一层预处理，提升 OCR 稳定性
- 使用 `tesseract.js` 执行识别
- 输出纯文本或结构化 JSON

推荐场景：

- 截图
- 扫描图片
- 小票
- 打印文本照片
- 含文字的导出图片或幻灯片图片

暂未覆盖：

- 扫描 PDF OCR
- 版面重建
- 手写体专项模型

示例：

```bash
layro ocr ./receipt.png
layro ocr ./receipt.png --json
layro ocr ./mixed-language.png --lang eng+chi_sim
layro ocr ./single-line.png --psm SINGLE_LINE
layro ocr ./photo.jpg --output ./photo.txt
```
