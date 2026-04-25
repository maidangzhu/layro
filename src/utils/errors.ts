export class CliError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CliError'
    this.code = code
  }
}

export const toErrorPayload = (
  error: unknown,
  command: string,
  file?: string,
  requestedType?: string
) => {
  if (error instanceof CliError) {
    return {
      ok: false,
      command,
      file,
      requestedType,
      error: {
        code: error.code,
        message: error.message,
      },
    }
  }

  return {
    ok: false,
    command,
    file,
    requestedType,
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected error',
    },
  }
}
