import releaseAction from './action'
import type { ICommandConfig } from '@/types'
import { DEFAULT_MAIN_BRANCH, DEFAULT_RELEASE_BRANCH } from '@/global/config'

export interface IReleaseAction {
  template: string
  main: string
}

export function createReleaseCommand(): ICommandConfig {
  return {
    name: 'release',
    description: 'switching of release branches',
    action: releaseAction,
    options: [
      {
        flags: '-t, --template <template>',
        description: 'set template name',
        defaultValue: DEFAULT_RELEASE_BRANCH,
      },
      {
        flags: '-m, --main <branch>',
        description: 'set main branch name',
        defaultValue: DEFAULT_MAIN_BRANCH,
      },
    ],
  }
}
