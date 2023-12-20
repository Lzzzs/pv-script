export const switchMasterCommand = (main: string) => `git switch ${main}`

export const pullMasterCommand = 'git pull'

export const checkoutCommand = (branchName: string) => `git checkout -b ${branchName}`
