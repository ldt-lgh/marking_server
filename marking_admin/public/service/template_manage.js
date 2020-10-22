var datatable = $("#users").DataTable({
  bProcessing: true,
  display: true,
  paging: true,
  lengthChange: true,
  searching: false,
  info: true,
  ajax: "/template/load",
  autoWidth: true,
  ordering: false,
  columns: [
    {
      data: "id",
      render: function(data, type, full, meta) {
        return (
          '<input type="checkbox" name="template_id_' +
          data +
          '" value="' +
          data +
          '">'
        );
      }
    },
    {
      data: "name"
    },
    {
      data: "area"
    },
    {
      data: "template_style"
    },
    {
      data: "start_time"
    },
    {
      data: "end_time"
    },
    {
      data: "status",
      class: "text-center",
      render: function(data, type, row) {
        if (data == 1) {
          return "待审核";
        } else if (data == 2) {
          return "审核通过";
        } else if (data == 3) {
          return "审核不通过";
        } else if (data == 4) {
          return "已发布";
        }
        return "";
      }
    },
    {
      data: "created_at"
    },
    {
      data: "modified_at"
    },
    {
      data: "is",
      render: function(data, type, row, meta) {
        // 判断菜单权限
        var operate = "";
        if (permissions.update) {
          operate =
            operate +
            '<a class="" data-toggle="modal" id="template_id_' +
            row.id +
            '" opr=1 data-target="#e-dialog-template" data-whatever=\'' +
            JSON.stringify(row) +
            '\'><i class="fa fa-edit icon-white"></i> 编辑</a>&nbsp;&nbsp;';
          operate =
            operate +
            '<a class="" data-toggle="modal" id="template_id_' +
            row.id +
            '" opr=0 data-target="#e-dialog-template" data-whatever=\'' +
            JSON.stringify(row) +
            '\'><i class="fa fa-edit icon-white"></i> 审核</a>&nbsp;&nbsp;';
          // operate = operate + '<a class="" data-toggle="modal" id="template_id_' + row.id + '" data-target="#e-dialog-template" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 发布</a>&nbsp;&nbsp;';
        }
        if (permissions.delete) {
          operate =
            operate +
            '<a name="' +
            row.id +
            '" onclick="removeData(' +
            row.id +
            ')" class="template_remove"><i class="fa fa-remove icon-white"></i> 删除</a>';
        }
        return operate;
      }
    }
  ],
  language: {
    emptyTable: "没有结果可以显示",
    info: "正在显示第 _START_ 到 _END_ 条数据（共 _TOTAL_ 条）",
    infoEmpty: "没有数据",
    infoFiltered: "(已从 _MAX_ 条数据中过滤)",
    infoPostFix: "",
    thousands: ",",
    lengthMenu: "显示 _MENU_ 条",
    loadingRecords: "加载中...",
    processing: "处理中...",
    search: "搜索（任意字段）：",
    zeroRecords: "没有匹配的数据",
    paginate: {
      first: "第一页",
      last: "最后一页",
      next: "下一页",
      previous: "上一页"
    }
  },
  serverSide: true
});

//搜索
$("#template-search").on("click", function() {
  datatable.ajax
    .url(
      "/template/load?s_area=" +
        $("#s_area").val() +
        "&se_status=" +
        $("#se_status").val()
    )
    .load();
});

