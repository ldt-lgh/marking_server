var datatable = $('#users').DataTable({
    'bProcessing': true,
    'display': true,
    'paging': true,
    'lengthChange': true,
    'searching': false,
    'info': true,
    'ajax': '/confirm/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [{
            "data": "id",
            "render": function (data, type, full, meta) {
                return '<input type="checkbox" name="template_id_' + data + '" value="' + data + '">';
            }
        },
        {
            "data": "template_name"
        },
        {
            "data": "uuid"
        },
        {
            "data": "area"
        },
        {
            "data": "appkey"
        },
        {
            "data": "machine_name",
            "class": "text-center",
        },
        {
            "data": "create_at"
        },
        {
            "data": "is",
            render: function (data, type, row, meta) {
                // 判断菜单权限
                var operate = "";
                // if (permissions.update) {
                //     operate = operate + '<a class="" data-toggle="modal" id="template_id_' + row.id + '" data-target="#e-dialog-template" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 核</a>&nbsp;&nbsp;';
                // }
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
$("#template-search").on("click", function () {
    datatable.ajax.url('/confirm/load?s_area=' + $("#s_area").val()+"&se_tname="+$("#se_tname").val()).load();
});

$("#template_refresh").on("click", function () {
    datatable.ajax.url('/confirm/load?s_area=' + $("#s_area").val()+"&se_tname="+$("#se_tname").val()).load();
});
var initForm = function (modal, data, opr = 0 ) {
    if (data) {
        console.log(data)
        modal.find('.modal-body input#e_id').val(data.id);
        modal.find('.modal-body input#e_opr').val(opr);
        modal.find('.modal-body textarea#e_template_style').val(data.template_style);
        //modal.find('.modal-body select#s_template_pos').val(data.template_pos);
        modal.find('.modal-body select#s_template_pos').selectpicker('val', data.template_pos);
        modal.find('.modal-body input#e_area').val(data.area);
        modal.find('.modal-body input#e_name').val(data.name);
        console.log("status", data.status);
        if (opr == 1)
        {
            modal.find('.modal-body input#e_name').attr("readonly",false);
            console.log("form status none");
            modal.find('.modal-footer button#saveTemplate').text("发布");
            modal.find('.modal-body #form-status').hide();
            // modal.find('.modal-body #form-status').style.display='none';
        }
        else{

            modal.find('.modal-body input#e_name').attr("readonly",true);
            modal.find('.modal-body #form-status').show();
            modal.find('.modal-footer button#saveTemplate').text("审核");
            modal.find('.modal-body select#s_status').selectpicker('val', 2);
        }
        modal.find('.modal-body input#e_start_time').val(data.start_time);
        modal.find('.modal-body input#e_end_time').val(data.end_time);
        //modal.find('.modal-body input#e_status').val(data.status);
    } else {
        modal.find('.modal-body form input').val("");
        modal.find('.modal-body form select').val("0");
    }
    modal.find('.modal-body input#e_password').val("");
};
//编辑
$('#e-dialog-template').on('show.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget); // Button that triggered the modal
    var data = button.data('whatever'); // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    initForm(modal, data);
});

$("#template_edit").on("click", function () {
    console.log("click edit")
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
    console.log("modal data:",data);
    console.log("status:", data['status'])
    jdata = JSON.parse(data)
    console.log("modal data:",jdata);
    if (jdata['status'] != 2 && jdata['status']<4)
    {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '模板审核通过后才能发布',
            timeout: '2000'
        }).show();
        return;

    }
    else if (jdata['status'] == 4)
    {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '当前模板已发布',
            timeout: '2000'
        }).show();
        return;

    }
    var modal = $('#e-dialog-template');
    $('#e-dialog-template').modal({
        keyboard: true
    });
    initForm(modal, JSON.parse(data),1);
});
$('#e-dialog-template').find('.modal-footer #saveTemplate').click(function () {
    var data = $("#e-template-form").serialize();
    console.log("dialog data:", data)
    var url = "/template/pub";
    var dts = data.split("&");
    console.log(dts);
    var str = "";
    var list = [];
    for (var i = 0; i < dts.length; i++) {
        var dt = dts[i];
        if (dt.indexOf("e_password") > -1 && (password != "" && password.trim() != "")) {
            list.push("e_password=" + hex_md5(password));
        } 
        else if(dt.indexOf("e_opr")>-1){
            opr = dt.split("=")[1]
            console.log("opr:", opr)
            if (opr=="0")
            {
                url = "template/save"
            }
        }
        else {
            list.push(dt);
        }
    }
    data = list.join("&");
    console.log("template data:", data)
    $.ajax({
        type: "get",
        url: url,
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
                    text: result.msg || '保存模板失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '保存成功',
                    timeout: '2000'
                }).show();
                $('#e-dialog-template').modal('hide');
                datatable.ajax.url('/template/load?&s_area=' + $("#s_area").val()+"&se_status="+$("#se_status").val()).load();
            }
        }
    });
});
var deleteUserData = function (ids) {
    $.ajax({
        type: "delete",
        url: "/template/delete",
        asyc: false,
        data: {
            ids: ids
        },
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
            }, {
                id: 'button1',
                'data-status': 'ok'
            }),

            Noty.button('NO', 'btn btn-error btn-confirm', function () {
                n.close();
            })
        ]
    }).show();
};