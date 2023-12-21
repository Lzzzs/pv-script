import { execSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs'
import path from 'node:path'
import { log } from 'node:console'
import chalk from 'chalk'

const packageJsonPath = path.join(path.resolve(), 'package.json')

export default function versionAction() {
  try {
    const version = getCurrentBranchVersion()
    version && updatePackageVersion(version)
  }
  catch (error: any) {
    log(chalk.red(`版本更新失败: ${error.message}`))
  }
}

function getCurrentBranchVersion() {
  try {
    const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    const version = branchName.match(/(\d+\.\d+\.\d+)/)

    if (version && version.length > 0) {
      return version[0]
    }
    else {
      log(chalk.bgRedBright('分支名不符合规范，无法推断版本'))
      return null
    }
  }
  catch (error: any) {
    console.error('Error getting Git branch:', error.message)
    return null
  }
}

function updatePackageVersion(version: string) {
  readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading package.json:', err)
      return
    }

    try {
      const packageJson = JSON.parse(data)

      packageJson.version = version

      // 将修改后的内容写回package.json
      writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
        if (err)
          console.error('Error writing package.json:', err)
      })
      log(chalk.greenBright('🎉 版本更新成功'))
    }
    catch (jsonError) {
      console.error('Error parsing package.json:', jsonError)
      throw jsonError
    }
  })
}
