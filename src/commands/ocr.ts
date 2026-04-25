import { Command } from 'commander'
import path from 'path'
import { performOcr } from '../ocr'
import { CliError, toErrorPayload } from '../utils/errors'
import { writeJson, writePlainText, writeTextOutput } from '../utils/output'

type OcrOptions = {
  json?: boolean
  output?: string
  lang?: string
  preprocess?: boolean
  psm?: string
}

type SuccessPayload = {
  ok: true
  command: 'ocr'
  file: string
  text: string
  meta: Record<string, unknown>
}

export function createOcrCommand(): Command {
  return new Command('ocr')
    .description('Recognize text from local image files')
    .argument('<file>', 'image file path to OCR')
    .option('--json', 'output structured JSON')
    .option('-o, --output <path>', 'write recognized text to a file')
    .option('-l, --lang <language>', 'Tesseract language, e.g. eng or eng+chi_sim')
    .option('--psm <mode>', 'page segmentation mode, e.g. AUTO, SINGLE_LINE, or 7')
    .option('--no-preprocess', 'skip image preprocessing before OCR')
    .action(async (file: string, options: OcrOptions) => {
      const resolvedFile = path.resolve(file)

      try {
        const result = await performOcr(resolvedFile, {
          language: options.lang,
          preprocess: options.preprocess,
          psm: options.psm,
        })

        if (options.output) {
          result.meta.outputPath = writeTextOutput(options.output, result.text)
        }

        const payload: SuccessPayload = {
          ok: true,
          command: 'ocr',
          file: resolvedFile,
          text: result.text,
          meta: result.meta,
        }

        if (options.json) {
          writeJson(payload, process.stdout)
          return
        }

        writePlainText(result.text)
      } catch (error) {
        const payload = toErrorPayload(error, 'ocr', resolvedFile)

        if (options.json) {
          writeJson(payload, process.stderr)
        } else if (error instanceof CliError) {
          process.stderr.write(`${error.message}\n`)
        } else {
          process.stderr.write('Unexpected OCR failure\n')
        }

        process.exit(1)
      }
    })
}
