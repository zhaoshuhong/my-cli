#!/usr/bin/env node
/**
 * Created by 24596 on 2019/8/9.
 */
console.log('cli entry index');

const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const exec = require('child_process').exec;
const config = require('./config.json');

let branchM = config.tpl.pro;

let spinner = ora('正在下载模板...');

function getName(url) {
    url = url || '';
    if (url) {
        let n = url;
        n = n.split('/');
        n = n[n.length - 1].split('.')[0];
        return n;
    }

}

function getGit(name) {
    spinner = ora('正在从git拉取代码...');
    spinner.start();
    let cmdStr = `cd ${name} `;
    for (let item in branchM) {
        let url = getName(branchM[item].url);
        cmdStr += `&& git clone ${branchM[item].url} && cd ${url} && git checkout ${branchM[item].branch} && cd ../ `
    }
    exec(cmdStr, (error, stdout, stderr) => {
        if (error) {
            spinner.fail();
            console.log('错误---', error);
            process.exit()
        }
        spinner.succeed();
        console.log(chalk.green('\n √ Generation completed!'));
        console.log(`\n cd ${name} && npm gulp -g && npm install 安装gulp依赖\n`);
        process.exit()
    })
}

program.usage('<command> [option]', 'option --type required');
program.version(require('./package.json').version, '-v, --version')
    .command('init <name>')
    .alias('i')
    .description('mcrm-utl-cli:创建文件拉取模板')
    //resume的子命令
    .option("-n, --name <mode>", "测试1111")
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer.prompt([
                {
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                },
                {
                    type: 'list',
                    message: '请选择一种安装:',
                    name: 'type',
                    choices: [
                        "gulp+项目",
                        "只安装gulp",
                        "只拉取文件"
                    ],
                    // filter: function (val) { // 使用filter将回答变为小写
                    //     return val.toLowerCase();
                    // }
                }
            ]).then((answers) => {

                if (answers.type == 'gulp+项目' || answers.type == '只安装gulp') {
                    spinner = ora('正在下载模板...');
                    spinner.start();
                    // download('zhaoshuhong/home-template', name, (err) => { github
                    download(`direct:${config.tpl.tools.gulp.url}`, name, {clone: true}, (err) => {
                        if (err) {
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            spinner.succeed();
                            const fileName = `${name}/package.json`;
                            const meta = {
                                name,
                                description: answers.description,
                                author: answers.author
                            };
                            if (fs.existsSync(fileName)) {
                                const content = fs.readFileSync(fileName).toString();
                                const result = handlebars.compile(content)(meta);
                                fs.writeFileSync(fileName, result);
                            }
                            console.log(symbols.success, chalk.green('gulp安装成功'));
                            // git命令，远程拉取项目并自定义项目名
                            if (answers.type == 'gulp+项目') {
                                getGit(name)
                            } else {
                                console.log(`\n cd ${name} && npm install 安装gulp依赖\n`)
                            }
                        }
                    })
                } else {
                    // console.log('创建文件')
                    // fs.writeFileSync('README.md','test');   //先写入一个空的文件 创建目录 name
                    // console.log('创建文件end')
                    fs.mkdir(name, function (err) {
                        if (err) {
                            console.log("mkdir err:", err);
                            return;
                        }
                        console.log("mkdir create success");
                        getGit(name)
                    })
                }

            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    });
program.command('creat <name>')
    .description('从git仓库拉取代码')
    .option("-c, --config", "从配置文件中拉取")
    .option("-a, --auto", "自动配置")
    .action((name, options) => {
        console.log('creat ok', options.name());

        var isWatch = options.name ? true : false;
        console.log('iswatch', isWatch)
    });
program.parse(process.argv);
