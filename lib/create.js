const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const Creator = require('./Creator')
const { stopSpinner } = require('../utils/index')


async function create(projectName, options) {
    // 创建目录
    const cwd = process.cwd()

    const inCurrent = projectName === '.'
    const name = inCurrent ? path.relative('../', cwd) : projectName
    const targetDir = path.resolve(cwd, projectName || '.')

    if (fs.existsSync(targetDir) && options.merge) {
        if (options.force) {
            await fs.rm(targetDir)
        } else {
            if (inCurrent) {
                const { ok } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'ok',
                        message: '是否在当前路径创建项目？',
                    },
                ])
                if (!ok) {
                    return
                }
            } else {
                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: `项目路径 ${chalk.cyan(
                            targetDir
                        )} 已经存在，请做出你的选择: `,
                        choices: [
                            { name: '覆盖', value: 'overwrite' },
                            { name: '合并', value: 'merge' },
                            { name: '取消', value: 'cancel' },
                        ],
                    },
                ])
                if (!action) {
                    return
                } else if (action === 'overwrite') {
                    console.log(`\n 删除 ${targetDir}...`)
                    await fs.rm(targetDir)
                }
            }
        }
    }
    Creator.init(name, targetDir)
}

module.exports = (...args) => {
    return create(...args).catch(() => {
        stopSpinner(false)
        process.exit(1)
    })
}