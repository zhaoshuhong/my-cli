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

program.version('1.0.0', '-v, --version')
    .command('init <name>')
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
                const spinner = ora('正在下载模板...');
                spinner.start();
                // download('zhaoshuhong/home-template', name, (err) => { github
                if(answers.type == 'gulp+项目' || answers.type == 'gulp'){
                    download(`direct:${config.tpl.gulp.url}`, name, {clone: true}, (err) => {
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
                            }
                            if (fs.existsSync(fileName)) {
                                const content = fs.readFileSync(fileName).toString();
                                const result = handlebars.compile(content)(meta);
                                fs.writeFileSync(fileName, result);
                            }
                            console.log(symbols.success, chalk.green('gulp安装'));
                            if(answers.type == 'gulp+项目'){
                                gitPull()
                            }
                           console.log(`\n cd ${name} && npm install 安装gulp依赖\n`)
                        }
                    })
                }else{
                    gitPull()
                }

            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
function gitPull(){
    // git命令，远程拉取项目并自定义项目名
    console.log('开始拉取项目 git >>>>>> ')
    let cmdStr = `cd ${name} && git clone ${config.tpl.mcrm.url} && checkout ${config.tpl.branch}`
    exec(cmdStr, (error, stdout, stderr) => {
        if (error) {
            console.log('错误---', error)
            process.exit()
        }
        console.log(chalk.green('\n √ Generation completed!'))
        process.exit()
    })
}
program.parse(process.argv);
