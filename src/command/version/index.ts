import versionAction from './action'
import type { ICommandConfig } from '@/types'

export function createVersionCommand(): ICommandConfig {
  return {
    name: 'version',
    description: 'update package version',
    action: versionAction,
  }
}
