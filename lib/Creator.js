const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const cwd = process.cwd()

const PROMPTS = [
    {
        type: 'list',
        name: 'framework',
        message: '选择一个框架: ',
        choices: ['vue', 'react', 'svelte'],
    },
    {
        type: 'confirm',
        name: 'useTs',
        message: '是否使用TS',
        default: false,
    },
]

const renameFile = {
    _gitignore: '.gitignore',
    _babelrc: '.babelrc',
    _editorconfig: '.editorconfig'
}

async function init(projectName, targetDir) {
    const { framework, useTs } = await inquirer.prompt(PROMPTS)
    const root = targetDir
    const template = `${framework}${useTs ? '-ts' : ''}`

    console.log(`\n 在 ${root} 搭建项目中...`)
    const templateDir = path.join(__dirname, `./templates/${template}`)

    const write = (file, context) => {
        const targetPath = renameFile[file]
            ? path.join(root, renameFile[file])
            : path.join(root, file)

        if (context) {
            fs.writeFileSync(targetPath, context)
        } else {
            copy(path.join(templateDir, file), targetPath)
        }
    }

    // 将模板文件（除了package.json）都复制到新建项目目录
    const files = fs.readdirSync(templateDir)
    for (const file of files.filter((f) => f !== 'package.json')) {
        write(file)
    }

    const pkg = require(path.join(templateDir, 'package.json'))
    pkg.name = projectName
    write('package.json', JSON.stringify(pkg, null, 2))

    const pkgManager = 'npm'

    console.log(`\n 现在运行: \n`)
    if (root !== cwd) {
      console.log(`  cd ${path.relative(cwd, root)}`)
    }
    switch (pkgManager) {
      case 'yarn':
        console.log('  yarn')
        console.log('  yarn dev')
        break
      default:
        console.log(`  ${pkgManager} install`)
        console.log(`  ${pkgManager} run dev`)
        break
    }
    console.log()
}



function copy(src, dest) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        copyDir(src, dest)
    } else {
        fs.copyFileSync(src, dest)
    }
}
function copyDir(srcDir, destDir) {
    // 创建文件夹，采用递归的方式
    fs.mkdirSync(destDir, { recursive: true })
    // 将模板复制到项目路径
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file)
        const destFile = path.resolve(destDir, file)
        copy(srcFile, destFile)
    }
}

module.exports = {
    init: init,
}