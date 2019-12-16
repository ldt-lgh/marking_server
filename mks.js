let Service = require('node-windows').Service;

let svc = new Service({
   name: 'marking_service',    //服务名称
   description: 'marking service server', //描述
   script: './index.js' //nodejs项目要启动的文件路径
});

svc.on('install', () => {
   svc.start();
});
svc.install();