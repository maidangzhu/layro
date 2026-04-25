import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import Tesseract from 'tesseract.js'
import { CliError } from '../utils/errors'

const { createWorker, PSM } = Tesseract

const OCR_CACHE_DIR = path.join(os.homedir(), '.layro', 'tesseract-cache')

type OcrOptions = {
  language?: string
  preprocess?: boolean
  psm?: string
}

type OcrResult = {
  text: string
  meta: Record<string, unknown>
}

const normalizeText = (text: string) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim()

const ensureInputFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    throw new CliError('FILE_NOT_FOUND', `File not found: ${filePath}`)
  }

  const stats = fs.statSync(filePath)
  if (!stats.isFile()) {
    throw new CliError('INVALID_FILE', `Not a file: ${filePath}`)
  }
}

const resolveLanguage = (language?: string) => {
  const normalized = language?.trim()
  return normalized && normalized.length > 0 ? normalized : 'eng'
}

const resolvePsm = (psm?: string) => {
  if (!psm) {
    return PSM.AUTO
  }

  const normalized = psm.trim().toUpperCase()
  if (normalized in PSM) {
    return PSM[normalized as keyof typeof PSM]
  }

  const fromValue = Object.values(PSM).find((value) => value === psm.trim())
  if (fromValue) {
    return fromValue
  }

  throw new CliError(
    'UNSUPPORTED_PSM',
    `Unsupported page segmentation mode: ${psm}`
  )
}

const loadImageMetadata = async (filePath: string) => {
  try {
    const metadata = await sharp(filePath).metadata()
    if (!metadata.format) {
      throw new CliError(
        'UNSUPPORTED_OCR_INPUT',
        `Could not determine image format for OCR: ${filePath}`
      )
    }

    return metadata
  } catch (error) {
    if (error instanceof CliError) {
      throw error
    }

    throw new CliError(
      'UNSUPPORTED_OCR_INPUT',
      `Unsupported OCR input: ${path.basename(filePath)}`
    )
  }
}

const preprocessImage = async (filePath: string, enabled: boolean) => {
  const pipeline = sharp(filePath, { limitInputPixels: false }).rotate()

  if (!enabled) {
    return pipeline.png().toBuffer()
  }

  return pipeline
    .grayscale()
    .normalize()
    .sharpen()
    .threshold(180)
    .png()
    .toBuffer()
}

export const performOcr = async (
  filePath: string,
  options: OcrOptions = {}
): Promise<OcrResult> => {
  ensureInputFile(filePath)

  const language = resolveLanguage(options.language)
  const psm = resolvePsm(options.psm)
  const preprocess = options.preprocess ?? true
  const metadata = await loadImageMetadata(filePath)
  const imageBuffer = await preprocessImage(filePath, preprocess)

  fs.mkdirSync(OCR_CACHE_DIR, { recursive: true })

  const worker = await createWorker(language, 1, {
    cachePath: OCR_CACHE_DIR,
    logger: () => undefined,
    errorHandler: () => undefined,
  })

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: psm,
      preserve_interword_spaces: '1',
    })

    const result = await worker.recognize(imageBuffer, { rotateAuto: true })
    const text = normalizeText(result.data.text)
    const words = result.data.text
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean)

    return {
      text,
      meta: {
        extractor: 'tesseract',
        language,
        confidence: Number(result.data.confidence.toFixed(2)),
        words: words.length,
        psm,
        preprocessed: preprocess,
        inputFormat: metadata.format,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
      },
    }
  } finally {
    await worker.terminate()
  }
}
