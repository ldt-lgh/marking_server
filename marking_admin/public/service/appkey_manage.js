var datatable = $('#users').DataTable({
    'bProcessing': true,
    'display': true,
    'paging': true,
    'lengthChange': true,
    'searching': false,
    'info': true,
    'ajax': '/appkey/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [
        {
            "data": "id",
            "render": function (data, type, full, meta) {
                return '<input type="checkbox" name="appkey_id_' + data + '" value="' + data + '">';
            }
        },
        {"data": "area"},
        {"data":"appkey"},
        {"data":"secretkey"},
        {"data": "created_at"},
        {"data": "modified_at"},
        {
            "data": "is",
            render: function (data, type, row, meta) {
                // 判断菜单权限
                var operate = "";
                if(permissions.update) {
                    operate = operate + '<a class="" data-toggle="modal" id="user_id_' + row.id + '" data-target="#e-dialog-user" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 编辑</a>&nbsp;&nbsp;';
                }
                if(permissions.delete) {
                    operate = operate + '<a name="' + row.id + '" onclick="removeData(' + row.id + ')" class="user_remove"><i class="fa fa-remove icon-white"></i> 删除</a>';
                }
                return operate;
            }
        }
    ],
    "language": {
        "emptyTable": "没有结果可以显示",
        "info": "正在显示第 _START_ 到 _END_ 条数据（共 _TOTAL_ 条）",
        "infoEmpty": "没有数据",
        "infoFiltered": "(已从 _MAX_ 条数据中过滤)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "显示 _MENU_ 条",
        "loadingRecords": "加载中...",
        "processing": "处理中...",
        "search": "搜索（任意字段）：",
        "zeroRecords": "没有匹配的数据",
        "paginate": {
            "first": "第一页",
            "last": "最后一页",
            "next": "下一页",
            "previous": "上一页"
        }
    },
    "serverSide": true
});

//搜索
$("#appkey-search").on("click", function () {
    datatable.ajax.url('/appkey/load?s_area=' + $("#s_area").val()).load();
});

$("#appkey_refresh").on("click", function () {
    datatable.ajax.url('/appkey/load?s_area=' + $("#s_area").val()).load();
});
var initForm = function (modal, data) {
    if (data) {
        console.log(data)
        modal.find('.modal-body input#e_id').val(data.id);
        modal.find('.modal-body input#e_appkey').val(data.appkey);
        modal.find('.modal-body input#e_secretkey').val(data.secretkey);
        modal.find('.modal-body input#e_area').val(data.area);
    } else {
        modal.find('.modal-body form input').val("");
        modal.find('.modal-body form select').val("0");
    }
    modal.find('.modal-body input#e_password').val("");
};
//编辑
$('#e-dialog-user').on('show.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);// Button that triggered the modal
    var data = button.data('whatever'); // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    initForm(modal, data);
});

$("#appkey_edit").on("click", function () {
    var ids = getIds();
    if (ids.length != 1) {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '请选择一条记录',
            timeout: '2000'
        }).show();
        return;
    }
    var id = ids[0];
    var data = $("a#user_id_" + id).attr("data-whatever");
    var modal = $('#e-dialog-user');
    $('#e-dialog-user').modal({
        keyboard: true
    });
    initForm(modal, JSON.parse(data));
});
$('#e-dialog-user').find('.modal-footer #saveUser').click(function () {
    var password = $("#e_password").val();
    var data = $("#e-menu-role-form").serialize();
    var dts = data.split("&");
    var str = "";
    var list = [];
    for (var i=0; i<dts.length; i++) {
        var dt = dts[i];
        if(dt.indexOf("e_password")>-1 && (password != "" && password.trim() != "")) {
            list.push("e_password=" + hex_md5(password));
        } else {
            list.push(dt);
        }
    }
    data = list.join("&");
    $.ajax({
        type: "get",
        url: "/appkey/save",
        asyc: false,
        data: data,
        error: function (error) {
            new Noty({
                type: 'error',
                layout: 'topCenter',
                text: '内部错误，请稍后再试',
                timeout: '5000'
            }).show();
        },
        success: function (result) {
            if (result.error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: result.msg || '保存用户失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '保存成功',
                    timeout: '2000'
                }).show();
                $('#e-dialog-user').modal('hide');
                datatable.ajax.url('/appkey/load?s_area=' + $("#s_area").val() ).load();
            }
        }
    });
});
var deleteUserData = function (ids) {
    $.ajax({
        type: "delete",
        url: "/appkey/delete",
        asyc: false,
        data: {ids: ids},
        error: function (error) {
            new Noty({
                type: 'error',
                layout: 'topCenter',
                text: '内部错误，请稍后再试',
                timeout: '5000'
            }).show();
        },
        success: function (result) {
            if (result.error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: result.msg || '删除用户失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '删除用户成功',
                    timeout: '2000'
                }).show();
                datatable.ajax.url('/appkey/load?s_area=' + $("#s_area").val() ).load();
            }
        }
    });
};
//批量删除
$("#appkey_batch_remove").on("click", function () {
    var ids = getIds();
    if (ids.length == 0) {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '至少要选择一条记录',
            timeout: '2000'
        }).show();
        return;
    }
    removeData(ids.join(","));
});
var removeData = function (id) {
    var n = new Noty({
        text: '你要继续吗?',
        type: 'info',
        closeWith: ['button'],
        layout: 'topCenter',
        buttons: [
            Noty.button('YES', 'btn btn-success', function () {
                deleteUserData(id);
                n.close();
            }, {id: 'button1', 'data-status': 'ok'}),

            Noty.button('NO', 'btn btn-error btn-confirm', function () {
                n.close();
            })
        ]
    }).show();
};
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
function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function randomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
$('#e-dialog-user').find('.modal-footer #keyGen').click(function () {
    
        var modal = $('#e-dialog-user');
        var appkey = uuid();
        var sec = randomString(32);
        modal.find('.modal-body input#e_appkey').val(appkey);
        modal.find('.modal-body input#e_secretkey').val(sec);
});