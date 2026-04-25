import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'

export const DOCX_FIXTURE_BASE64 =
  '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'

export const createFixtureDir = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'layro-fixture-'))

const PDF_FIXTURE_PATH = path.resolve(__dirname, '../fixtures/resume.pdf')

export const writeExtractFixtures = async (fixtureDir: string) => {
  const txtPath = path.join(fixtureDir, 'sample.txt')
  const htmlPath = path.join(fixtureDir, 'sample.html')
  const docxPath = path.join(fixtureDir, 'sample.docx')
  const oddTextPath = path.join(fixtureDir, 'sample.custom')
  const unsupportedPath = path.join(fixtureDir, 'sample.csv')

  fs.writeFileSync(txtPath, 'Hello text fixture\nSecond line\n', 'utf8')
  fs.writeFileSync(
    htmlPath,
    '<html><body><h1>Hello HTML</h1><p>AI agent extract</p></body></html>',
    'utf8'
  )
  fs.writeFileSync(docxPath, Buffer.from(DOCX_FIXTURE_BASE64, 'base64'))
  fs.writeFileSync(oddTextPath, 'Forced type override works', 'utf8')
  fs.writeFileSync(unsupportedPath, 'a,b,c\n1,2,3\n', 'utf8')

  return {
    txtPath,
    htmlPath,
    docxPath,
    pdfPath: PDF_FIXTURE_PATH,
    oddTextPath,
    unsupportedPath,
  }
}

export const createOcrImageFixture = async (
  fixtureDir: string,
  fileName: string,
  lines: string[]
) => {
  const imagePath = path.join(fixtureDir, fileName)
  const textElements = lines
    .map(
      (line, index) =>
        `<text x="72" y="${140 + index * 110}" font-size="72" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#111111">${line}</text>`
    )
    .join('')

  const svg = `
    <svg width="1800" height="${220 + lines.length * 120}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff" />
      ${textElements}
    </svg>
  `

  await sharp(Buffer.from(svg))
    .png()
    .toFile(imagePath)

  return imagePath
}
