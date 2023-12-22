import { spawn } from 'node:child_process'
import prompts from 'prompts'
import type { PromptObject } from 'prompts'
import ora from 'ora'
import type { IDevelopOptions } from '.'
import { getCurrentTime } from '@/utils/DateUtil'
import { replaceVariables, validateTemplate } from '@/utils/OptionUtil'
import { checkoutCommand, pullMasterCommand, switchMasterCommand } from '@/utils/CommandUtil'
import { errorLog, successLog } from '@/utils/LogUtil'

const questions: PromptObject[] = [
  {
    type: 'select',
    name: 'type',
    message: '请选择要切换的类型分支',
    choices: [
      { title: 'feature', description: '功能分支', value: 'feature' },
      { title: 'hotfix', description: '修复分支', value: 'hotfix' },
    ],
  },
  {
    type: 'text',
    name: 'branch',
    message: '请填写分支名称',
    validate: value => value.length > 0 ? true : '分支名称不能为空',
  },
]

export default async function developAction(options: IDevelopOptions) {
  const { template, main } = options

  if (!validateTemplate(template)) {
    errorLog('模板名称不合法')
    return
  }

  const { type, branch: name } = await prompts(questions)

  // 用户强制退出的情况
  if (type === undefined || name === undefined)
    return

  // develop 只有三个变量 type、name、time
  const branchName = replaceVariables(template, { type, name, time: getCurrentTime() })

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

    pullProcess.on('close', (pullCode) => {
      if (pullCode !== 0) {
        errorLog('拉取主分支代码失败')
        spinner.stop()
        return
      }
      spinner.stop()

      successLog('🎉 拉取主分支代码成功')
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
