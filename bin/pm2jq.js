#!/usr/bin/env node
var program = require('commander');
//const version = require('../package.json').version;
var pm2 = require('pm2');

pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }
    //console.log("pm2 连接成功")
    initCmd()
})


function initCmd() {
    program.command('start')
        .description('开启项目')
        .option('-n, --appName <string>', '服务名')
        .option('-c, --cwd <path>', '运行路径', './')
        .option('-s, --script <file>', '运行文件', 'app.js')
        .option('-i, --instances <num>', '实例数量', 1)
        .option('-a, --args <num>', '开启的额外参数', '')
        .action(start);

    program.command('list')
        .description('获取进程列表')
        .action(list)

    program.command('stop')
        .description('结束进程')
        .option('-n, --appName <string>', '服务名')
        .option('-br, --beforeRunCmd <string>', '关服前操作')
        .action(stop);

    program.command('restart')
        .description('重启进程')
        .option('-n, --appName <string>', '服务名')
        .option('-br, --beforeRunCmd <string>', '关服前操作')
        .action(restart);
    program.command('delete')
        .description('删除进程')
        .option('-n, --appName <string>', '服务名')
        .option('-br, --beforeRunCmd <string>', '关服前操作')
        .action(remove);

    program.parse(process.argv);

}



function start(opt) {
    var appData = {
        name: opt.appName || opt.script,
        cwd: opt.cwd,
        script: opt.script,
        args: opt.args,

        instances: opt.instances,
        minUptime: "20s",
        maxMemoryRestart: '3G',
        mergeLogs: true,
        watch: false,

        logDateFormat: "YYYY-MM-DD HH:mm Z",
        errorFile: opt.cwd + '/' + opt.appName + ".stderr.log",
        outFile: opt.cwd + '/' + opt.appName + ".stdout.log",

        //exec_interpreter: "node",
        //autorestart: true,
        //max_restarts:5,
        //restart_delay:2000,//秒
    }
    pm2.start(appData, function (err) {
        if (err) {
            console.log('error')
        } else {
            console.log('ok')
        }
        process.exit(0);
    })
}

function stop(opt) {
    pm2.stop(opt['appName'], function (err, proc) {
        if (err) {
            console.log('error')
        } else {
            console.log('ok')
        }
        process.exit(0);
    })
}

function restart(opt) {
    pm2.restart(opt['appName'], function (err, proc) {
        if (err) {
            console.log('error')
        } else {
            console.log('ok')
        }
        process.exit(0);
    })
}

function remove(opt) {
    pm2.delete(opt['appName'], function (err, proc) {
        if (err) {
            console.log('error')
        } else {
            console.log('ok')
        }
        process.exit(0);
    })
}

function list(opt) {
    pm2.list(function (err, list) {
        var tDataList = [];
        list = list || []
        list.forEach(function (appData) {
            tDataList.push({
                pid: appData.pid,
                name: appData.name,
                memory: appData.monit.memory,//byte
                cpu: appData.monit.cpu,
                restartCnt: appData.pm2_env.restart_time,
                execMode: appData.pm2_env.exec_mode,//执行模式
                createdTime: appData.pm2_env.created_at,//创建时间
                status: appData.pm2_env.status//状态
            })
        })
        console.log(JSON.stringify(tDataList))
        process.exit(0);
    })
}