import fs from 'fs'
import path from 'path'

export const writePlainText = (text: string) => {
  if (text.length === 0) {
    return
  }

  process.stdout.write(text.endsWith('\n') ? text : `${text}\n`)
}

export const writeJson = (payload: unknown, stream: NodeJS.WriteStream) => {
  stream.write(`${JSON.stringify(payload, null, 2)}\n`)
}

export const resolveOutputPath = (outputPath: string) => path.resolve(outputPath)

export const writeTextOutput = (outputPath: string, text: string) => {
  const resolvedOutput = resolveOutputPath(outputPath)
  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true })
  fs.writeFileSync(resolvedOutput, text, 'utf8')
  return resolvedOutput
}