$("#template_refresh").on("click", function() {
  datatable.ajax
    .url(
      "/template/load?s_area=" +
        $("#s_area").val() +
        "&se_status=" +
        $("#se_status").val()
    )
    .load();
});
var initForm = function(modal, data, opr = 0) {
  if (opr == 2) {
    modal.find(".modal-body input#e_name").attr("readonly", false);
    modal.find(".modal-body input#e_area").attr("readonly", false);
    let main = "xxxxxxxx\nxxxxxxxx";
    modal.find(".modal-body textarea#e_template_main").val(main);
    $("#template_top").show();
    modal.find(".modal-body #template_bottom").show();
    modal.find(".modal-body #template_main").show();
    modal.find(".modal-body input#e_name").val("");
    modal.find(".modal-body input#e_area").val("");
    modal.find(".modal-body #e_template_top").val("");
    modal.find(".modal-body #e_template_bottom").val("");
    modal.find(".modal-body #e_preview").val("");
    return;
  }
  if (data) {
    console.log(data);
    modal.find(".modal-body input#e_id").val(data.id);
    modal.find(".modal-body input#e_opr").val(opr);
    let s_style = data.template_style;
    console.log(s_style);
    if (s_style != undefined) {
      s_style = s_style.replace(/ /g, "#");
      s_style = s_style.replace(/\$/g, "\\n");
      s_style = s_style.replace(/\\\\r/g, "\\r");
      console.log(s_style);
      let t = JSON.parse(s_style);
      console.log(t);
      modal.find(".modal-body textarea#e_template_top").val(t.top);
      modal.find(".modal-body textarea#e_template_bottom").val(t.bottom);
      modal.find(".modal-body textarea#e_template_main").val(t.main);
      let prev = [t.top, t.main, t.bottom].join("\n");
      //let prev = t.top+"\n"+t.main+"\n"+t.bottom
      modal.find(".modal-body textarea#e_preview").val(prev);
    }
    if (opr == 0) {
      $("#template_top").hide();
      modal.find(".modal-body #template_bottom").hide();
      modal.find(".modal-body #template_main").hide();
    } else {
      $("#template_top").show();
      modal.find(".modal-body #template_bottom").show();
      modal.find(".modal-body #template_main").show();
    }

    //modal.find('.modal-body select#s_template_pos').val(data.template_pos);
    //modal.find('.modal-body select#s_template_pos').selectpicker('val', data.template_pos);
    modal.find(".modal-body input#e_area").val(data.area);
    modal.find(".modal-body input#e_name").val(data.name);
    console.log("status", data.status);
    if (opr == 1) {
      modal.find(".modal-body input#e_name").attr("readonly", false);
      modal.find(".modal-footer button#saveTemplate").text("保存");
      modal.find(".modal-body #form-status").hide();
      // modal.find('.modal-body #form-status').style.display='none';
    } else if (opr == 3) {
      modal.find(".modal-body input#e_name").attr("readonly", false);
      modal.find(".modal-footer button#saveTemplate").text("发布");
      modal.find(".modal-body #form-status").hide();
      // modal.find('.modal-body #form-status').style.display='none';
    } else {
      modal.find(".modal-body input#e_name").attr("readonly", true);
      modal.find(".modal-body #form-status").show();
      if (data.status == 4) {
        console.log(data.status);
        modal.find(".modal-footer button#saveTemplate").attr("disabled", true);
      } else {
        modal.find(".modal-footer button#saveTemplate").attr("disabled", false);
      }
      modal.find(".modal-footer button#saveTemplate").text("保存");
      modal.find(".modal-body select#s_status").selectpicker("val", 2);
    }
    modal.find(".modal-body input#e_start_time").val(data.start_time);
    modal.find(".modal-body input#e_end_time").val(data.end_time);
    //modal.find('.modal-body input#e_status').val(data.status);
  } else {
    modal.find(".modal-body form input").val("");
    modal.find(".modal-body form select").val("0");
  }
  modal.find(".modal-body input#e_password").val("");
};
//编辑
$("#e-dialog-template").on("show.bs.modal", function(event) {
  var modal = $(this);
  var button = $(event.relatedTarget); // Button that triggered the modal
  console.log(button.attr("opr"));
  console.log(button.attr("id"));
  opr = button.attr("opr");
  console.log("button:", button);
  var data = button.data("whatever"); // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  initForm(modal, data, opr);
});
$("#e_template_top, #e_template_bottom").on("keyup", function() {
  let top = $("#e_template_top")
    .val()
    .trim("\n");
  let bottom = $("#e_template_bottom")
    .val()
    .trim("\n");
  let main = $("#e_template_main").val();
  let top_lines = top.split("\n");
  let bottom_lines = bottom.split("\n");
  top_lines.map((item, index) => {
    if (item.length > 16) {
      new Noty({
        type: "warning",
        layout: "topCenter",
        text: "每行不可超过16个字符",
        timeout: "2000"
      }).show();
      return;
    }
  });
  bottom_lines.map((item, index) => {
    if (item.length > 16) {
      new Noty({
        type: "warning",
        layout: "topCenter",
        text: "每行不可超过16个字符",
        timeout: "2000"
      }).show();
      return;
    }
  });
  let total_lines = top.split("\n").length + bottom.split("\n").length;
  if (total_lines > 3) {
    new Noty({
      type: "warning",
      layout: "topCenter",
      text: "增位行数不可超过3行",
      timeout: "2000"
    }).show();
    return;
  }
  let prev = "";
  if (top != "" && bottom != "") prev = [top, main, bottom].join("\n");
  else if (top == "" && bottom != "") prev = [main, bottom].join("\n");
  else if (top != "" && bottom == "") prev = [top, main].join("\n");
  else prev = [main];
  $("#e_preview").val(prev);
});
$("#template_edit").on("click", function() {
  console.log("click edit");
  var ids = getIds();
  if (ids.length != 1) {
    new Noty({
      type: "warning",
      layout: "topCenter",
      text: "请选择一条记录",
      timeout: "2000"
    }).show();
    return;
  }
  var id = ids[0];
  var data = $("a#template_id_" + id).attr("data-whatever");
  console.log("modal data:", data);
  console.log("status:", data["status"]);
  jdata = JSON.parse(data);
  console.log("modal data:", jdata);
  if (jdata["status"] != 2 && jdata["status"] < 4) {
    new Noty({
      type: "warning",
      layout: "topCenter",
      text: "模板审核通过后才能发布",
      timeout: "2000"
    }).show();
    return;
  } else if (jdata["status"] == 4) {
    new Noty({
      type: "warning",
      layout: "topCenter",
      text: "当前模板已发布",
      timeout: "2000"
    }).show();
    return;
  }
  var modal = $("#e-dialog-template");
  $("#e-dialog-template").modal({
    keyboard: true
  });
  initForm(modal, JSON.parse(data), 3);
});
$("#template_add").on("click", function() {
  console.log("click add");
  var modal = $("#e-dialog-template");
  $("#e-dialog-template").modal({
    keyboard: true
  });
  initForm(modal, "", 2);
});
$("#e-dialog-template")
  .find(".modal-footer #saveTemplate")
  .click(function() {
    var data = $("#e-template-form").serialize();
    console.log("dialog data:", data);
    var url = "/template/pub";
    var dts = data.split("&");
    console.log(dts);
    var str = "";
    var list = [];
    var style = {};
    for (var i = 0; i < dts.length; i++) {
      var dt = dts[i];
      if (
        dt.indexOf("e_password") > -1 &&
        (password != "" && password.trim() != "")
      ) {
        list.push("e_password=" + hex_md5(password));
      } else if (dt.indexOf("e_opr") > -1) {
        opr = dt.split("=")[1];
        console.log("opr:", opr);
        if (opr == "1" || opr == "2" || opr == "0") {
          url = "template/save";
        }
      } else if (dt.indexOf("e_template_top") > -1) {
        let top = dt.split("=")[1];
        console.log("top:", top);
        style["top"] = top.trim("%0D%0A");
      } else if (dt.indexOf("e_template_main") > -1) {
        let main = dt.split("=")[1];
        console.log("main:", main);
        style["main"] = main.trim("%0D%0A");
      } else if (dt.indexOf("e_template_bottom") > -1) {
        let bottom = dt.split("=")[1];
        console.log("bottom:", bottom);
        style["bottom"] = bottom.trim("%0D%0A");
      } else {
        list.push(dt);
      }
    }
    let bl = 0;
    if (style["bottom"] == "") {
      bl = 0;
    } else {
      bl = style["bottom"].split("%0D%0A").length;
    }
    let top_lines = style['top'].split("%0D%0A");
    let bottom_lines = style['bottom'].split("%0D%0A");
    top_lines.map((item, index) => {
      if (item.length > 16) {
        new Noty({
          type: "warning",
          layout: "topCenter",
          text: "每行不可超过16个字符",
          timeout: "2000"
        }).show();
        return;
      }
    });
    bottom_lines.map((item, index) => {
      if (item.length > 16) {
        new Noty({
          type: "warning",
          layout: "topCenter",
          text: "每行不可超过16个字符",
          timeout: "2000"
        }).show();
        return;
      }
    });
    let total_lines = style["top"].split("%0D%0A").length + bl;
    if (total_lines > 3) {
      new Noty({
        type: "warning",
        layout: "topCenter",
        text: "增位行数不可超过3行",
        timeout: "2000"
      }).show();
      return;
    }
    let style_str = JSON.stringify(style);
    console.log("style:", style_str);
    //style_str.replace(/[\n]/g,"\\\\n")

    //style_str.replace(/\r/g,"\\\\r")
    //console.log("style:",style_str)
    list.push("e_template_style=" + style_str);
    data = list.join("&");
    console.log("template data:", data);
    $.ajax({
      type: "get",
      url: url,
      asyc: false,
      data: data,
      error: function(error) {
        new Noty({
          type: "error",
          layout: "topCenter",
          text: "内部错误，请稍后再试",
          timeout: "5000"
        }).show();
      },
      success: function(result) {
        if (result.error) {
          new Noty({
            type: "error",
            layout: "topCenter",
            text: result.msg || "保存模板失败",
            timeout: "2000"
          }).show();
        } else {
          new Noty({
            type: "success",
            layout: "topCenter",
            text: result.msg || "保存成功",
            timeout: "2000"
          }).show();
          $("#e-dialog-template").modal("hide");
          datatable.ajax
            .url(
              "/template/load?&s_area=" +
                $("#s_area").val() +
                "&se_status=" +
                $("#se_status").val()
            )
            .load();
        }
      }
    });
  });
