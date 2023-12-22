import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { errorLog } from './LogUtil'

/**
 * 读取 package.json
 */
export async function getPackageVersion() {
  const packageJsonPath = path.join(path.resolve(), 'package.json')

  try {
    const data = await readFile(packageJsonPath, 'utf8')

    const packageJson = JSON.parse(data)

    return packageJson.version
  }
  catch (err: any) {
    errorLog(`读取 package.json 文件时出错: ${err.message}`)
  }
}

export { bin, version, name, description } from '../../package.json'
