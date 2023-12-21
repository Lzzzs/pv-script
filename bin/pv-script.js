import { Command } from 'commander';
import { log } from 'node:console';
import { spawn, execSync } from 'node:child_process';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readFile as readFile$1, writeFile } from 'node:fs';

function getCurrentTime() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = padZero(currentDate.getMonth() + 1);
    const currentDay = padZero(currentDate.getDate());
    return `${currentYear}-${currentMonth}-${currentDay}`;
}
function padZero(number) {
    return number < 10 ? `0${number}` : number;
}

function validateTemplate(str) {
    // 定义模板正则表达式
    const templateRegex = /^([^%]*%[^%]*%[^%]*)*$|^([^%]*)$/;
    return templateRegex.test(str);
}
function replaceVariables(str, variables) {
    return str.replace(/%([^%]+)%/g, (match, variableName) => {
        return variables.hasOwnProperty(variableName) ? variables[variableName] : match;
    });
}

const switchMasterCommand = (main) => `git switch ${main}`;
const pullMasterCommand = 'git pull';
const checkoutCommand = (branchName) => `git checkout -b ${branchName}`;

const questions = [
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
];
async function developAction(options) {
    const { template, main } = options;
    if (!validateTemplate(template)) {
        log(chalk.bgRedBright('模板名称不合法'));
        return;
    }
    const { type, branch: name } = await prompts(questions);
    // 用户强制退出的情况
    if (type === undefined || name === undefined)
        return;
    // develop 只有三个变量 type、name、time
    const branchName = replaceVariables(template, { type, name, time: getCurrentTime() });
    const switchProcess = spawn(switchMasterCommand(main), {
        stdio: 'inherit',
        shell: true,
    });
    switchProcess.on('close', (switchCode) => {
        if (switchCode !== 0) {
            log(chalk.bgRedBright('切换主分支分支失败'));
            return;
        }
        log(chalk.green('🎉 切换主分支分支成功'));
        const pullProcess = spawn(pullMasterCommand, {
            stdio: 'inherit',
            shell: true,
        });
        const spinner = ora('拉取主分支代码中...').start();
        pullProcess.on('close', (pullCode) => {
            if (pullCode !== 0) {
                log(chalk.bgRedBright('拉取主分支代码失败'));
                spinner.stop();
                return;
            }
            spinner.stop();
            log(chalk.green('🎉 拉取主分支代码成功'));
            spawn(checkoutCommand(branchName), {
                stdio: 'inherit',
                shell: true,
            }).on('close', (checkoutCode) => {
                if (checkoutCode !== 0) {
                    log(chalk.bgRedBright('创建分支失败'));
                    return;
                }
                log(chalk.green('🎉 分支切换成功'));
            });
        });
    });
}

const DEFAULT_MAIN_BRANCH = 'master';
const DEFAULT_RELEASE_BRANCH = 'release/%version%-%name%';
const DEFAULT_DEVELOP_BRANCH = '%type%/%time%-%name%';

function createDevelopCommand() {
    return {
        name: 'develop',
        description: `switching of develop branches. default template: ${DEFAULT_DEVELOP_BRANCH}. default main branch: ${DEFAULT_MAIN_BRANCH}`,
        action: developAction,
        options: [
            {
                flags: '-t, --template <template>',
                description: 'set template name',
                defaultValue: DEFAULT_DEVELOP_BRANCH,
            },
            {
                flags: '-m, --main <branch>',
                description: 'set main branch name',
                defaultValue: DEFAULT_MAIN_BRANCH,
            },
        ],
    };
}

var name = "pv-script";
var version = "0.0.3";
var description = "A project git/version script";

/**
 * 读取 package.json
 */
async function getPackageVersion() {
    const packageJsonPath = path.join(path.resolve(), 'package.json');
    try {
        const data = await readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(data);
        return packageJson.version;
    }
    catch (err) {
        log(chalk.red(`读取 package.json 文件时出错: ${err.message}`));
    }
}

