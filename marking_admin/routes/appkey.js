const express = require('express');
const mysql = require('../core/mysql');
const perm = require('../core/permissions');
const router = express.Router();
const log = require('../core/logger').getLogger("system");
const moment = require('moment');
const common = require('../core/common');
const stringUtils = require('../core/util/StringUtils');
const _ = require('lodash');
var UUID = require('uuid');
/* GET appkey listing. */
router.get('/', async (req, res, next) => {
    let user = req.session.user;
    let menu_active = req.session.menu_active['/appkey'] || {};
    let permissions = await perm.getPermissions(req);
    res.render('appkey', {
        user: user,
        menus: req.session.menus,
        menu_active: menu_active,
        permissions: permissions,
        title: 'appkey管理'
    });
});
router.get('/load', async(req, res, next) => {
    try {
        var sqlcount = "select count(*) count from bs_appkey where is_del=0";
        var sql = "select * from bs_appkey where is_del=0";

        var s_area= req.query.s_area;

        if (s_area) {
            sqlcount = sqlcount + " and area like '%" + s_area.trim() + "%'";
            sql = sql + " and area like '%" + s_area.trim() + "%'";
        }
        var start = req.query.start;
        var length = req.query.length;
        var draw = req.query.draw;
        if (!start || !draw || !length) {
            res.status(401).json("invoke error!");
            return;
        }

        start = parseInt(start) || 0;
        length = parseInt(length) || 0;
        draw = parseInt(draw) || 0;
        log.info(sqlcount)
        var memuCount = await mysql.query(sqlcount);
        sql = sql + " ORDER BY id DESC limit " + start + "," + length;
        log.info(sql)
        var result = await mysql.query(sql);
        var backResult = {
            draw: draw,
            recordsTotal: memuCount['0']['count'],
            recordsFiltered: memuCount['0']['count'],
            data: []
        };
        for (var i in result) {
            backResult.data.push({
                id: result[i].id,
                area: result[i].area,
                appkey: result[i].appkey,
                secretkey:result[i].secret_key,
                create_at: result[i].create_at ? moment(result[i].create_at).format("YYYY-MM-DD HH:mm:ss") : "",
                modified_at: result[i].modified_at!= "0000-00-00 00:00:00" ? moment(result[i].modified_at).format("YYYY-MM-DD HH:mm:ss") : "",
            });
        }
        res.status(200).json(backResult);
    } catch (e) {
        log.error("e");
        res.status(500).json({error: 1, msg: '内部错误'});
    }
});

router.get('/save', async(req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };
    try {
        var user = req.session.user;
        log.info("user save params: ", req.query);
        var e_id = req.query.e_id;
        var e_area= req.query.e_area;
        var e_appkey= req.query.e_appkey;
        var e_secretkey= req.query.e_secretkey;
        if (e_area== "" || e_area.trim() == "") {
            result.msg = "地市名称不能为空";
        }       if (result.msg != "") {
            result.error = 1;
        } else {
            var ret, sql;
            if (e_id) {
                // 判断是否有更新权限
                let updatePermission = await perm.permission(req, 'update');
                if(!updatePermission) {
                    result.error = 1;
                    result.msg = "保存失败，没有更新权限，请联系管理员";
                    res.status(200).json(result);
                    return;
                }

                sql = "update bs_appkey set area=?,appkey=?,secret_key=?, modified_id=?, modified_at=?";
                var params = [e_area, e_appkey, e_secretkey, user.id, new Date()];
                sql = sql + "where id=?";
                params.push(e_id);
                ret = await mysql.query(sql, params);
                await common.saveOperateLog(req, "更新地市appkey：" + e_area );
            } else {

                // 判断是否有新增权限
                let addPermission = await perm.permission(req, 'add');
                if(!addPermission) {
                    result.error = 1;
                    result.msg = "保存失败，没有新增权限，请联系管理员";
                    res.status(200).json(result);
                    return;
                }
                sql = "select * from bs_appkey where id=? and is_del=0";
                var users = await mysql.query(sql, e_id);
                if (users.length > 0) {
                    result.error = 1;
                    result.msg = "appkey已经存在！";
                } else {
                    sql = "insert bs_appkey(area, appkey,secret_key,creator_id) values (?,?,?,?)";
                    ret = await mysql.query(sql, [e_area, e_appkey, e_secretkey, user.id]);
                    await common.saveOperateLog(req, "新增appkey：" + e_area);
                }
            }
            log.info("save appkey ret: ", ret);
        }
        res.status(200).json(result);
    } catch (e) {
        log.error("save appkey ret:", e);
        result.error = 1;
        result.msg = "保存失败，请联系管理员";
        res.status(200).json(result);
    }
});
router.delete('/delete', async(req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };
    // 判断是否有删除权限
    let deletePermission = await perm.permission(req, 'delete');
    if(!deletePermission) {
        result.error = 1;
        result.msg = "删除失败，没有删除权限，请联系管理员";
        res.status(200).json(result);
        return;
    }
    var user = req.session.user;
    var conn = await mysql.getConnection();
    await mysql.beginTransaction(conn);
    try {
        log.info("delete user params: ", req.body);
        var ids = req.body.ids;
        var user = req.session.user;
        var user_id = user.id;
        if (ids && ids.trim() != "") {
            ids = ids.split(",");
            if (_.indexOf(ids, user_id + "") != -1) {
                await mysql.rollback(conn);
                result.error = 1;
                result.msg = "不能删除自己";
                res.status(200).json(result);
                return;
            } else {
                var sql = 'update bs_appkey set is_del=1, modified_at=?, modified_id=? where id in (';
                var sql2 = 'delete from bs_user_role where user_id in (';
                for (var i = 0; i < ids.length; i++) {
                    if (i == 0) {
                        sql = sql + ids[i];
                        sql2 = sql2 + ids[i];
                    } else {
                        sql = sql + "," + ids[i];
                        sql2 = sql2 + "," + ids[i];
                    }
                }
                sql = sql + ")";
                sql2 = sql2 + ")";
                await mysql.query2(conn, sql, [new Date(), user.id]);
                await mysql.commit(conn);
                await common.saveOperateLog(req, "删除appkey ID: " + ids);
            }
        } else {
            result.error = 1;
            result.msg = "删除失败，必须选择一项";
            await mysql.rollback(conn);
        }
    } catch (e) {
        log.error("delete user ret:", e);
        result.error = 1;
        result.msg = "删除失败，请联系管理员";
        await mysql.rollback(conn);
    }
    res.status(200).json(result);
});
module.exports = router;
