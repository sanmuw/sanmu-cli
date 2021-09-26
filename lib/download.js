const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

module.exports = function(target){
    target = path.join(target || '.', '.download-temp');
    return new Promise((res,rej) => {
        
    })
}