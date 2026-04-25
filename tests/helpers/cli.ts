import { spawnSync, type SpawnSyncReturns } from 'child_process'
import path from 'path'

const PACKAGE_DIR = path.resolve(__dirname, '../..')
const SRC_ENTRY = path.join(PACKAGE_DIR, 'src/index.ts')
const DIST_ENTRY = path.join(PACKAGE_DIR, 'dist/index.cjs')

type CliResult = SpawnSyncReturns<string>

const normalizeResult = (result: CliResult): CliResult => ({
  ...result,
  stdout: result.stdout ?? '',
  stderr: result.stderr ?? '',
})

export const buildLayroDist = (): CliResult =>
  normalizeResult(
    spawnSync('pnpm', ['build'], {
      cwd: PACKAGE_DIR,
      encoding: 'utf8',
      env: process.env,
    })
  )

export const runLayroCli = (args: string[]): CliResult =>
  normalizeResult(
    spawnSync('pnpm', ['exec', 'tsx', SRC_ENTRY, ...args], {
      cwd: PACKAGE_DIR,
      encoding: 'utf8',
      env: process.env,
    })
  )

export const runLayroDistCli = (args: string[]): CliResult =>
  normalizeResult(
    spawnSync('node', [DIST_ENTRY, ...args], {
      cwd: PACKAGE_DIR,
      encoding: 'utf8',
      env: process.env,
    })
  )

export const runLayroCliJson = (args: string[]) => {
  const result = runLayroCli(args)
  if (result.status !== 0) {
    throw new Error(
      `CLI failed with status ${result.status}\nSTDERR:\n${result.stderr}\nSTDOUT:\n${result.stdout}`
    )
  }

  return JSON.parse(result.stdout) as Record<string, unknown>
}

export const runLayroDistCliJson = (args: string[]) => {
  const result = runLayroDistCli(args)
  if (result.status !== 0) {
    throw new Error(
      `Dist CLI failed with status ${result.status}\nSTDERR:\n${result.stderr}\nSTDOUT:\n${result.stdout}`
    )
  }

  return JSON.parse(result.stdout) as Record<string, unknown>
}
