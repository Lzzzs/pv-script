import { createDevelopCommand } from './develop/index'
import { createReleaseCommand } from './release/index'
import { createVersionCommand } from './version//index'

export default [
  createDevelopCommand,
  createReleaseCommand,
  createVersionCommand,
]
