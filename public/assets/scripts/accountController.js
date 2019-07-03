   var accountController = {
        init: function() {
            accountController.registerEvent();
        },
        registerEvent: function() {
    
           accountController.loadAccountData();
            
            $('#btnAddNew').off('click').on('click', function(e) {
                $('#modalAccountAddUpdate').appendTo("body").modal('show');
                accountController.resetForm();
            });
    
            $(document).on("click", "#listAccount", function(e) {
                //e.preventDefault();
                accountController.loadAccountData();
            })
    
            $(document).on("click", "#listCharacter", function(e) {
                accountController.loadCharacterData();
            })
    
            $(document).on("click",".btnEdit",function(e) {
                e.preventDefault();
                $('#modalAccountAddUpdate').appendTo("body").modal('show');
                var id = $(this).attr('idAccount');
                accountController.loadAccountDetail(id);
            });

            $(document).on("click",".btnDelete",function(e) {
                e.preventDefault();
                var id = $(this).attr('idAccount');
                bootbox.confirm("Are you sure?", function(result) {       
                    if(result){
                        accountController.deleteAccount(id);
                    }
                });
            });

            $('#btnSaveAccount').off('click').on('click', function(){
                //alert(1);
                accountController.saveAccount();
            });
        },
        saveAccount: function(){
            var fullname = $('#txtFullName').val();
            var email = $('#txtEmail').val();
            var phone = $('#txtPhone').val();
            var address = $('#txtAddress').val();
            var accountname = $('#txtAccountName').val();
            var password = $('#txtPassword').val();
            var statusAccountType = $('#ckTypeAccount').prop('checked');
            var status = $('#ckStatus').prop('checked');
            var id = parseInt($('#hiddenID').val());

            $.ajax({
                url: '/admin/saveAccount',
                data: {
                    fullname: fullname,
                    email: email,
                    phone: phone,
                    address: address,
                    accountname: accountname,
                    password: password,
                    statusAccountType: statusAccountType,
                    status: status,
                    id: id
                },
                type: 'POST',
                dataType: 'json',
                success: function(response){
                    if (response.status == true){
                        bootbox.alert('Thêm mới thành công');
                        $('#modalAccountAddUpdate').appendTo("body").modal('hide');
                        accountController.loadAccountData();
                    }
                    if (response.status == false){
                        bootbox.alert('Tài khoản đã tồn tại');
                    }
                },
                error: function(err){
                    console.log(err);
                }
            })
        },
        deleteAccount: function(id){
            $.ajax({
                url: '/admin/deleteAccount',
                data: {
                    id: id
                },
                type: 'POST',
                dataType: 'json',
                success: function(response) {
                    if(response.status == true) {
                        bootbox.alert("Delete Success", function() {
                            accountController.loadAccountData();
                        });
                    }
                    else {
                        bootbox.alert(response.message);
                    }
                },
                error: function(err){
                    console.log(err);
                }
            });
        },
        loadAccountData: function() {
            $.ajax({
                type: "post",
                url: "/admin/loadAccountData",
                dataType: "json",
                success: function(response) {
                    var data = response.data;
                    var date = response.date;
                    var html = '';
                    var template = $('#account-template').html();
                    
                    $.each(data, function(i, item) {
                        html += Mustache.render(template, {
                            id: item._id,
                            username: item.username,
                            createdate: date[i],
                            accounttype: item.acctype == true ? "<span class=\"label label-primary\">Người quản trị</span>" : "<span class=\"label label-warning\">Người chơi</span>",
                            status: item.status == true ? "<span class=\"label label-success\">Đang hoạt động</span>" : "<span class=\"label label-danger\">Đã bị khóa</span>"
                        });
                    });
                    
                    $('#tableAccountData').html(html);
                }
            })
        },
        loadCharacterData: function(){
            $.ajax({
                type: "post",
                url: "/admin/loadCharacterData",
                dataType: "json",
                success: function(response) {
                    var data = response.data;
                    var date = response.date;
                    var html = '';
                    var templateCharacter = $('#character-template').html();
                    
                    $.each(data, function(i, item) {
                        html += Mustache.render(templateCharacter, {
                            id: item._id,
                            nameaccount: item.accountid.username,
                            namecharacter: item.name,
                            level: item.level,
                            createdate: date[i]
                        });
                    });
                    
                    $('#tableCharacterData').html(html);
                }
            })
        },
        loadAccountDetail: function(id) {
            $.ajax({
                     type: "post",
                     url: "/admin/account_getdetail",
                     data: {id: id},
                     dataType: "json",
                     success: function (response) {
                        var data = response.data;
                        //var typeAccount = response.data.acctype ? "GM" : "Người chơi";
                        $('#hiddenID').val(data.id);
                        $('#txtFullName').val(data.fullname);
                        $('#txtEmail').val(data.email);
                        $('#txtPhone').val(data.phone);
                        $('#txtAddress').val(data.address);
                        $('#txtAccountName').val(data.username);
                        $('#txtPassword').val(data.password);
                        //$('#txtTypeAccount').val(typeAccount);
                        $('#ckTypeAccount').prop('checked', data.acctype);
                        $('#ckStatus').prop('checked', data.status);
                    }
            });
        },
        resetForm: function() {
            $('#hiddenID').val(0);
            $('#txtFullName').val('');
            $('#txtEmail').val('');
            $('#txtPhone').val('');
            $('#txtAddress').val('');
            $('#txtAccountName').val('');
            $('#txtPassword').val('');
            $('#txtTypeAccount').val('');
            $('#ckStatus').prop('checked', true);
        } 
    }
    
accountController.init();