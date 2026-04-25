#!/usr/bin/env node

import { Command } from 'commander'
import { createExtractCommand } from './commands/extract'
import { createOcrCommand } from './commands/ocr'

const program = new Command()

program
  .name('layro')
  .description('Layro CLI')
  .version('0.1.0', '-v, --version', 'display version')

program.addCommand(createExtractCommand())
program.addCommand(createOcrCommand())
program.parse(process.argv)
