import { execSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs'
import path from 'node:path'
import { errorLog, successLog } from '@/utils/LogUtil'

const packageJsonPath = path.join(path.resolve(), 'package.json')

export default function versionAction() {
  try {
    const version = getCurrentBranchVersion()
    version && updatePackageVersion(version)
  }
  catch (error: any) {
    errorLog(`版本更新失败: ${error.message}`)
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
      errorLog('分支名不符合规范，无法推断版本')
      return null
    }
  }
  catch (error: any) {
    errorLog('无法获取 git 分支信息')
    return null
  }
}

function updatePackageVersion(version: string) {
  readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      errorLog('读取 package.json 错误')
      return
    }

    try {
      const packageJson = JSON.parse(data)

      packageJson.version = version

      // 将修改后的内容写回package.json
      writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
        if (err)
          errorLog('写入 package.json 错误')
      })
      successLog('🎉 版本更新成功')
    }
    catch (jsonError) {
      errorLog('解析 package.json 错误')
      throw jsonError
    }
  })
}
