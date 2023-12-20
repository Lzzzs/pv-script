import type { Command } from 'commander'
import createCommandFunctions from './command/index'

export default function (program: Command) {
  createCommandFunctions.forEach((fn) => {
    const { name, description, action, options } = fn()

    const command = program.command(name).description(description).action(action)
    options?.forEach(({ flags, description, defaultValue }) => {
      command.option(flags, description, defaultValue)
    })
  })
}