const customQuestion = [
    {
        type: 'text',
        name: 'customVersion',
        message: '请输入自定义版本',
        validate: (value) => {
            const pattern = /^\d+(?:\.\d+){2}$/;
            return pattern.test(value) ? true : '版本规则不正确';
        },
    },
];
function genQuestionByVersion(version) {
    const curVersion = version.split('.').map(item => Number(item));
    const patchVersion = `${curVersion[0]}.${curVersion[1]}.${curVersion[2] + 1}`;
    const minorVersion = `${curVersion[0]}.${curVersion[1] + 1}.0`;
    const majorVersion = `${curVersion[0] + 1}.0.0`;
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
    ];
}
async function releaseAction(options) {
    const { template, main } = options;
    if (!validateTemplate(template)) {
        log(chalk.bgRedBright('模板名称不合法'));
        return;
    }
    const switchProcess = spawn(switchMasterCommand(main), {
        stdio: 'inherit',
        shell: true,
    });
    switchProcess.on('close', (switchCode) => {
        if (switchCode !== 0) {
            log(chalk.bgRedBright('切换主分支分支失败'));
            return;
        }
        log(chalk.green('🎉 切换主分支分支成功'));
        const pullProcess = spawn(pullMasterCommand, {
            stdio: 'inherit',
            shell: true,
        });
        const spinner = ora('拉取主分支代码中...').start();
        pullProcess.on('close', async (pullCode) => {
            if (pullCode !== 0) {
                log(chalk.bgRedBright('拉取主分支代码失败'));
                spinner.stop();
                return;
            }
            spinner.stop();
            log(chalk.green('🎉 拉取主分支代码成功'));
            const packageVersion = await getPackageVersion();
            if (!packageVersion)
                return;
            const { branch: name, newVersion } = await prompts(genQuestionByVersion(packageVersion));
            // 用户强制退出的情况
            if (name === undefined || newVersion === undefined)
                return;
            let version = newVersion;
            if (newVersion === 'custom') {
                const { customVersion } = await prompts(customQuestion);
                if (customVersion === undefined)
                    return;
                version = customVersion;
            }
            // release 只有两个变量 name、version
            const branchName = replaceVariables(template, { name, version });
            spawn(checkoutCommand(branchName), {
                stdio: 'inherit',
                shell: true,
            }).on('close', (checkoutCode) => {
                if (checkoutCode !== 0) {
                    log(chalk.bgRedBright('创建分支失败'));
                    return;
                }
                log(chalk.green('🎉 分支切换成功'));
            });
        });
    });
}

function createReleaseCommand() {
    return {
        name: 'release',
        description: `switching of release branches. default template: ${DEFAULT_RELEASE_BRANCH}. default main branch: ${DEFAULT_MAIN_BRANCH}`,
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
    };
}

const packageJsonPath = path.join(path.resolve(), 'package.json');
function versionAction() {
    try {
        const version = getCurrentBranchVersion();
        version && updatePackageVersion(version);
    }
    catch (error) {
        log(chalk.red(`版本更新失败: ${error.message}`));
    }
}
function getCurrentBranchVersion() {
    try {
        const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        const version = branchName.match(/(\d+\.\d+\.\d+)/);
        if (version && version.length > 0) {
            return version[0];
        }
        else {
            log(chalk.bgRedBright('分支名不符合规范，无法推断版本'));
            return null;
        }
    }
    catch (error) {
        console.error('Error getting Git branch:', error.message);
        return null;
    }
}
function updatePackageVersion(version) {
    readFile$1(packageJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading package.json:', err);
            return;
        }
        try {
            const packageJson = JSON.parse(data);
            packageJson.version = version;
            // 将修改后的内容写回package.json
            writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
                if (err)
                    console.error('Error writing package.json:', err);
            });
            log(chalk.greenBright('🎉 版本更新成功'));
        }
        catch (jsonError) {
            console.error('Error parsing package.json:', jsonError);
            throw jsonError;
        }
    });
}

function createVersionCommand() {
    return {
        name: 'version',
        description: 'update package version',
        action: versionAction,
    };
}

var createCommandFunctions = [
    createDevelopCommand,
    createReleaseCommand,
    createVersionCommand,
];

function registerCommand (program) {
    createCommandFunctions.forEach((fn) => {
        const { name, description, action, options } = fn();
        const command = program.command(name).description(description).action(action);
        options?.forEach(({ flags, description, defaultValue }) => {
            command.option(flags, description, defaultValue);
        });
    });
}

const program = new Command();
program
    .name(name)
    .description(description)
    .version(version);
registerCommand(program);
program.parse();
