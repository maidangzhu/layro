import fs from 'fs'
import path from 'path'
import { buildLayroDist, runLayroCli, runLayroCliJson, runLayroDistCliJson } from './helpers/cli'
import { createFixtureDir, writeExtractFixtures } from './helpers/fixtures'

describe('layro extract command', () => {
  const fixtureDir = createFixtureDir()
  const outputPath = path.join(fixtureDir, 'output.txt')
  const missingPath = path.join(fixtureDir, 'missing.pdf')
  let fixtures: Awaited<ReturnType<typeof writeExtractFixtures>>

  beforeAll(async () => {
    fixtures = await writeExtractFixtures(fixtureDir)
    const buildResult = buildLayroDist()
    expect(buildResult.status).toBe(0)
  })

  afterAll(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true })
  })

  test('extracts plain text by default', () => {
    const result = runLayroCli(['extract', fixtures.txtPath])
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Hello text fixture')
    expect(result.stdout).toContain('Second line')
    expect(result.stderr).toBe('')
  })

  test('extracts text as structured json', () => {
    const data = runLayroCliJson(['extract', fixtures.txtPath, '--json'])
    expect(data.ok).toBe(true)
    expect(data.command).toBe('extract')
    expect(data.type).toBe('txt')
    expect(data.file).toBe(fixtures.txtPath)
    expect(data.text).toContain('Hello text fixture')
    expect(data.meta).toMatchObject({
      chars: expect.any(Number),
      extractor: 'text',
    })
  })

  test('extracts html into readable text', () => {
    const data = runLayroCliJson(['extract', fixtures.htmlPath, '--json'])
    expect(data.ok).toBe(true)
    expect(data.type).toBe('html')
    expect(String(data.text)).toContain('Hello HTML')
    expect(String(data.text)).toContain('AI agent extract')
    expect(String(data.text)).not.toContain('<h1>')
  })

  test('extracts docx content', () => {
    const data = runLayroCliJson(['extract', fixtures.docxPath, '--json'])
    expect(data.ok).toBe(true)
    expect(data.type).toBe('docx')
    expect(String(data.text)).toContain('Hello DOCX fixture')
    expect(data.meta).toMatchObject({
      extractor: 'docx',
    })
  })

  test('extracts pdf content', () => {
    const data = runLayroCliJson(['extract', fixtures.pdfPath, '--json'])
    expect(data.ok).toBe(true)
    expect(data.type).toBe('pdf')
    expect(String(data.text).length).toBeGreaterThan(800)
    expect(data.meta).toMatchObject({
      extractor: 'pdf',
      pages: expect.any(Number),
    })
  })

  test('supports output files', () => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }

    const result = runLayroCli(['extract', fixtures.txtPath, '--output', outputPath])
    expect(result.status).toBe(0)
    expect(fs.existsSync(outputPath)).toBe(true)
    expect(fs.readFileSync(outputPath, 'utf8')).toContain('Hello text fixture')
  })

  test('supports explicit type overrides', () => {
    const data = runLayroCliJson(['extract', fixtures.oddTextPath, '--type', 'txt', '--json'])
    expect(data.ok).toBe(true)
    expect(data.type).toBe('txt')
    expect(String(data.text)).toContain('Forced type override works')
  })

  test('built dist extracts pdf content', () => {
    const data = runLayroDistCliJson(['extract', fixtures.pdfPath, '--json'])
    expect(data.ok).toBe(true)
    expect(data.type).toBe('pdf')
    expect(String(data.text).length).toBeGreaterThan(800)
  })

  test('fails on missing files', () => {
    const result = runLayroCli(['extract', missingPath, '--json'])
    expect(result.status).toBe(1)
    const data = JSON.parse(result.stderr) as Record<string, unknown>
    expect(data.ok).toBe(false)
    expect(data.error).toMatchObject({
      code: 'FILE_NOT_FOUND',
    })
  })

  test('fails on unsupported file types without override', () => {
    const result = runLayroCli(['extract', fixtures.unsupportedPath, '--json'])
    expect(result.status).toBe(1)
    const data = JSON.parse(result.stderr) as Record<string, unknown>
    expect(data.ok).toBe(false)
    expect(data.error).toMatchObject({
      code: 'UNSUPPORTED_FILE_TYPE',
    })
  })
})
