## 安装
可通过 `npm`、`yarn` 或 `pnpm` 安装

```bash
npm i -D pv-script
yarn add -D pv-script
pnpm add -D pv-script
```

推荐在 package.json 中使用 pv-script，例如
```json
{
  "scripts": {
    ...
    "checkout:develop": "pv-script develop",
    "checkout:release": "pv-script release",
    "version": "pv-script version"
  }
}
```
> 上面命令可能对你现在的项目配置不太匹配，例如 pv-script 默认切的主分支是 master，但也可以通过传入配置改变这个默认值

## 使用
pv-script 目前有三个 command，分别是 **develop、release、version**。可通过 `pv-script -h` 查看详细信息。

### develop

执行 develop 会进行以下操作
- 切换到“主分支”
- 拉取“主分支”代码
- 生成“开发分支”，并切换

在 pv-script 默认切换的主分支是 master，如果你的项目主分支是 main，那么可以在使用 pv-script 命令时传入 “-m main”。例如 `pv-script develop -m main`

默认生成的开发分支的模板是 `%type%/%time%-%name%`，这个模板最后生成的分支名为 `命令行中选择的开发分支类型/当前时间-命令行中输入的分支名`。那也就是说我们可以自由组合分支名的模板，通过 -t 即可指定。例如`%time%/%type%/%name%`，最后生成的分支名为`当前时间/命令行中选择的开发分支类型/命令行中输入的分支名`

> develop 目前只支持三个模板变量
> %time% 当前时间: 年-月-日
> %type% 开发分支类型：feature/hotfix
> %name% 输入的分支名

### release

执行 release 会进行以下操作
- 切换到“主分支”
- 拉取“主分支”代码
- 生成“发布分支”，并切换

在 pv-script 默认切换的主分支是 master，如果你的项目主分支是 main，那么可以在使用 pv-script 命令时传入 “-m main”。例如 `pv-script release -m main`

默认生成的发布分支的模板是 `release/%version%-%name%`，这个模板最后生成的分支名为 `release/命令行中选择的版本-命令行中输入的分支名`。那也就是说我们可以自由组合分支名的模板，通过 -t 即可指定。例如`%version%/%name%`，最后生成的分支名为`命令行中选择的版本/命令行中输入的分支名`

> release 目前只支持二个模板变量
> %version% 命令行中选择的版本，可以选择 patch、minor、major 三个版本级别的更新，也可以自定义版本
> %name% 输入的分支名

### version
执行 version 会进行以下操作
- 获取当前的分支名，解析其中的版本号，如果没有版本号，那么会执行失败
- 修改 package.json 的 version 字段
  