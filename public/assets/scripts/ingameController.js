var ingameController = {
    init: function(){
        ingameController.registerEvent();
    },
    registerEvent: function() {
        $(document).on("click", ".btnBuy", function(e) {
            e.preventDefault();
            var idItem = $(this).attr('idItem');
            var idCashShop = $(this).attr('idCashShop');
            bootbox.confirm("Bạn muốn mua vật phẩm này?", function(result) {       
                if(result){
                    ingameController.buyItem(idItem, idCashShop);
                }
            });
        });
    },
    buyItem: function(idItem, idCashShop) {
        $.ajax({
            type: "POST",
            url: '/ingame/buyItem',
            data: {
                idItem: idItem,
                idCashShop: idCashShop
            },
            dataType: 'json',
            success: function() {
                bootbox.alert("Mua thành công");
            },
            error: function() {
                bootbox.alert("Hiện tại bạn không đủ tiền vui lòng thử lại sau!");
            }
        })
    },
    getJson: function(url) {
        return JSON.parse($.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            global: false,
            async: false,
            success: function (data) {
                return data;
            },
            error: function (error) {
                bootbox.alert('Có lỗi xảy ra! Vui lòng load lại trang :) - ' + error.responseText);
                window.location.reload(true);
            }
        }).responseText);
    }
}

ingameController.init();