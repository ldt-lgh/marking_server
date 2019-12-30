// 加载express
var express    = require('express');        // call express
var app        = express();                 // 获得express定义的app，app对象此时代表整个web应用
bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var db = require('./db');
console.log(typeof(db));
var bt = require('./models/bs_template')(db, Sequelize);
var ba = require('./models/bs_appkey')(db, Sequelize);
// 给app配置bodyParser中间件
// 通过如下配置再路由种处理request时，可以直接获得post请求的body部分
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public',express.static('public'));

var port = process.env.PORT || 8080;        // set our port

// API路由配置
// =============================================================================
var router = express.Router();              // 获得express router对象
// 用get动词访问 http://localhost:8080/api
/**
 * 上传模板
 * @api {POST} /api/template/ 上传模板
 * @apiDescription 客户端上传模板
 * @apiName postTemplate
 * @apiParam (path参数) {string} area
 * @apiParam (path参数) {string} style
 * @apiParam (path参数) {number} pos
 * @apiSampleRequest /api/template
 * @apiGroup marking
 * @apiVersion 1.0.0
 */
router.post('/template', function(req, res) {
    const t = req.body;
    console.log(t)
    bt.create(t).then(tm=>{
        console.log(tm);
        res.end('succ');});
});
/**
 * 获取模板列表
 * @api {GET} /api/template 获得模板列表
 * @apiDescription 获得模板列表
 * @apiName getTemplate
 * @apiParam (path参数) {string} area
 * @apiSampleRequest /api/template/长沙
 * @apiGroup marking
 * @apiVersion 1.0.0
 */
router.get('/template/:area', function(req, res) {
    console.log(req.params.area);
    bt.findAll({
        raw:true,
        attributes:['id', 'area', 'template_style', 'template_pos', 'start_time','end_time','status'],
        order:['status'],
        where:{'area':req.params.area}
    }).then(result=>{
        res_json = {status:'ok', data:result}
        res.json(res_json);
    }).catch(e=>res.json({status:"error", message:e }))
    
});
/**
 * 根据templateid 获取模板信息
 * @api {GET} /api/template/:id 获得指定模板信息
 * @apiDescription 根据templateid获取模板信息
 * @apiName template
 * @apiParam (path参数) {number} id
 * @apiSampleRequest /api/template/1
 * @apiGroup marking
 * @apiVersion 1.0.0
 */
router.get('/template/:templateID', function(req, res) {
    console.log(req.params);
    bt.findOne({
        raw:true,
        attributes:['id', 'area', 'template_style', 'template_pos', 'start_time','end_time','status'],
        order:['status'],
        where:{'id':[req.params.templateID]}
    }).then(result=>{
        res_json = {status:'ok', data:result}
        res.json(res_json);
    }).catch(e=>res.json({status:"error", message:e }))
    
});
/**
 * 获取指定APPKEY 
 * @api {GET} /api/appkey/:appkey 获取指定appkey信息
 * @apiDescription 客户端根据接口返回信息判断是否是有效appkey
 * @apiName appkey
 * @apiParam (path参数) {string} appkey
 * @apiSampleRequest /api/appkey/5a45cefd080d7c39a036ca55
 * @apiGroup marking
 * @apiVersion 1.0.0
 */
router.get('/appkey/:appkey', function(req, res) {
    ba.findOne({
        raw:true,
        attributes:['id', 'area', 'appkey', 'status'],
        order:['status'],
        where:{'appkey':req.params.appkey}
    }).then(result=>{
        res_json = {status:'ok', data:result}
        res.json(res_json);
    }).catch(e=>res.json({status:"error", message:e }))
    
});


// 注册路由
// 所有的路由会加上“／api”前缀
app.use('/api', router);

// 启动server
// =============================================================================
//开始监听端口
app.listen(port);
console.log('Magic happens on port ' + port);