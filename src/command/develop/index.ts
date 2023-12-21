import developAction from './action'
import type { ICommandConfig } from '@/types'
import { DEFAULT_DEVELOP_BRANCH, DEFAULT_MAIN_BRANCH } from '@/global/config'

export interface IDevelopOptions {
  template: string
  main: string
}

export function createDevelopCommand(): ICommandConfig {
  return {
    name: 'develop',
    description: 'switching of develop branches',
    action: developAction,
    options: [
      {
        flags: '-t, --template <template>',
        description: 'set template name',
        defaultValue: DEFAULT_DEVELOP_BRANCH,
      },
      {
        flags: '-m, --main <branch>',
        description: 'set main branch name',
        defaultValue: DEFAULT_MAIN_BRANCH,
      },
    ],
  }
}
