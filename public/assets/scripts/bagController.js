var bagController = {
    init: function() {
        bagController.registerEvent();
    },
    registerEvent: function() {
        //loadBagData();
    },
    loadBagData: function(){
        $.ajax({
            type: "post",
            url: "/admin/loadBagData",
            dataType: "json",
            success: function(response){
                var data = response.data;
               //var date = response.date;
                var html = '';
                var template = $('#bag-template').html();
                
                $.each(data, function(i, item) {
                    html += Mustache.render(template, {
                        id: item._id,
                        namecharacter: item.character,
                        createdate: date[i],
                        
                        accounttype: item.acctype == true ? "<span class=\"label label-primary\">Người quản trị</span>" : "<span class=\"label label-warning\">Người chơi</span>",
                        status: item.status == true ? "<span class=\"label label-success\">Đang hoạt động</span>" : "<span class=\"label label-danger\">Đã bị khóa</span>"
                    });
                });
                
                $('#tableAccountData').html(html);
            }
        })
    }, 
    loadBagDetail: function(id) {
        $.ajax({
            type: "post",
            url: "/admin/bag_getdetail",
            data: {id: id},
            dataType: "json",
            success: function (response) {
               var data = response.data;
               var typeAccount = response.data.acctype ? "GM" : "Người chơi";
               $('#hiddenID').val(data.id);
               $('#txtFullName').val(data.fullname);
               $('#txtEmail').val(data.email);
               $('#txtPhone').val(data.phone);
               $('#txtAddress').val(data.address);
               $('#txtAccountName').val(data.username);
               $('#txtPassword').val(data.password);
               $('#txtTypeAccount').val(typeAccount);
               $('#ckStatus').prop('checked', data.status);
                }
        });
    }
}

bagController.init();