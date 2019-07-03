// $(document).ready(function(){   
   var characterController = {
        init: function() {
            characterController.registerEvent();
        },
        registerEvent: function() {
            characterController.loadCharacterData();
    
            $('#btnAddNewCharacter').off('click').on('click', function(e) {
                e.preventDefault();
                $('#modalCharacterAddUpdate').appendTo("body").modal('show');
            });
    
            $('.btnInformationCharacter').off('click').on("click", function(e) {
                e.preventDefault();
                $('#modalCharacterAddUpdate').appendTo("body").modal('show');
            });
    
            $('#btnXemDanhSachVatPham').off('click').on('click', function(e){
                e.preventDefault();
                $('#modalCharacterItem').appendTo("body").modal('show');
            });
    
            $('.btnEdit').off('click').on('click', function(e){
                //e.preventDefault();
                $('#modalCharacterAddUpdate').appendTo("body").modal('show');
                var id = $(this).attr('idCharacter');
                characterController.loadCharacterDetail(id);
            });
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
                            //nameaccount: item.accountid.username,
                            namecharacter: item.name,
                            level: item.level,
                            createdate: date[i]
                        });
                    });
                    
                    $('#tableCharacterData').html(html);
                }
            })
        },
        loadCharacterDetail: function(id) {
            $.ajax({
                     type: "post",
                     url: "/admin/character_getdetail",
                     data: {id: id},
                     dataType: "json",
                     success: function (response) {
                        var data = response.data;
                        //var typeAccount = response.data.acctype ? "GM" : "Người chơi";
                        $('#hiddenID').val(data.id);
                        $('#txtTenTaiKhoan').val(data.accountid.username);
                        $('#txtTenNhanVat').val(data.name);
                        $('#txtLevelNhanVat').val(data.data);
                        $('#txtClan').val(data.clanid.name);
                    }
            });
        }
    }

//     $('#tableCharacterData').on('load', characterController.init());
// });

characterController.init();



