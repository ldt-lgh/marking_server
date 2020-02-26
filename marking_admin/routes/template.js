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
/* GET template listing. */
router.get('/', async (req, res, next) => {
    let user = req.session.user;
    let menu_active = req.session.menu_active['/template'] || {};
    let permissions = await perm.getPermissions(req);
    res.render('template', {
        user: user,
        menus: req.session.menus,
        menu_active: menu_active,
        permissions: permissions,
        title: '模板管理'
    });
});
router.get('/load', async(req, res, next) => {
    try {
        var sqlcount = "select count(*) count from bs_template where is_del=0 ";
        var sql = "select * from bs_template where is_del=0 ";

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
        console.log("sqlcount:", sqlcount);
        var memuCount = await mysql.query(sqlcount);
        sql = sql + " ORDER BY id DESC limit " + start + "," + length;
        console.log("sql:", sql);
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
                template_style: result[i].template_style,
                template_pos: result[i].template_pos,
                start_time:result[i].start_time ? moment(result[i].start_time).format("YYYY-MM-DD HH:mm:ss") : "",
                end_time:result[i].end_time ? moment(result[i].end_time).format("YYYY-MM-DD HH:mm:ss") : "",
                status:result[i].status,
                uuid:result[i].uuid,
                created_at: result[i].create_at ? moment(result[i].create_at).format("YYYY-MM-DD HH:mm:ss") : "",
                modified_at: result[i].modified_time!= "0000-00-00 00:00:00" ? moment(result[i].modified_time).format("YYYY-MM-DD HH:mm:ss") : "",
            });
        }
        res.status(200).json(backResult);
    } catch (e) {
        log.error("e");
        res.status(500).json({error: 1, msg: '内部错误'});
    }
});
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
 
    var uuid = s.join("");
    return uuid;
}
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
        var e_template_style= req.query.e_template_style;
        var e_template_pos= req.query.s_template_pos;
        var e_start_time = req.query.e_start_time;
        var e_end_time = req.query.e_end_time;
        var e_status= req.query.s_status;
        var e_uuid = req.query.uuid
        if (e_area== "" || e_area.trim() == "") {
            result.msg = "地市名称不能为空";
        }       
        if (result.msg != "") {
            result.error = 1;
        }
        // } else {
        //     var ret, sql;
        //     if (e_id) {
        //         // 判断是否有更新权限
        //         let updatePermission = await perm.permission(req, 'update');
        //         if(!updatePermission) {
        //             result.error = 1;
        //             result.msg = "保存失败，没有更新权限，请联系管理员";
        //             res.status(200).json(result);
        //             return;
        //         }

        //         sql = "update bs_template set area=?,template_style=?, template_pos=?,start_time=?, end_time=?, status=?, modified_id=?, modified_at=?";
        //         var params = [e_area, e_template_style,e_template_pos, e_start_time, e_end_time, e_status, user.id, new Date()];
        //         sql = sql + "where id=?";
        //         params.push(e_id);
        //         ret = await mysql.query(sql, params);
        //         await common.saveOperateLog(req, "更新模板：" + e_area + ";ID: " + e_id);
        //     } else {
else{
    uuid = uuid();
                // 判断是否有新增权限
                // let addPermission = await perm.permission(req, 'add');
                // if(!addPermission) {
                //     result.error = 1;
                //     result.msg = "保存失败，没有新增权限，请联系管理员";
                //     res.status(200).json(result);
                //     return;
                // }
                sql = "select * from bs_template where uuid=? and start_time=? and end_time=?";
                var users = await mysql.query(sql, e_uuid, e_start_time, e_end_time);
                if (users.length > 0) {
                    result.error = 1;
                    result.msg = "同时效模板已发布";
                } else {
                    sql = "insert bs_template(area, template,start_time,end_time,status,creator_id,uuid) values (?,?,?,?,?,?,?)";
                    ret = await mysql.query(sql, [e_area, e_template_style,e_template_pos, e_start_time, e_end_time, e_status,  user.id, uuid]);
                    await common.saveOperateLog(req, "新增模板：" + e_area);
                    e_uuid = uuid;
                }
            log.info("save user ret: ", ret);
        }
        res.status(200).json(result);
    } catch (e) {
        log.error("save template ret:", e);
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
        log.info("delete template params: ", req.body);
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
                var sql = 'update bs_template set is_del=1, modified_at=?, modified_id=? where id in (';
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
                //await mysql.query2(conn, sql2);
                await mysql.commit(conn);
                await common.saveOperateLog(req, "删除模板ID: " + ids);
            }
        } else {
            result.error = 1;
            result.msg = "删除失败，必须选择一项";
            await mysql.rollback(conn);
        }
    } catch (e) {
        log.error("delete template ret:", e);
        result.error = 1;
        result.msg = "删除失败，请联系管理员";
        await mysql.rollback(conn);
    }
    res.status(200).json(result);
});
module.exports = router;
