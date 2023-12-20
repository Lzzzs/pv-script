import { createDevelopCommand } from './develop/index'
import { createReleaseCommand } from './release/index'

export default [
  createDevelopCommand,
  createReleaseCommand,
]
