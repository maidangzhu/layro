import fs from 'fs'
import path from 'path'
import { buildLayroDist, runLayroCli, runLayroCliJson, runLayroDistCliJson } from './helpers/cli'
import { createFixtureDir, createOcrImageFixture } from './helpers/fixtures'

const normalizeText = (value: unknown) =>
  String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

describe('layro ocr command', () => {
  const fixtureDir = createFixtureDir()
  const imagePathPromise = createOcrImageFixture(fixtureDir, 'ocr-sample.png', [
    'LAYRO OCR',
    'Agent tools 123',
  ])
  const outputPath = path.join(fixtureDir, 'ocr-output.txt')
  const missingPath = path.join(fixtureDir, 'missing.png')

  beforeAll(() => {
    const buildResult = buildLayroDist()
    expect(buildResult.status).toBe(0)
  })

  afterAll(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true })
  })

  test('extracts text from an image', async () => {
    const imagePath = await imagePathPromise
    const data = runLayroCliJson(['ocr', imagePath, '--json'])
    const text = normalizeText(data.text)

    expect(data.ok).toBe(true)
    expect(data.command).toBe('ocr')
    expect(data.file).toBe(imagePath)
    expect(text).toContain('layro ocr')
    expect(text).toContain('agent tools 123')
    expect(data.meta).toMatchObject({
      extractor: 'tesseract',
      language: 'eng',
      confidence: expect.any(Number),
      preprocessed: true,
    })
  })

  test('writes OCR output to a file', async () => {
    const imagePath = await imagePathPromise

    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }

    const result = runLayroCli(['ocr', imagePath, '--output', outputPath])
    expect(result.status).toBe(0)
    expect(fs.existsSync(outputPath)).toBe(true)
    expect(normalizeText(fs.readFileSync(outputPath, 'utf8'))).toContain('layro ocr')
  })

  test('built dist extracts text from an image', async () => {
    const imagePath = await imagePathPromise
    const data = runLayroDistCliJson(['ocr', imagePath, '--json'])
    expect(data.ok).toBe(true)
    expect(normalizeText(data.text)).toContain('layro ocr')
  })

  test('fails on missing files', () => {
    const result = runLayroCli(['ocr', missingPath, '--json'])
    expect(result.status).toBe(1)
    const data = JSON.parse(result.stderr) as Record<string, unknown>
    expect(data.ok).toBe(false)
    expect(data.error).toMatchObject({
      code: 'FILE_NOT_FOUND',
    })
  })
})
