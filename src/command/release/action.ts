import { spawn } from 'node:child_process'
import prompts from 'prompts'
import type { PromptObject } from 'prompts'
import ora from 'ora'
import type { IReleaseAction } from '.'
import { replaceVariables, validateTemplate } from '@/utils/OptionUtil'
import { checkoutCommand, pullMasterCommand, switchMasterCommand } from '@/utils/CommandUtil'
import { getPackageVersion } from '@/utils/getPackageJson'
import { errorLog, successLog } from '@/utils/LogUtil'

const customQuestion: PromptObject[] = [
  {
    type: 'text',
    name: 'customVersion',
    message: '请输入自定义版本',
    validate: (value: string) => {
      const pattern = /^\d+(?:\.\d+){2}$/
      return pattern.test(value) ? true : '版本规则不正确'
    },
  },
]

function genQuestionByVersion(version: string): PromptObject[] {
  const curVersion = version.split('.').map(item => Number(item))
  const patchVersion = `${curVersion[0]}.${curVersion[1]}.${curVersion[2] + 1}`
  const minorVersion = `${curVersion[0]}.${curVersion[1] + 1}.0`
  const majorVersion = `${curVersion[0] + 1}.0.0`

  return [
    {
      type: 'text',
      name: 'branch',
      message: '请输入要创建的 release 的分支名',
      validate: value => value.length > 0 ? true : '分支名称不能为空',
    },
    {
      type: 'select',
      name: 'newVersion',
      message: '请选择要发布的版本',
      choices: [
        { title: patchVersion, value: patchVersion, description: 'patch' },
        { title: minorVersion, value: minorVersion, description: 'minor' },
        { title: majorVersion, value: majorVersion, description: 'major' },
        { title: 'custom', value: 'custom', description: '自定义版本' },
      ],
      initial: 0,
    },
  ]
}

export default async function releaseAction(options: IReleaseAction) {
  const { template, main } = options

  if (!validateTemplate(template)) {
    errorLog('模板名称不合法')
    return
  }

  const switchProcess = spawn(switchMasterCommand(main), {
    stdio: 'inherit',
    shell: true,
  })

  switchProcess.on('close', (switchCode) => {
    if (switchCode !== 0) {
      errorLog('切换主分支分支失败')
      return
    }

    successLog('🎉 切换主分支分支成功')
    const pullProcess = spawn(pullMasterCommand, {
      stdio: 'inherit',
      shell: true,
    })

    const spinner = ora('拉取主分支代码中...').start()

    pullProcess.on('close', async (pullCode) => {
      if (pullCode !== 0) {
        errorLog('拉取主分支代码失败')
        spinner.stop()
        return
      }
      spinner.stop()

      successLog('🎉 拉取主分支代码成功')

      const packageVersion = await getPackageVersion()
      if (!packageVersion)
        return

      const { branch: name, newVersion } = await prompts(genQuestionByVersion(packageVersion))

      // 用户强制退出的情况
      if (name === undefined || newVersion === undefined)
        return

      let version = newVersion
      if (newVersion === 'custom') {
        const { customVersion } = await prompts(customQuestion)
        if (customVersion === undefined)
          return
        version = customVersion
      }

      // release 只有两个变量 name、version
      const branchName = replaceVariables(template, { name, version })

      spawn(checkoutCommand(branchName), {
        stdio: 'inherit',
        shell: true,
      }).on('close', (checkoutCode) => {
        if (checkoutCode !== 0) {
          errorLog('创建分支失败')
          return
        }
        successLog('🎉 分支切换成功')
      })
    })
  })
}
