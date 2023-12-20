import { Command } from 'commander'
import registerCommand from './registerCommand'
import { description, name, version } from '@/utils/getPackageJson'

const program = new Command()

program
  .name(name)
  .description(description)
  .version(version)

registerCommand(program)

program.parse()
