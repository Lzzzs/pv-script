import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { log } from 'console';
import { spawn } from 'child_process';

var name = "pv-script";
var version = "0.0.0";
var description = "A project git/version script";

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
            log(chalk.bgRedBright('切换 master 分支失败'));
            return;
        }
        log(chalk.green('🎉 切换 master 分支成功'));
        const pullProcess = spawn(pullMasterCommand, {
            stdio: 'inherit',
            shell: true,
        });
        pullProcess.on('close', (pullCode) => {
            if (pullCode !== 0) {
                log(chalk.bgRedBright('拉取 master 代码失败'));
                return;
            }
            log(chalk.green('🎉 拉取 master 代码成功'));
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

function createDevelopCommand() {
    return {
        name: "develop",
        description: "develop",
        action: developAction,
        options: [
            {
                flags: "-t, --template <template>",
                description: "set template name",
                defaultValue: DEFAULT_RELEASE_BRANCH
            },
            {
                flags: "-m, --main <branch>",
                description: "set main branch name",
                defaultValue: DEFAULT_MAIN_BRANCH
            }
        ]
    };
}

var createCommandFunctions = [
    createDevelopCommand
];

function registerCommand (program) {
    createCommandFunctions.forEach(fn => {
        const { name, description, action, options } = fn();
        const command = program.command(name).description(description).action(action);
        options?.forEach(({ flags, description, defaultValue }) => {
            command.option(flags, description, defaultValue);
        });
    });
    program.command('test')
        .description('Split a string into substrings and display as an array')
        .argument('<string>', 'string to split')
        .option('--first', 'display just the first substring', () => {
        console.log(6);
    })
        .option('-s, --separator <char>', 'separator character', ',')
        .action((str, options) => {
        const limit = options.first ? 1 : undefined;
        console.log(str.split(options.separator, limit));
    });
}

const program = new Command();
program
    .name(name)
    .description(description)
    .version(version);
registerCommand(program);
program.parse();
