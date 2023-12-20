import type { IGlobalVariables } from '@/types'

export function validateTemplate(str: string): boolean {
  // 定义模板正则表达式
  const templateRegex = /^([^%]*%[^%]*%[^%]*)*$|^([^%]*)$/

  return templateRegex.test(str)
}

export function replaceVariables(str: string, variables: IGlobalVariables & Record<string, string>) {
  return str.replace(/%([^%]+)%/g, (match, variableName: string) => {
    return variables.hasOwnProperty(variableName) ? variables[variableName] : match
  })
}
