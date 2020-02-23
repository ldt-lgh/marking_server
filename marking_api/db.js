var Sequelize = require('sequelize')

module.exports = new Sequelize('marking', 'lgh','lghzlh',{
    'host':'172.17.0.1',
    'dialect':'mysql',
    //'dateStrings' : true ,////解决时间格式
    timezone: '+08:00'
});

 
