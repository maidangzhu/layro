import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'
import { htmlToText } from 'html-to-text'
import pdf from 'pdf-parse'
import { CliError } from '../utils/errors'

export type ExtractFileType = 'pdf' | 'docx' | 'html' | 'txt' | 'md'

type ExtractResult = {
  type: ExtractFileType
  text: string
  meta: Record<string, unknown>
}

type ExtractOptions = {
  type?: string
}

const fileTypeMap: Record<string, ExtractFileType> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.html': 'html',
  '.htm': 'html',
  '.txt': 'txt',
  '.md': 'md',
  '.markdown': 'md',
}

const normalizeType = (type: string): ExtractFileType => {
  const normalized = type.trim().toLowerCase()

  switch (normalized) {
    case 'pdf':
    case 'docx':
    case 'html':
    case 'txt':
    case 'md':
      return normalized
    case 'htm':
      return 'html'
    case 'text':
      return 'txt'
    case 'markdown':
      return 'md'
    default:
      throw new CliError(
        'UNSUPPORTED_FILE_TYPE',
        `Unsupported file type override: ${type}`
      )
  }
}

const detectFileType = (
  filePath: string,
  overrideType?: string
): ExtractFileType => {
  if (overrideType) {
    return normalizeType(overrideType)
  }

  const detected = fileTypeMap[path.extname(filePath).toLowerCase()]
  if (!detected) {
    throw new CliError(
      'UNSUPPORTED_FILE_TYPE',
      `Unsupported file type: ${path.extname(filePath) || 'unknown'}`
    )
  }

  return detected
}

const normalizeExtractedText = (text: string) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim()

const extractTextFile = (
  filePath: string,
  type: ExtractFileType
): ExtractResult => {
  const text = normalizeExtractedText(fs.readFileSync(filePath, 'utf8'))
  return {
    type,
    text,
    meta: {
      extractor: 'text',
      chars: text.length,
    },
  }
}

const extractHtmlFile = (filePath: string): ExtractResult => {
  const html = fs.readFileSync(filePath, 'utf8')
  const text = normalizeExtractedText(
    htmlToText(html, {
      wordwrap: false,
      selectors: [
        { selector: 'h1', format: 'heading', options: { uppercase: false } },
        { selector: 'h2', format: 'heading', options: { uppercase: false } },
        { selector: 'h3', format: 'heading', options: { uppercase: false } },
        { selector: 'h4', format: 'heading', options: { uppercase: false } },
        { selector: 'h5', format: 'heading', options: { uppercase: false } },
        { selector: 'h6', format: 'heading', options: { uppercase: false } },
        { selector: 'img', format: 'skip' },
      ],
    })
  )

  return {
    type: 'html',
    text,
    meta: {
      extractor: 'html',
      chars: text.length,
    },
  }
}

const extractDocxFile = async (filePath: string): Promise<ExtractResult> => {
  const result = await mammoth.extractRawText({ path: filePath })
  const text = normalizeExtractedText(result.value)

  return {
    type: 'docx',
    text,
    meta: {
      extractor: 'docx',
      chars: text.length,
    },
  }
}

const extractPdfFile = async (filePath: string): Promise<ExtractResult> => {
  const buffer = fs.readFileSync(filePath)
  const result = await pdf(buffer)
  const text = normalizeExtractedText(result.text)

  return {
    type: 'pdf',
    text,
    meta: {
      extractor: 'pdf',
      chars: text.length,
      pages: result.numpages,
    },
  }
}

export const extractFile = async (
  filePath: string,
  options: ExtractOptions = {}
): Promise<ExtractResult> => {
  if (!fs.existsSync(filePath)) {
    throw new CliError('FILE_NOT_FOUND', `File not found: ${filePath}`)
  }

  const stats = fs.statSync(filePath)
  if (!stats.isFile()) {
    throw new CliError('INVALID_FILE', `Not a file: ${filePath}`)
  }

  const type = detectFileType(filePath, options.type)

  switch (type) {
    case 'txt':
    case 'md':
      return extractTextFile(filePath, type)
    case 'html':
      return extractHtmlFile(filePath)
    case 'docx':
      return extractDocxFile(filePath)
    case 'pdf':
      return extractPdfFile(filePath)
    default:
      throw new CliError('UNSUPPORTED_FILE_TYPE', `Unsupported file type: ${type}`)
  }
}
