// 加载express
var express = require('express'); // call express
var app = express(); // 获得express定义的app，app对象此时代表整个web应用
bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var db = require('./db');
console.log(typeof (db));
var bt = require('./models/bs_template')(db, Sequelize);
var ba = require('./models/bs_appkey')(db, Sequelize);
var bc = require('./models/bs_city')(db, Sequelize);
// 给app配置bodyParser中间件
// 通过如下配置再路由种处理request时，可以直接获得post请求的body部分
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.use(function checkAppKey(req, res, next) {
    header = req.headers;
    console.log(header)
    appkey = header.authorization;
    console.log(appkey);
    let secret_key = '';
    ba.findOne({
        raw: true,
        attributes: ['secret_key'],
        where: {
            'appkey': appkey
        }
    }).then(result => {
        console.log(result);
        if (result == null) {
            console.log("check not valid appkey ", appkey);
            res_data = {
                status: "error",
                data: [],
                message: 'not valid appkey'
            };
            sign_data = sign(res_data);
            res.json(sign_data);
            return;
        } else {
            req.secret_key = result.secret_key;
            console.log(req.headers);
            console.log("go to next")
            next();
        }
    })
});
app.use(function checkCity(req, res, next) {
    let area = '';
    console.log(req.url);
    console.log(req.query);
    console.log(req.body);
    console.log(req.method, req.params.area);
    if (req.method == 'GET'){ 
        console.log(req.url.split('/')); 
        area = req.url.split('/')[3];
               console.log(area);
               
        area= decodeURI(area) ;
        console.log(area);
    }
    else if (req.method == 'POST') {
        const t = req.body;
        console.log("t", t)
        console.log(area);
area = t.area;
    }
    else{
        next();
        return;
    }
    bc.findOne({
        raw: true,
        attributes: ['id'],
        where: {
            'name': area
        }
    }).then(result => {
        console.log(result)
        if (result == null) {
            console.log("no city code", area)
            res_data = {
                status: "error",
                data: [],
                message: 'not city code'
            };
            sign_data = sign(res_data);
            res.json(sign_data);
            return;
        } else {
            req.cityID = result.id;
            console.log("get city code:", area, req.cityID);
            next();
        }
    })
});

var port = process.env.PORT || 8080; // set our port
function sign(json_data, secret_key) {
    json_tmp =Object.assign({}, json_data);
    json_data['secret_key'] = secret_key;
    var crypto = require('crypto');
    var md5 = crypto.createHash("md5");
    var d = JSON.stringify(json_data)
    md5.update(d);
    var str = md5.digest('hex');
    //var s = str.toUpperCase(); //32位大写

    json_tmp['sign'] = str;
    return json_tmp;
    console.log(str);

}
// API路由配置
// =============================================================================
var router = express.Router(); // 获得express router对象
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
router.post('/template', function (req, res) {
    const t = req.body;
    secret_key = req.secret_key;
    cityID = req.cityID;
    t.id = cityID + t.id
    bt.create(t).then(tm => {
        console.log(tm.id);
        res_json = {
            status: 'ok',
            data: [tm.id]
        }
        sign_data = sign(res_json, secret_key);
        res.json(sign_data);
    }).catch(e => res.json(sign({
        status: "error",
        data: [],
        message: e.name
    }, secret_key)))
})
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
router.get('/template/:area', function (req, res, next) {
    console.log(req.params.area);
    console.log(req.headers);
    secret_key = req.secret_key;
    console.log('secret key', secret_key);
    bt.findAll({
        raw: true,
        attributes: ['id', 'area', 'template_style', 'template_pos', [Sequelize.fn('date_format', Sequelize.col('start_time'), '%Y-%m-%d %H:%i:%s'), 'start_time'],
            [Sequelize.fn('date_format', Sequelize.col('end_time'), '%Y-%m-%d %H:%i:%s'), 'end_time'], 'status'
        ],
        order: ['status'],
        where: {
            'area': req.params.area
        }
    }).then(result => {
        //let d = result.join("&");
        console.log(result[0].start_time)
        console.log(typeof (result));
        console.log(result);
        let d = JSON.stringify(result);
        console.log(d)
        sign_json = {
            status: 'ok',
            data: result
        }
        s = sign(sign_json, secret_key);
        res.json(s);
    }).catch(e => {
        console.log(e);
        res.json(sign({
            status: "error",
            data: [],
            message: e.name
        }, secret_key))
    })
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
router.get('/template/:area/:templateID', function (req, res) {
    console.log(req.params);
    secret_key = req.secret_key;

    cityID = req.cityID;
    bt.findOne({
        raw: true,
        attributes: ['id', 'area', 'template_style', 'template_pos',  [Sequelize.fn('date_format', Sequelize.col('start_time'), '%Y-%m-%d %H:%i:%s'), 'start_time'],
        [Sequelize.fn('date_format', Sequelize.col('end_time'), '%Y-%m-%d %H:%i:%s'), 'end_time'], 'status'],
        order: ['status'],
        where: {
            'id': [cityID+req.params.templateID],
            'area': req.params.area
        }
    }).then(result => {
        res_json = {
            status: 'ok',
            data: [result]
        }
        sign_data = sign(res_json, secret_key);
        console.log(sign_data);
        res.json(sign_data);
    }).catch(e => {
        console.log(e);
        res.json(sign({
        status: "error",
        data: [],
        message: e.name
    }, secret_key))})
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
router.get('/appkey/:appkey', function (req, res) {
    ba.findOne({
        raw: true,
        attributes: ['id', 'area', 'appkey', 'status'],
        order: ['status'],
        where: {
            'appkey': req.params.appkey
        }
    }).then(result => {
        res_json = {
            status: 'ok',
            data: result
        }
        res.json(res_json);
    }).catch(e => res.json({
        status: "error",
        message: e.name
    }))

});


// 注册路由
// 所有的路由会加上“／api”前缀
app.use('/api', router);

// 启动server
// =============================================================================
//开始监听端口
app.listen(port);
console.log('Magic happens on port ' + port);