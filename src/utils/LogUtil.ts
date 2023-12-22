import { log } from 'node:console'
import chalk from 'chalk'

function errorLog(message: string) {
  log(chalk.bgRedBright(message))
}

function successLog(message: string) {
  log(chalk.green(message))
}

export {
  errorLog,
  successLog,
}
