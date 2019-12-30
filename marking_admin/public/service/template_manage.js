var datatable = $('#users').DataTable({
    'bProcessing': true,
    'display': true,
    'paging': true,
    'lengthChange': true,
    'searching': false,
    'info': true,
    'ajax': '/template/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [
        {
            "data": "id",
            "render": function (data, type, full, meta) {
                return '<input type="checkbox" name="template_id_' + data + '" value="' + data + '">';
            }
        },
        {"data": "area"},
        {"data": "template_style"},
        {"data": "template_pos"},
        {"data": "start_time"},
        {"data": "end_time"},
        {"data": "status"},
        {"data": "created_at"},
        {"data": "modified_at"},
        {
            "data": "is",
            render: function (data, type, row, meta) {
                // 判断菜单权限
                var operate = "";
                if(permissions.update) {
                    operate = operate + '<a class="" data-toggle="modal" id="template_id_' + row.id + '" data-target="#e-dialog-user" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 编辑</a>&nbsp;&nbsp;';
                }
                if(permissions.delete) {
                    operate = operate + '<a name="' + row.id + '" onclick="removeData(' + row.id + ')" class="template_remove"><i class="fa fa-remove icon-white"></i> 删除</a>';
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
$("#user-search").on("click", function () {
    datatable.ajax.url('/template/load?s_area=' + $("#s_area").val()).load();
});

$("#template_refresh").on("click", function () {
    datatable.ajax.url('/template/load?s_area=' + $("#s_area").val()).load();
});
var initForm = function (modal, data) {
    if (data) {
        console.log(data)
        modal.find('.modal-body input#e_id').val(data.id);
        modal.find('.modal-body input#e_template_style').val(data.template_style);
        modal.find('.modal-body input#e_template_pos').val(data.template_pos);
        modal.find('.modal-body input#e_area').val(data.area);
        modal.find('.modal-body input#e_start_time').val(data.start_time);
        modal.find('.modal-body input#e_end_time').val(data.end_time);
        modal.find('.modal-body input#e_status').val(data.status);
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

$("#template_edit").on("click", function () {
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
    var data = $("a#template_id_" + id).attr("data-whatever");
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
        url: "/template/save",
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
                datatable.ajax.url('/template/load?&s_area=' + $("#s_area").val()).load();
            }
        }
    });
});
var deleteUserData = function (ids) {
    $.ajax({
        type: "delete",
        url: "/template/delete",
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
                datatable.ajax.url('/template/load?s_template_name=' + $("#s_template_name").val() + '&s_name=' + $("#s_name").val()).load();
            }
        }
    });
};
//批量删除
$("#template_batch_remove").on("click", function () {
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
