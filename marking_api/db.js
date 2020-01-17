var Sequelize = require('sequelize')

module.exports = new Sequelize('demo', 'vm','123456',{
    'host':'192.168.1.20',
    'dialect':'mysql',
    'dateStrings' : true ,////解决时间格式
    timezone: '+08:00'
});

 
