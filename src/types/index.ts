export interface ICommandConfig {
  action: (...args: any[]) => void | Promise<void>
  name: string
  description: string
  argument?: [string, string]
  options?: IOption[]
}

interface IOption {
  flags: string
  description?: string
  defaultValue?: string
}

export interface IGlobalVariables {
  name: string
  version?: string
  time?: string
  type?: string
}
