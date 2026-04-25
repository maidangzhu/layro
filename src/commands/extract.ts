import fs from 'fs'
import path from 'path'
import { Command } from 'commander'
import { extractFile, type ExtractFileType } from '../extractors'
import { CliError, toErrorPayload } from '../utils/errors'

type ExtractOptions = {
  json?: boolean
  output?: string
  type?: string
}

type SuccessPayload = {
  ok: true
  command: 'extract'
  file: string
  type: ExtractFileType
  text: string
  meta: Record<string, unknown>
}

const writePlainText = (text: string) => {
  if (text.length === 0) {
    return
  }

  process.stdout.write(text.endsWith('\n') ? text : `${text}\n`)
}

const writeJson = (payload: unknown, stream: NodeJS.WriteStream) => {
  stream.write(`${JSON.stringify(payload, null, 2)}\n`)
}

const resolveOutputPath = (outputPath: string) => path.resolve(outputPath)

export function createExtractCommand(): Command {
  return new Command('extract')
    .description('Extract readable text from local files')
    .argument('<file>', 'file path to extract')
    .option('--json', 'output structured JSON')
    .option('-o, --output <path>', 'write extracted text to a file')
    .option('--type <type>', 'override detected file type')
    .action(async (file: string, options: ExtractOptions) => {
      const resolvedFile = path.resolve(file)

      try {
        const result = await extractFile(resolvedFile, {
          type: options.type,
        })

        if (options.output) {
          const resolvedOutput = resolveOutputPath(options.output)
          fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true })
          fs.writeFileSync(resolvedOutput, result.text, 'utf8')
          result.meta.outputPath = resolvedOutput
        }

        const payload: SuccessPayload = {
          ok: true,
          command: 'extract',
          file: resolvedFile,
          type: result.type,
          text: result.text,
          meta: result.meta,
        }

        if (options.json) {
          writeJson(payload, process.stdout)
          return
        }

        writePlainText(result.text)
      } catch (error) {
        const payload = toErrorPayload(
          error,
          'extract',
          resolvedFile,
          options.type
        )

        if (options.json) {
          writeJson(payload, process.stderr)
        } else if (error instanceof CliError) {
          process.stderr.write(`${error.message}\n`)
        } else {
          process.stderr.write('Unexpected extract failure\n')
        }

        process.exit(1)
      }
    })
}