var deleteUserData = function(ids) {
  $.ajax({
    type: "delete",
    url: "/template/delete",
    asyc: false,
    data: {
      ids: ids
    },
    error: function(error) {
      new Noty({
        type: "error",
        layout: "topCenter",
        text: "内部错误，请稍后再试",
        timeout: "5000"
      }).show();
    },
    success: function(result) {
      if (result.error) {
        new Noty({
          type: "error",
          layout: "topCenter",
          text: result.msg || "删除用户失败",
          timeout: "2000"
        }).show();
      } else {
        new Noty({
          type: "success",
          layout: "topCenter",
          text: result.msg || "删除用户成功",
          timeout: "2000"
        }).show();
        datatable.ajax
          .url(
            "/template/load?s_template_name=" +
              $("#s_template_name").val() +
              "&s_name=" +
              $("#s_name").val()
          )
          .load();
      }
    }
  });
};
//批量删除
$("#template_batch_remove").on("click", function() {
  var ids = getIds();
  if (ids.length == 0) {
    new Noty({
      type: "warning",
      layout: "topCenter",
      text: "至少要选择一条记录",
      timeout: "2000"
    }).show();
    return;
  }
  removeData(ids.join(","));
});
var removeData = function(id) {
  var n = new Noty({
    text: "你要继续吗?",
    type: "info",
    closeWith: ["button"],
    layout: "topCenter",
    buttons: [
      Noty.button(
        "YES",
        "btn btn-success",
        function() {
          deleteUserData(id);
          n.close();
        },
        {
          id: "button1",
          "data-status": "ok"
        }
      ),

      Noty.button("NO", "btn btn-error btn-confirm", function() {
        n.close();
      })
    ]
  }).show();
};
