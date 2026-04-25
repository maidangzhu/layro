#!/usr/bin/env node

import { Command } from 'commander'
import { createExtractCommand } from './commands/extract'

const program = new Command()

program
  .name('layro')
  .description('Layro CLI')
  .version('0.1.0', '-v, --version', 'display version')

program.addCommand(createExtractCommand())
program.parse(process.argv)
