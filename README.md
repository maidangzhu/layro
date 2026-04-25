# layro

`layro` 是一个给 AI Agent 用的轻量 CLI 抽象层。

它不试图替 Agent 思考，只是把常见能力先封装成稳定的命令行入口，减少临时装包、写脚本、处理格式的摩擦。

当前版本只提供一个能力：

- `extract`：从本地文件中提取可读文本

## 安装

```bash
npm i -g layro
```

也可以直接用：

```bash
npx layro extract ./file.pdf
```

## 用法

```bash
layro extract ./resume.pdf
layro extract ./resume.pdf --json
layro extract ./resume.pdf --output result.txt
layro extract ./notes.custom --type txt
```

## 支持格式

- `pdf`
- `docx`
- `html`
- `txt`
- `md`

## 输出模式

默认输出纯文本，适合直接在终端里看：

```bash
layro extract ./resume.pdf
```

加 `--json` 后输出结构化结果，适合 Agent、脚本或其他程序读取：

```bash
layro extract ./resume.pdf --json
```

返回结构大致如下：

```json
{
  "ok": true,
  "command": "extract",
  "file": "/abs/path/resume.pdf",
  "type": "pdf",
  "text": "提取后的正文...",
  "meta": {
    "extractor": "pdf",
    "chars": 1234
  }
}
```

## 开发

```bash
pnpm install
pnpm --filter layro build
pnpm --filter layro dev
pnpm --filter layro test
```
