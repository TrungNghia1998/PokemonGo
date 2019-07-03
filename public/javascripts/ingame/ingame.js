
$(document).ready(function () {         //khi trang load xong là chạy hết những gì t có
    $(window).on('load', function () {
        $("#loading").fadeOut(300);
    });

    //logout
    $("#logout").click(function () {
        var r = confirm('Đăng xuất?')
        if (r == true)
            window.location.href = '/ingame/logout'
    })

    $("#flip .btn").click(function () {
        $("#PokeNearBar").animate({ width: 'toggle' });
    });

    $("#deleteitem").click(function () {
        var typeitem = $("#typeitem").text()
        if (typeitem.includes("Thời trang")) {
            var idx = $("#iditemdelete").val()
            var r = confirm("Bạn có chắc chắn muốn vứt thời trang " + $("#nameitem").text());
            if (r == true) {
                $.blockUI();
                setTimeout(function () {
                    $.ajax({
                        type: "POST",
                        url: "/ingame/deleteitem",
                        data: { idx: idx, type: 0, amount: 1 },
                        async: false,
                        success: function (data) {
                            if (data.status == "200") {
                                alert("Vứt thành công!")
                                $("#deleteItem").modal('hide')
                                getCharacterInfo();
                                getBagInformation();
                            }
                            else if (data.status == "909") {
                                alert("Số lượng không đúng")
                            }
                            else if (data.status == "899") {
                                alert("Lỗi không xác định")
                                $("#deleteItem").modal('show')
                            }
                            $.unblockUI()
                            if (data.status == "200")
                                $.growlUI('Thông báo', 'Bạn đã vứt thời trang ' + $("#nameitem").text());
                        },
                        error: function (xhr) {
                            alert('Lỗi - vui lòng F5 để load lại trang');
                            window.location.reload(true);
                        }
                    })
                }, 500)
            }
            return;
        }
        $("#deleteItem").modal('show')
    })


    //Submit vứt vật phẩm
    $("#submitdeleteitem").click(function () {
        $("#detailitemcol").hide()
        var idx = $("#iditemdelete").val()
        var amount = $("#amountdeleteitem").val()
        var r = confirm("Bạn có chắc chắn muốn vứt " + amount + ' ' + $("#nameitem").text());
        if (r == true) {
            $.blockUI();
            setTimeout(function () {
                $.ajax({
                    type: "POST",
                    url: "/ingame/deleteitem",
                    data: { idx: idx, type: 0, amount: amount },
                    async: false,
                    success: function (data) {
                        if (data.status == "200") {
                            alert("Vứt thành công!")
                            $("#deleteItem").modal('hide')
                            getCharacterInfo();
                            getBagInformation()
                        }
                        else if (data.status == "909") {
                            alert("Số lượng không đúng")
                        }
                        else if (data.status == "899") {
                            alert("Lỗi không xác định")
                            $("#deleteItem").modal('show')
                        }
                        $.unblockUI()
                        if (data.status == "200")
                            $.growlUI('Thông báo', 'Bạn đã vứt ' + amount + ' ' + $("#nameitem").text());
                    },
                    error: function (xhr) {
                        alert('Lỗi - vui lòng F5 để load lại trang');
                        window.location.reload(true);
                    }
                })
            }, 500)
        }
    })

    //Submit phóng sinh
    $("#deletepokemon").click(function () {
        $("#detailpokemoncol").hide()
        var r = confirm("Bạn có chắc chắn muốn phóng sinh " + $("#namedetailPokemon").text());
        if (r == true) {
            $.blockUI();
            var catchdate = $("#deletecatchdate").val()
            setTimeout(function () {
                $.ajax({
                    type: "POST",
                    url: "/ingame/deleteitem",
                    data: { idx: catchdate, type: 1 },
                    async: false,
                    success: function (data) {
                        if (data.status == "200") {
                            alert("Phóng sinh thành công")
                            getCharacterInfo();
                            getBagInformation()
                        }
                        else if (data.status == "899") {
                            alert("Lỗi không xác định")
                        }
                        $.unblockUI()
                        if (data.status == "200")
                            $.growlUI('Thông báo', 'Bạn đã phóng sinh ' + $("#namedetailPokemon").text());
                    },
                    error: function (xhr) {
                        alert('Lỗi - vui lòng F5 để load lại trang');
                        window.location.reload(true);
                    }
                })
            }, 500)
        }
    })

    //lịch sử giao dịch
    $("#transhistory").click(() => {
        transHistory.sort((a, b) => { return new Date(b.date) - new Date(a.date); })
        $("#vipbenefit,#hrcashshop").hide()
        $("#catlogpart #tool").find('p').removeClass('flash')
        $("#catlogpart #skin").find('p').removeClass('flash')
        $("#catlogpart #other").find('p').removeClass('flash')
        $("#listitemcashshop").empty()
        var child = `<h2 class="display-5 text-center">LỊCH SỬ GIAO DỊCH</h2>` +
            `<div class="rounded border border-light bg-dark animated fadeInUp">` +
            `<table class="table table-hover"><thead class="thead-light"><th>Tên vật phẩm</th><th>Số lượng</th><th>Thời gian</th></thead>` +
            `<tbody>`
        transHistory.forEach(trans => {
            let type = "NULL";
            switch (trans.item.typeuse) {
                case "tool":
                    type = "Công cụ";
                    break;
                case "skin":
                    type = "Thời trang";
                    break;
                case "packet":
                    type = "Gói";
                    break;
                case "other":
                    type = "Linh tinh";
                    break;
                default:
                    type = "VIP";
            };
            child += `<tr><td>[${type}] ${trans.item.name}</td><td>${trans.amount}</td><td>${moment(trans.date).format("LTS DD/MM/YYYY")}</td></tr>`
        });
        child += `</tbody></table></div>`
        $("#listitemcashshop").append(child)
    })

    //Thông báo pokeshop
    function cashshopNof() {
        //nhập thông báo tại đây (chấp cả html)
        $("#vipbenefit,#hrcashshop").hide()
        var nof = [`<h5 class="text-danger">Thời trang mới: [Nam] Huyết nguyệt</h5>`,
            "hihi",
            "hoho"]
        $("#catlogpart #tool").find('p').removeClass('flash')
        $("#catlogpart #skin").find('p').removeClass('flash')
        $("#catlogpart #other").find('p').removeClass('flash')
        $("#listitemcashshop").empty()
        var child = `<h2 class="display-5 text-center">POKÉSHOP CÓ GÌ MỚI???</h2>` +
            `<div class="rounded border border-light bg-dark animated fadeInUp">` +
            `<ul>`
        nof.forEach(e => {
            child += `<li>` + e + `</li>`
        });
        child += `</ul></div>`
        $("#listitemcashshop").append(child)
    }
    $("#pokeshopModal").on('hidden.bs.modal', function () {
        cashshopNof()
    })

    //Search cashshop
    $("#searchgroup .input-group-append button").click(function () {
        $.blockUI()
        var cashshop = getJson('/ingame/cashshop')
        $("#vipbenefit,#hrcashshop").hide()
        $("#listitemcashshop").empty()
        var keyword = ($("#searchgroup input").val()).toLowerCase();
        var typeitem = $("#typeitemsearch input[name=typeitem]:checked").val();
        var child = `<div class="row px-2 animated fadeInDown">`
        let count = 0;
        $("#searchgroup input").val("");
        $("#listitemcashshop").append(`<h4 class="display-5 font-italic">Kết quả tìm kiếm của:&nbsp;` + sanitizeHtml(keyword) +
            `&nbsp;(loại:` + ($("#typeitemsearch input[name=typeitem]:checked").parent().text()).toLowerCase() + `)` + `</h4>`)
        setTimeout(function () {
            $.unblockUI()
            for (var i = 0; i < cashshop.length; i++) {
                if (cashshop[i].itemid.typeuse == typeitem && cashshop[i].itemid.name.toLowerCase().includes(keyword)) {
                    count++;
                    var price = `<h5 name="priceitem" class="font-weight-bold"><i class="fas fa-gem"> </i>&nbsp;` + cashshop[i].price.toLocaleString() + `</h5>`
                    var bgitem = `btn-info`
                    if (typeitem == 'vip') {
                        var normalprice = cashshop[cashshop.findIndex(item => item.itemid.name == cashshop[i].itemid.name &&
                            item.itemid.typeuse != 'vip')].price;
                        bgitem = `btn-warning`
                        price = `<h5 class="font-weight-bold"><i class="fas fa-gem"> </i>&nbsp;<del>&nbsp;` + normalprice.toLocaleString() + `&nbsp;</del></h5>` + price
                    }
                    child += `<div class="col text-center border-info border ` + bgitem + `"><br>` +
                        `<img id="imgcashshopitem" class="border border-danger" src="` + cashshop[i].itemid.image.value + `" width="50%"><hr>` +
                        `<h5 name="nameitem">` + cashshop[i].itemid.name + `</h5>` +
                        price +
                        `<div class="container">` +
                        `<div class="row justify-content-center">` +
                        `<input type="hidden" name="iditem" value="` + cashshop[i]._id + `">` +
                        `<div class="radio"><label><input type="radio" name="amount" value="1">x1</label></div>&nbsp;&nbsp;&nbsp;` +
                        `<div class="radio"><label><input type="radio" name="amount" value="5">x5</label></div>&nbsp;&nbsp;&nbsp;` +
                        `<div class="radio"><label><input type="radio" name="amount" value="10">x10</label></div></div></div>` +
                        `<button class="btn-buyitem btn btn-danger btn-block">Mua</button><br></div>&nbsp;&nbsp;`
                    if (count % 4 == 0) {
                        child += `</div><br>`;
                        $("#listitemcashshop").append(child);
                        child = `<div class="row px-2 animated fadeInDown">`;
                        continue;
                    }
                }
            }
            if (count == 0) {
                child += `</div><div class="container-fluid text-center mt-5">` +
                    `<img src="/images/empty.gif" width="25%" height="25%"/>` +
                    `<h5 class="display-5 font-italic">Không tìm được gì cả &#128049;</h5></div>`
            }
            $("#listitemcashshop").append(child)

            if (typeitem == 'skin') {
                $("#listitemcashshop").find('.radio').hide()
            }

            $("#listitemcashshop .btn-buyitem").click(function () {
                var parent = $(this).parent()
                var amount = typeitem == 'skin' ? 1 : parent.find('input[name=amount]:checked').val()
                var iditem = parent.find('input[name=iditem').val()
                var idname = parent.find('h5[name=nameitem]').text()
                for (var i = 0; i < character.bagid.items.length && typeitem == 'skin'; i++) {
                    if (character.bagid.items[i].itemid.name == idname && character.bagid.items[i].itemid.typeuse == 'skin') {
                        alert("Bạn đã sở hữu thời trang này rồi!")
                        return;
                    }
                }
                if (typeitem == 'vip' && vipflag == false) {
                    var r = confirm("Xin lỗi!\nChỉ có VIP mới có thể mua được những vật phẩm này!\n" +
                        "Trở thành VIP ngay và luôn?")
                    if (r == true) {
                        $("#becomevip").trigger('click')
                    }
                    return;
                }
                if (amount == undefined) {
                    alert('Vui lòng chọn số lượng muốn mua :)')
                    return;
                }
                var r = confirm("Bạn có chắc muốn mua\n" +
                    "        Vật phẩm: " + idname.toUpperCase() + "\n" +
                    "        Số lượng: " + amount + "\n" +
                    "        Giá: " + (parseInt(amount) * parseInt($.trim(parent.find('h5[name=priceitem]').text()))).toLocaleString() + " GEM \n Lưu ý: Thao tác sẽ không thể phục hồi!");
                if (r == true) {
                    $.blockUI()
                    setTimeout(function () {
                        $.ajax({
                            type: "POST",
                            url: "/ingame/buyitem",
                            data: { iditem: iditem, amount: amount, type: 0 },
                            async: false,
                            success: function (data) {
                                if (data.status == '404' || data.status == '899') {
                                    alert('Lỗi không xác định! Vui lòng F5 lại trang');
                                    $.unblockUI()
                                    return;
                                } else if (data.status == '900') {
                                    alert('Bạn không đủ tiền để mua vật phẩm này :)');
                                    $.unblockUI()
                                    return;
                                } else if (data.status == '901') {
                                    alert('Túi đầy!');
                                    $.unblockUI()
                                    return;
                                }
                                var message = `<div class="row px-2 d-flex justify-content-center"><h1>+</h1><img src="` + parent.find("#imgcashshopitem").attr('src') +
                                    `" width="50px" height="50px"/>` +
                                    `<h1 class="display-5 float-right">x` + amount + `</h1></div>`

                                $.unblockUI()
                                if (data.status == "200") {
                                    $.growlUI('Giao dịch thành công', message, 7 * 1000);
                                }
                                getCharacterInfo();
                                getBagInformation();
                                $("#charactergem").text(character.gem.toLocaleString())
                                $("#gemcurrent").text(character.gem.toLocaleString())
                            },
                            error: function (xhr) {
                                alert('Lỗi - vui lòng F5 để load lại trang');
                                window.location.reload(true);
                            }
                        })
                    }, 500)
                }
            })
        }, 500)
    })

    //Catalog cashshop
    $("#catlogpart #tool").click(function () {
        $.blockUI()
        $("#vipbenefit,#hrcashshop").hide()
        $(this).find('p').addClass('flash')
        setTimeout(function () {
            $("#catlogpart #skin").find('p').removeClass('flash')
            $("#catlogpart #other").find('p').removeClass('flash')
            getCashshopInfomation('tool');
            $.unblockUI()
        }, 500)
    })
    $("#catlogpart #skin").click(function () {
        $.blockUI()
        $("#vipbenefit,#hrcashshop").hide()
        $(this).find('p').addClass('flash')
        setTimeout(function () {
            $("#catlogpart #tool").find('p').removeClass('flash')
            $("#catlogpart #other").find('p').removeClass('flash')
            getCashshopInfomation('skin');
            $.unblockUI()
        }, 500)
    })
    $("#catlogpart #other").click(function () {
        $.blockUI()
        $("#vipbenefit,#hrcashshop").hide()
        $(this).find('p').addClass('flash')
        setTimeout(function () {
            $("#catlogpart #tool").find('p').removeClass('flash')
            $("#catlogpart #skin").find('p').removeClass('flash')
            getCashshopInfomation('other');
            $.unblockUI()
        }, 500)
    })
    $("#catlogpart #vip").click(function () {
        $.blockUI()
        $("#vipbenefit,#hrcashshop").hide()
        $(this).find('p').addClass('flash')
        setTimeout(function () {
            $("#catlogpart #tool").find('p').removeClass('flash')
            $("#catlogpart #skin").find('p').removeClass('flash')
            $("#catlogpart #other").find('p').removeClass('flash')
            getCashshopInfomation('vip');
            $.unblockUI()
        }, 500)
    })

    //Nạp vip
    $("#becomevip").click(async function () {
        $.blockUI();
        let cashshop = await getJson('/ingame/cashshop')
        setTimeout(() => {
            $("#vipbenefit,#hrcashshop").show()
            $("#catlogpart #tool").find('p').removeClass('flash')
            $("#catlogpart #skin").find('p').removeClass('flash')
            $("#catlogpart #other").find('p').removeClass('flash')
            $("#listitemcashshop").empty()
            var child = `<div class="row px-2 animated fadeInUp">`
            let count = 0;
            cashshop.forEach(i => {
                if (i.itemid.typeuse == 'packet') {
                    count++;
                    var price = i.price;
                    child += `<div class="col text-center border-info border btn-warning"><br>` +
                        `<img id="imgcashshopitem" class="border border-danger" src="/images/item/vip.jpg" width="50%"><hr>` +
                        `<h5 name="nameitem">${i.itemid.name}</h5>` +
                        `<h5 name="priceitem" class="font-weight-bold"><i class="fas fa-gem"> </i>&nbsp;` + price.toLocaleString() + `</h5>` +
                        `<div class="container">` +
                        `<div class="row justify-content-center">` +
                        `<input type="hidden" name="idvip" value="${i._id}">` +
                        `</div></div>` +
                        `<button class="btn-buyvip btn btn-danger btn-block">Mua</button><br></div>&nbsp;&nbsp;`
                    if (count % 4 == 0) {
                        child += `</div><br>`
                        $("#listitemcashshop").append(child)
                        child = `<div class="row px-2 animated fadeInUp">`
                    }
                }

            })
            $("#listitemcashshop").append(child)

            $("#listitemcashshop .btn-buyvip").click(function () {
                let parent = $(this).parent()
                let iditem = parent.find('input[name=idvip]').val()
                let idname = parent.find('h5[name=nameitem]').text()
                let price = parent.find('h5[name=priceitem]').text()
                let r = confirm("Bạn có chắc muốn mua\n" +
                    "        Vật phẩm: " + idname.replace('Gói', "Gói VIP").toUpperCase() + "\n" +
                    "        Giá: " + price + " GEM \n Lưu ý: Thao tác sẽ không thể phục hồi!");
                if (r == true) {
                    $.blockUI()
                    setTimeout(function () {
                        $.ajax({
                            type: "POST",
                            url: "/ingame/buyitem",
                            data: { iditem: iditem, type: 1 },
                            async: false,
                            success: function (data) {
                                if (data.status == '404' || data.status == '899') {
                                    alert('Lỗi không xác định! Vui lòng F5 lại trang');
                                    $.unblockUI()
                                    return;
                                } else if (data.status == '900') {
                                    alert('Bạn không đủ tiền để mua vật phẩm này :)');
                                    $.unblockUI()
                                    return;
                                }
                                var message = `<div class="row px-2 d-flex justify-content-center"><h1>+</h1><img src="` + parent.find("#imgcashshopitem").attr('src') +
                                    `" width="50px" height="50px"/>` +
                                    `<h1 class="display-5 float-right">` + idname + `</h1></div>`

                                $.unblockUI()
                                if (data.status == "200") {
                                    $.growlUI('Giao dịch thành công', message, 7 * 1000);
                                    transHistory = getJson('/ingame/transhistory');
                                }
                                getCharacterInfo();
                                $("#gemcurrent").text(character.gem.toLocaleString())
                            },
                            error: function (xhr) {
                                alert('Lỗi - vui lòng F5 để load lại trang');
                                window.location.reload(true);
                            }
                        })
                    }, 1500)
                }
            })
            $.unblockUI();
        }, 500)
    })


    //ajax get
    function getJson(url) {         //khai báo
        return $.ajax({
            url: url,
            method: 'GET',
            async: false,
            contentType: "application/json",
            success: function (data) {
                return data
            },
            error: function () {
                // Uh oh, something went wrong
                alert('Lỗi - vui lòng F5 để load lại trang');
                window.location.reload(true);
            }
        }).responseJSON
    }

    //lấy level
    var levelAll = getJson('/ingame/level')
    //lấy data pokestop
    var pokestop = getJson('/ingame/pokestopposition')

    //pokemon
    var pokemon = getJson('/ingame/pokemonposition')

    //thong tin nhan vat =========BAO CHO
    var character
    var vipflag

    //Lịch sử giao dịch
    var transHistory = getJson('/ingame/transhistory')


    //lấy datapokemon server
    var pokemonserver = getJson('/ingame/pokemonserver')

    //xuất thông tin cashshop lên modal
    function getCashshopInfomation(typeitem) {
        var cashshop = getJson('/ingame/cashshop')
        $("#vipbenefit,#hrcashshop").hide()
        $("#listitemcashshop").empty()
        var child = `<div class="row px-2 animated fadeInDown">`
        var count = 0;
        for (var i = 0; i < cashshop.length; i++) {
            if (cashshop[i].itemid.typeuse == typeitem) {
                count++;
                var price = `<h5 name="priceitem" class="font-weight-bold"><i class="fas fa-gem"> </i>&nbsp;` + cashshop[i].price.toLocaleString() + `</h5>`
                var bgitem = `btn-info`
                if (typeitem == 'vip') {
                    var normalprice = cashshop[cashshop.findIndex(item => item.itemid.name == cashshop[i].itemid.name &&
                        item.itemid.typeuse != 'vip')].price;
                    bgitem = `btn-warning`
                    price = `<h5 class="font-weight-bold"><i class="fas fa-gem"> </i>&nbsp;<del>&nbsp;` + normalprice.toLocaleString() + `&nbsp;</del></h5>` + price
                }
                child += `<div class="col text-center border-info border ` + bgitem + `"><br>` +
                    `<img id="imgcashshopitem" class="border border-danger" src="` + cashshop[i].itemid.image.value + `" width="50%"><hr>` +
                    `<h5 name="nameitem">` + cashshop[i].itemid.name + `</h5>` +
                    price +
                    `<div class="container">` +
                    `<div class="row justify-content-center">` +
                    `<input type="hidden" name="iditem" value="` + cashshop[i]._id + `">` +
                    `<div class="radio"><label><input type="radio" name="amount" value="1">x1</label></div>&nbsp;&nbsp;&nbsp;` +
                    `<div class="radio"><label><input type="radio" name="amount" value="5">x5</label></div>&nbsp;&nbsp;&nbsp;` +
                    `<div class="radio"><label><input type="radio" name="amount" value="10">x10</label></div></div></div>` +
                    `<button class="btn-buyitem btn btn-danger btn-block">Mua</button><br></div>&nbsp;&nbsp;`
                if (count % 4 == 0) {
                    child += `</div><br>`
                    $("#listitemcashshop").append(child)
                    child = `<div class="row px-2 animated fadeInDown">`
                    continue;
                }
            }
        }
        if (count == 0) {
            child += `</div><div class="container-fluid text-center mt-5">` +
                `<img src="/images/empty.gif" width="25%" height="25%"/>` +
                `<h5 class="display-5 font-italic">Không tìm được gì cả &#128049;</h5></div>`
        }
        $("#listitemcashshop").append(child)

        if (typeitem == 'skin') {
            $("#listitemcashshop").find('.radio').hide()
        }

        $("#listitemcashshop .btn-buyitem").click(function () {
            var parent = $(this).parent()
            var amount = typeitem == 'skin' ? 1 : parent.find('input[name=amount]:checked').val()
            var iditem = parent.find('input[name=iditem').val()
            var idname = parent.find('h5[name=nameitem]').text()
            for (var i = 0; i < character.bagid.items.length && typeitem == 'skin'; i++) {
                if (character.bagid.items[i].itemid.name == idname && character.bagid.items[i].itemid.typeuse == 'skin') {
                    alert("Bạn đã sở hữu thời trang này rồi!")
                    return;
                }
            }
            if (typeitem == 'vip' && vipflag == false) {
                var r = confirm("Xin lỗi!\nChỉ có VIP mới có thể mua được những vật phẩm này!\n" +
                    "Trở thành VIP ngay và luôn?")
                if (r == true) {
                    $("#becomevip").trigger('click')
                }
                return;
            }
            if (amount == undefined) {
                alert('Vui lòng chọn số lượng muốn mua :)')
                return;
            }
            var r = confirm("Bạn có chắc muốn mua\n" +
                "        Vật phẩm: " + idname.toUpperCase() + "\n" +
                "        Số lượng: " + amount + "\n" +
                "        Giá: " + (parseInt(amount) * parseInt($.trim(parent.find('h5[name=priceitem]').text()))).toLocaleString() + " GEM \n Lưu ý: Thao tác sẽ không thể phục hồi!");
            if (r == true) {
                $.blockUI()
                setTimeout(function () {
                    $.ajax({
                        type: "POST",
                        url: "/ingame/buyitem",
                        data: { iditem: iditem, amount: amount, type: 0 },
                        async: false,
                        success: function (data) {
                            if (data.status == '404' || data.status == '899') {
                                alert('Lỗi không xác định! Vui lòng F5 lại trang');
                                $.unblockUI()
                                return;
                            } else if (data.status == '900') {
                                alert('Bạn không đủ tiền để mua vật phẩm này :)');
                                $.unblockUI()
                                return;
                            } else if (data.status == '901') {
                                alert('Túi đầy!');
                                $.unblockUI()
                                return;
                            }
                            var message = `<div class="row px-2 d-flex justify-content-center"><h1>+</h1><img src="` + parent.find("#imgcashshopitem").attr('src') +
                                `" width="50px" height="50px"/>` +
                                `<h1 class="display-5 float-right">x` + amount + `</h1></div>`

                            $.unblockUI()
                            if (data.status == "200") {
                                transHistory = getJson('/ingame/transhistory');
                                $.growlUI('Giao dịch thành công', message, 7 * 1000);
                            }
                            getCharacterInfo();
                            getBagInformation();
                            $("#charactergem").text(character.gem.toLocaleString())
                            $("#gemcurrent").text(character.gem.toLocaleString())
                        },
                        error: function (xhr) {
                            alert('Lỗi - vui lòng F5 để load lại trang');
                            window.location.reload(true);
                        }
                    })
                }, 500)
            }
        })


    }

    //xuất thông tin túi lên modal
    function getBagInformation() {
        // character = getJson('/ingame/character')
        $("#deleteitem").hide()
        $("#deletepokemon").hide()
        $("#detailitemcol").hide()
        $("#detailpokemoncol").hide()
        //ITEM======================
        $("#listitem").empty()
        var child = ""
        var amountitems = 0;
        for (var i = 0; i < character.bagid.items.length; i++) {
            amountitems += character.bagid.items[i].amount
            child += `<li id="` + character.bagid.items[i].itemid._id + `" class="list-group-item list-group-item-success list-group-item-action row">`
                + `<img id="imgItem" src="` + character.bagid.items[i].itemid.image.value + `">`
                + `<p class="display-4 float-right" id="amountItem">x` + character.bagid.items[i].amount + `</p></a>`
        }
        $("#listitem").append(child)
        $("#limititem").text(amountitems + "/" + character.bagid.limit)
        $("#listitem li").click(function (e) {
            var iditem = $(this)[0].id;
            for (var i = 0; i < character.bagid.items.length; i++) {
                if (character.bagid.items[i].itemid._id === iditem) {

                    $("#imgdetailItem").attr("src", character.bagid.items[i].itemid.image.value)
                    var typeuse
                    if (character.bagid.items[i].itemid.typeuse == 'tool') typeuse = "Công cụ"
                    else if (character.bagid.items[i].itemid.typeuse == 'skin') typeuse = "Thời trang"
                    else if (character.bagid.items[i].itemid.typeuse == 'vip') typeuse = "VIP"
                    else typeuse = 'Khác'
                    $("#typeitem").text("Loại: " + typeuse)
                    $("#detailitem").text(character.bagid.items[i].itemid.detail)
                    $("#nameitem").text(character.bagid.items[i].itemid.name)
                    $("#iditemdelete").attr("value", character.bagid.items[i].itemid._id)
                    $("#deleteitem").show();
                    $("#detailitemcol").show()
                    break;
                }
            }
        })

        //POKEMON====================
        $("#listPokemon").empty()
        var child = ""
        $("#limitPokemon").text(character.bagid.pokebag.length + "/" + character.bagid.limit);
        for (var i = 0; i < character.bagid.pokebag.length; i++) {
            child += `<li id="` + character.bagid.pokebag[i].pokeid._id + `" class="list-group-item list-group-item-success list-group-item-action row">` +
                `<img id="imgPokemon" src="` + character.bagid.pokebag[i].pokeid.image.value + `" height="50px">` +
                `<h2 class="display-5 float-right font-weight-bold" id="namePokemon">` + character.bagid.pokebag[i].pokeid.name + `</h2></a>`
        }
        $("#listPokemon").append(child)
        $("#listPokemon li").click(function (e) {
            var idpoke = $(this)[0].id;
            for (var i = 0; i < character.bagid.pokebag.length; i++) {
                if (character.bagid.pokebag[i].pokeid._id === idpoke) {
                    var pinterestShare = $("#pinterest-share")
                    pinterestShare.empty()
                    pinterestShare.append(`<a class="social pinterest" href="#"` +
                        `data-media="` + window.location.origin + character.bagid.pokebag[i].pokeid.image.value + `"` +
                        `data-description="Đây là ` + character.bagid.pokebag[i].pokeid.name + `. Hãy vào pokebiz.tk để tỉ thí 500 hiệp với nó nhé!">Pinterest</a>`)
                    $(".pinterest").click(function (e) {
                        PinUtils.pinOne({
                            url: "https://pokebiz.tk",
                            media: $(".pinterest").attr('data-media'),
                            description: $(".pinterest").attr('data-description')
                        });
                    });

                    //Share lên tumblr
                    var tumblrShare = $("#tumblr-share")
                    tumblrShare.empty()
                    tumblrShare.append(`<a class="tumblr-share-button" data-posttype='photo' data-color='blue' ` +
                        `data-notes='right' data-href='pokebiz.tk' data-content='` + window.location.origin + character.bagid.pokebag[i].pokeid.image.value + `' ` +
                        `data-caption='Đây là Pokémon của mình, nó tên là ` + character.bagid.pokebag[i].pokeid.name + `. Hãy tham gia Pokebiz.tk để tỉ thí 500 hiệp với nó nhé :)' ` +
                        `data-tags='pokebiz, middlefield' href='https://embed.tumblr.com/share'></a>`)
                    $.getScript("https://assets.tumblr.com/share-button.js");

                    //================
                    $("#imgdetailPokemon").attr("src", character.bagid.pokebag[i].pokeid.image.value)
                    $("#lvPokemon").text("Cấp độ: " + character.bagid.pokebag[i].level)
                    $("#cpPokemon").text("Lực chiến: " + character.bagid.pokebag[i].cp)
                    $("#hpPokemon").text("Máu: " + character.bagid.pokebag[i].hp)
                    $("#catchdatePokemon").text("Ngày bắt: " + moment(character.bagid.pokebag[i].catchdate).format("DD/MM/YYYY hh:mm:ss"))
                    $("#namedetailPokemon").text(character.bagid.pokebag[i].pokeid.name)
                    $("#detailPokemon").text(character.bagid.pokebag[i].pokeid.detail)
                    $("#typePokemon").attr("src", character.bagid.pokebag[i].pokeid.type.value)
                    $("#deletecatchdate").attr("value", moment(character.bagid.pokebag[i].catchdate).format("DD:MM:YYYY:hh:mm:ss"))
                    $("#deletepokemon").show()
                    $("#detailpokemoncol").show()
                    break;
                }
            }
        })
    }

    function getCharacterInfo() {
        character = getJson('/ingame/character')
        var day_formatted = new Date(character.createdate)
        if (moment(new Date()).diff(character.isVIP, "months") <= 0 && moment(new Date()).diff(character.isVIP, "days") < 0) {
            vipflag = true;
            $("#VIP").show();
            $("#charactervip").show();
        }
        else {
            vipflag = false;
            $("#VIP").hide();
            $("#charactervip").hide();
        }
        document.getElementById('charactername').innerText = character.name;
        document.getElementById('characterlevel').innerText = character.level;
        document.getElementById('characterexpbar').style.width = ((character.exp / levelAll[character.level - 1].xpNext) * 100) + '%';
        document.getElementById('characterexpbar').innerText = character.exp + '/' + levelAll[character.level - 1].xpNext;
        document.getElementById('chracterdatestart').innerHTML = "<i class='fas fa-calendar-alt'/>"
        document.getElementById('chracterdatestart').innerHTML = document.getElementById('chracterdatestart').innerHTML + "&nbsp" + day_formatted.toLocaleDateString('en-GB');
        document.getElementById('main').src = character.imageid.value;
        document.getElementById('team').src = character.clanid.logo.value;
        document.getElementById('charactergender').innerHTML = "<i class='fas fa-venus-mars'/>"
        var temp = character.gender == true ? "Nam" : "Nữ";
        document.getElementById('charactergender').innerHTML = document.getElementById('charactergender').innerHTML + "&nbsp" + temp
        document.getElementById('charactergem').innerHTML = "<i class='fas fa-gem'/>"
        document.getElementById('charactergem').innerHTML = document.getElementById('charactergem').innerHTML + "&nbsp" + character.gem.toLocaleString();
        document.getElementById('charactervip').innerHTML = "<i class='fab fa-vimeo-v'/>"
        var vipdeadline = moment(character.isVIP)
        var remainday = parseInt(vipdeadline.diff(character.isVIP, "days")) - parseInt(moment(new Date()).diff(character.isVIP, "days"))
        document.getElementById('charactervip').innerHTML = document.getElementById('charactervip').innerHTML + "&nbsp Còn lại " + remainday + " ngày"
    }

    //get thông tin pokedex
    async function getPokedexInfo(typeName) {
        $("#listPokedex").empty();
        let child = `<tr class="text-center">`;
        let index = 1;
        let countCatched = 0;
        let countAmount = 0;
        pokemonserver.forEach(p => {
            if (p.type.name == typeName) {
                countAmount++;
                if (character.pokedex.indexOf(p._id.toString()) < 0) {
                    child += `<td><img class="uncatched" src="${p.image.value}" width="50px" height="50px"/></td>`;
                }
                else {
                    countCatched++;
                    child += `<td><img src="${p.image.value}" width="50px" height="50px"/></td>`;
                }

                index++;
                if (index == 7) {
                    child += `</tr><tr class="text-center">`;
                    index = 1;
                }
            }
        })
        child += `</tr>`;
        $("#listPokedex").append(child);
        $("#catchedPokemon").text(`Đã bắt: ${countCatched}/${countAmount}`);
        $("#amountPokemon").text(`Tổng Pokémon: ${pokemonserver.length}`);
    }

    $("#pokedexModal #typeSort").click((e) => {
        let temp = $("#pokedexModal #typeSort #row1, #row2").children();
        for (let i = 0; i < temp.length; i++) {
            if (temp[i] == e.target) $(temp[i]).addClass('selected');
            else $(temp[i]).removeClass('selected')
        }
        getPokedexInfo($(e.target).attr('data').toString())
    })

    //=========================MAP=========================================================================
    var pokeTarget = null;          //pokemon muốn bắt 
    var pokestopMarkers = [];       //mảng marker pokestop 
    var pokemonMarkers = [];        //mảng  marker pokemon  
    var pokemonNear = [];           //mảng marker pokemon gần
    var radiusCirle = 100;          //bán kính vòng tròn (met)
    var pokestoptarget = null;
    var playerOnMap = [];
    var socket = io({ 'reconnect': false });
    var myLatlng


    var map;
    // socket.idchar = character._id;
    // socket.connect('http://localhost:3000');

    //hàm kiểm tra xem có thấy đc pokemon ko
    function isVisible(marker) {
        if (google.maps.geometry.spherical.computeDistanceBetween(myMarker.getPosition(), marker.getPosition()) <= radiusCirle + 100) {
            marker.setVisible(true);
        }
        else {
            marker.setVisible(false);
        }
    }

    function hintLine(a, b) {
        var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };

        return new google.maps.Polyline({
            icons: [{
                icon: lineSymbol,
                offset: '100%'
            }],
            map: map,
            path: [a.getPosition(), b.getPosition()],
            strokeColor: "#207245",
            strokeOpacity: 1.0,
            strokeWeight: 5
        });
    }
    //hàm tạo top 9 gần nhất
    async function loadPokemonNear() {
        await pokemonNear.sort((a, b) => Number(a.distance) - Number(b.distance))
        var child = ""
        $("#PokeNearBar").empty()
        for (var i = 0; i < 7; i++) {
            child += " <img class='vl' id='poke" + i + "' src='" + pokemonNear[i].pokemon.img + "' style='margin-top:3%' width='60px'/> "
            //document.getElementById('poke' + (i + 1)).src = pokemonNear[i].pokemon.img;
        }
        child += "<p class='text-white'>Khoảng cách tăng dần từ trái qua phải &rarr;</p>"
        $("#PokeNearBar").append(child)
        document.getElementById('poke0').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[0].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
        document.getElementById('poke1').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[1].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
        document.getElementById('poke2').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[2].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
        document.getElementById('poke3').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[3].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
        document.getElementById('poke4').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[4].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
        document.getElementById('poke5').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[5].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
        document.getElementById('poke6').addEventListener('click', function () {
            var temp = hintLine(myMarker, pokemonNear[6].pokemon)
            setTimeout(function () { temp.setMap(null) }, 3000)
        })
    }

    //thêm event xa thì ko bắt đc...gần thì ok
    function clickEvenForPokemonMarker(marker) {
        //mở marker //Marker cho phép đặt lên map something
        google.maps.event.addListener(marker, 'click', (function (marker) {
            //thêm vô mảng pokemon gần đây
            pokemonNear.push({ pokemon: marker, distance: google.maps.geometry.spherical.computeDistanceBetween(myMarker.getPosition(), marker.getPosition()) });

            if (google.maps.geometry.spherical.computeDistanceBetween(myMarker.getPosition(), marker.getPosition()) < radiusCirle)
                return function () {
                    pokeTarget = marker;
                    //set Pokemon bắt
                    /*Bootstrap Modal Pop Up Open Code*/
                    $("#catchModal").modal('show');
                }
            else {
                return function () {
                    pokeTarget = marker;
                    var infowindow = new google.maps.InfoWindow({
                        content: '<strong>' + pokeTarget.title + ': </strong>Xa quá bồ! -.- >.<',
                        maxWidth: 100
                    });
                    infowindow.open(map, marker);
                    setTimeout(function () { infowindow.close(); }, 3000);
                }
            }
        })(marker));
    }

    //Event pokestop click
    function clickEvenForPokestopMarker(marker) {
        //mở marker
        google.maps.event.addListener(marker, 'click', (function (marker) {
            if (google.maps.geometry.spherical.computeDistanceBetween(myMarker.getPosition(), marker.getPosition()) < radiusCirle)
                return async function () {
                    pokestoptarget = marker;
                    //set Pokemon bắt
                    let cssOn = {
                        'animation-iteration-count': 2,
                        '-webkit-animation': 'rotateY 1s infinite linear',
                        'animation': 'rotateY 1s infinite linear'
                    };
                    let cssOff = {
                        'animation-iteration-count': '',
                        '-webkit-animation': '',
                        'animation': ''
                    };

                    $("#pokestopModal .modal-content").css('background-image', `url(${marker.imagebg})`);
                    $("#namepokestop").text(marker.namePokestop)
                    $("#detailpokestop").text(marker.detailPokestop)
                    $("#pokestopModal #spin").unbind('click');
                    $("#pokestopModal #spin").click(() => {
                        $("#pokestopModal .circle").css(cssOn);
                        setTimeout(function () {
                            $.blockUI()
                            $.ajax({
                                type: "POST",
                                url: "/ingame/spin",
                                data: { pokestoppositionid: marker.idPokestop },
                                async: true,
                                success: function (data) {
                                    if (data.status == '000') {
                                        alert('Pokestop này không tồn tại! >.<');
                                        $("#pokestopModal").modal('hide')
                                        $.unblockUI()
                                        return;
                                    } else if (data.status == '999') {
                                        alert('Bạn đã quay pokestop này rồi! Vui lòng quay lại sau!');
                                        $("#pokestopModal").modal('hide')
                                        $.unblockUI()
                                        return;
                                    } else if (data.status == '901') {
                                        alert('Bạn không nhận được vật phẩm vì túi đầy! EXP +' + data.exp);
                                        getCharacterInfo();
                                        getBagInformation();
                                        $("#pokestopModal").modal('hide')
                                        $.unblockUI()
                                        return;
                                    } else if (data.status == '903') {
                                        alert('Bạn không nhận được vật phẩm vì túi đầy! EXP +' + data.exp);
                                        alert('Lên cấp rồi!!!')
                                        getCharacterInfo();
                                        getBagInformation();
                                        $("#pokestopModal").modal('hide')
                                        $.unblockUI()
                                        return;
                                    } else if (data[data.length - 1].levelup == true) {
                                        alert('Lên cấp rồi!!!')
                                    }
                                    var message = `<h2>EXP +` + data[data.length - 1].exp + `</h2><div class="row px-2 d-flex justify-content-center">`


                                    for (var i = 0; i < data.length - 1; i++) {
                                        message += `<img src="` + data[i].item.image.value + `" width="50px" height="50px"/>` +
                                            `<h1 class="display-5 float-right">x` + data[i].amount + `</h1><br>`
                                    }
                                    message += `</div>`
                                    $.unblockUI()
                                    $.growlUI('Bạn nhận được', message, 7 * 1000);
                                    $("#pokestopModal").modal('hide')
                                    getCharacterInfo();
                                    getBagInformation();

                                },
                                error: function (xhr) {
                                    alert('Lỗi - vui lòng F5 để load lại trang');
                                    window.location.reload(true);
                                }
                            }).done(() => {
                                $("#pokestopModal .circle").css(cssOff);
                            });
                        }, 1000);
                    });
                    $("#pokestopModal").modal('show')
                }
            else {
                return function () {
                    pokestoptarget = marker;
                    var infowindow = new google.maps.InfoWindow({
                        content: '<strong>' + pokestoptarget.namePokestop + ': </strong>Xa quá bạn ei 😣'
                        // maxWidth: 200,
                        // maxHeight: 400
                    });
                    infowindow.open(map, marker);
                    setTimeout(function () { infowindow.close(); }, 3000);
                }
            }
        })(marker));
    }

    //=========================RẢI nhân vật====================
    function dropPlayer(data) {

        //Xóa pokemon marker hết thời gian tồn tại (ko tồn tại trong database cho dễ hiểu)
        if (playerOnMap.length != 0) {
            for (var i = 0; i < playerOnMap.length; i++) {
                playerOnMap[i].setMap(null);
            }
            playerOnMap = new Array();
        }

        //rải thôi
        for (var i = 0; i < data.length; i++) {
            if (data[i].data.char._id === character._id) continue;

            var image = {
                url: data[i].data.char.imageid.value,
                // This marker is 20 pixels wide by 32 pixels high.
                scaledSize: new google.maps.Size(100, 100),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(50, 50),
                shape: { coords: [17, 17, 18], type: 'circle' },
            };

            //lấy vị trí
            var location = new google.maps.LatLng(data[i].data.xpos, data[i].data.ypos)
            //tạo marker
            playerMarker = new google.maps.Marker({
                position: location,
                draggable: false,
                icon: image,
                map: map,
                idchar: data[i].data.char._id
            });
            playerMarker.setTitle(data[i].data.char.name);

            //thêm vô mảng marker pokemon
            playerOnMap.push(playerMarker);
        }
    }

    //=========================RẢI POKEMON====================
    function dropPokemon() {

        //Xóa pokemon marker hết thời gian tồn tại (ko tồn tại trong database cho dễ hiểu)
        if (pokemonMarkers.length != 0) {
            for (var i = 0; i < pokemonMarkers.length; i++) {
                pokemonMarkers[i].setMap(null);
            }
            pokemonMarkers = new Array();
        }

        //rải thôi
        for (var i = 0; i < pokemon.length; i++) {

            //lấy vị trí
            var location = new google.maps.LatLng(pokemon[i].xpos, pokemon[i].ypos)
            //tạo marker
            var Pokemarker = new google.maps.Marker({
                position: location,
                map: map,
                draggable: false,
                icon: { url: pokemon[i].pokeid.image.value, scaledSize: new google.maps.Size(50, 50) },
                zIndex: 9999,
                img: pokemon[i].pokeid.image.value,
                idPoke: pokemon[i]._id
            });
            //check xem e nó có đủ tầm bắt chưa
            clickEvenForPokemonMarker(Pokemarker);
            //bỏ vô mảng pokenear
            //pokemonNear.push({ pokemon: Pokemarker, distance: google.maps.geometry.spherical.computeDistanceBetween(myMarker.getPosition(), Pokemarker.getPosition()) });
            //check có thấy ko 
            isVisible(Pokemarker)
            //thêm title
            Pokemarker.setTitle(pokemon[i].pokeid.name);

            //thêm vô mảng marker pokemon
            pokemonMarkers.push(Pokemarker);
        }
        loadPokemonNear()
    }

    var myMarker;

    async function initMap() {
        await getCharacterInfo();
        getBagInformation();
        cashshopNof();
        getPokedexInfo("Bug");
        $("#gemcurrent").text(character.gem.toLocaleString())
        var mapOptions = {
            zoom: 18,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            center: myLatlng,
            draggable: vipflag,
            keyboard: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#f1ffb8"
                        },
                        {
                            "weight": "2.29"
                        }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "landscape.man_made",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#a1f199"
                        }
                    ]
                },
                {
                    "featureType": "landscape.man_made",
                    "elementType": "labels.text",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "hue": "#ff0000"
                        }
                    ]
                },
                {
                    "featureType": "landscape.natural.landcover",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#37bda2"
                        }
                    ]
                },
                {
                    "featureType": "landscape.natural.terrain",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#37bda2"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#afa0a0"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#f1ffb8"
                        }
                    ]
                },
                {
                    "featureType": "poi.attraction",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "poi.business",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi.business",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#e4dfd9"
                        }
                    ]
                },
                {
                    "featureType": "poi.business",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi.government",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi.medical",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#37bda2"
                        }
                    ]
                },
                {
                    "featureType": "poi.place_of_worship",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi.school",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi.sports_complex",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#84b09e"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#fafeb8"
                        },
                        {
                            "weight": "1.25"
                        },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#f1ffb8"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#f1ffb8"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#f1ffb8"
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#f1ffb8"
                        },
                        {
                            "weight": "1.48"
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#5ddad6"
                        }
                    ]
                }
            ]
        };

        map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);

        myLatlng = new google.maps.LatLng(character.xpos, character.ypos);
        var image = {
            url: character.imageid.value,
            // This marker is 20 pixels wide by 32 pixels high.
            scaledSize: new google.maps.Size(100, 100),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(50, 50),
            shape: { coords: [17, 17, 18], type: 'circle' },
        };

        //tạo marker ( Nhân vật)
        myMarker = new google.maps.Marker({
            position: myLatlng,
            draggable: false,
            icon: image,
            map: map,

        });

        //tạo circle
        var antennasCircle = new google.maps.Circle({
            strokeColor: "#2e6bcc",
            strokeOpacity: 0.8,
            strokeWeight: 4,
            fillColor: "#70a1ef",
            fillOpacity: 0.35,
            map: map,
            center: myLatlng,
            radius: radiusCirle
        });


        google.maps.event.addListener(myMarker, 'dragend', function (evt) {
            document.getElementById('dragStatus').innerHTML = '<p> Current Lat: ' + evt.latLng.lat().toFixed(4) + ' Current Lng: ' + evt.latLng.lng().toFixed(4) + '</p>';


            var point = myMarker.getPosition();
            map.setCenter(point); // setCenter takes a LatLng object
            map.panTo(point);
        });

        google.maps.event.addListener(myMarker, 'dragstart', function (evt) {
            //-------------
            //------------
        });

        function resetClickMarker() {
            for (var i = 0; i < pokemonMarkers.length; i++) {
                google.maps.event.clearInstanceListeners(pokemonMarkers[i])
                clickEvenForPokemonMarker(pokemonMarkers[i])
                isVisible(pokemonMarkers[i]);
            }
            for (var i = 0; i < pokestopMarkers.length; i++) {
                google.maps.event.clearInstanceListeners(pokestopMarkers[i])
                clickEvenForPokestopMarker(pokestopMarkers[i])
                //isVisible(pokestopMarkers[i]);
            }
        }
        ///di chuyển marker vs circle
        google.maps.event.addListener(map, 'idle', async function () {
            if (!this.get('dragging') && this.get('oldCenter') && this.get('oldCenter') !== this.getCenter()) {
                //do what you want to
                myMarker.setPosition(this.getCenter());
                //markerCircle.setPosition(this.getCenter());
                antennasCircle.setCenter(this.getCenter());
                pokemonNear = new Array();
                await resetClickMarker();
                loadPokemonNear();
                socket.emit('move', { char: character, xpos: this.getCenter().lat(), ypos: this.getCenter().lng() })

                //await postSettingPosCharacter(point.lat(), point.lng())
            }
            if (!this.get('dragging')) {
                this.set('oldCenter', this.getCenter())
            }

        });

        google.maps.event.addListener(map, 'dragstart', function () {
            this.set('dragging', true);
        });

        google.maps.event.addListener(map, 'dragend', function () {
            this.set('dragging', false);
            google.maps.event.trigger(this, 'idle', {});
        });

        //set center cho circle với nhân vật
        map.setCenter(myMarker.position);
        myMarker.setMap(map);

        ///dòng for để bỏ vị tris và random pokemon vs pokestop 
        for (var i = 0; i < pokestop.length; i++) {

            var location = new google.maps.LatLng(pokestop[i].xpos, pokestop[i].ypos);
            var pokestopImage = {
                url: 'https://pngimage.net/wp-content/uploads/2018/06/pokestop-png-6.png',
                // This marker is 20 pixels wide by 32 pixels high.
                scaledSize: new google.maps.Size(90, 150),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(45, 140)
            };
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                icon: pokestopImage,
                idPokestop: pokestop[i]._id,
                namePokestop: pokestop[i].name,
                detailPokestop: pokestop[i].detail,
                imagebg: pokestop[i].image
            });
            /// push vào mảng marker
            pokestopMarkers.push(marker);
            clickEvenForPokestopMarker(marker);
            ////////////////////////////////////////////////////////////////////////////
        }

        //Hàm rải pokemon có trong database
        dropPokemon()

        ///menu
        var myWrapper = $("#wrapper");
        $("#menu-toggle").click(function (e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
            myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
                // code to execute after transition ends
                google.maps.event.trigger(map, 'resize');
            });
        });

        // create the map
        // google.maps.event.addListener(map, 'click', function () {
        //     infowindow.close();
        // });

        // Add pokestopMarkers to the map
        // Set up three pokestopMarkers with info windows 
        // add the points    
        socket.emit('hello', { char: character, xpos: myMarker.getPosition().lat(), ypos: myMarker.getPosition().lng() })
    }

    initMap();

    //google.maps.event.addDomListener(window, 'load', initialize);

    //=========================SOCKET IO============================
    $(function () {
        $('#chatbox').submit(function (e) {
            e.preventDefault(); // prevents page reloading
            if ($('#m').val() != '') {
                let chaxbubble = new google.maps.InfoWindow({
                    content: `<div class="bg-light text-dark row px-2 ml-2">${vipflag == true ? `<img src="/images/vip.gif" height="25px"/>` : ``}
                <h5 class="font-weight-bold">${character.name}:</h5> <h5 class="font-weight-light">${sanitizeHtml($('#m').val())}</h5></div>`,
                    maxWidth: 400
                });
                chaxbubble.open(map, myMarker);
                setTimeout(function () { chaxbubble.close(); }, 3000);
                socket.emit('chat message', { sender: character, content: sanitizeHtml($('#m').val()), isVip: vipflag });
                $('#m').val('');
            }
            else {
                alert("Không có gì để gửi :(");
            }

        });

        socket.on('updateCharOnMap', function (data) {
            dropPlayer(data)
        })

        socket.on('updateMove', function (data) {
            if (data.char._id === character._id) return;
            for (var i = 0; i < playerOnMap.length; i++) {
                if (playerOnMap[i].idchar = data.char._id) {
                    var location = new google.maps.LatLng(data.xpos, data.ypos);
                    playerOnMap[i].setPosition(location)
                    break;
                }
            }

        })

        socket.on('userCount', function (data) {
            $("#userCount").text('Số người online: ' + data.userCount)
        });

        socket.on('chat message', function (data) {
            let idTag = new Date().getSeconds();
            let child = `<li class="mb-1 px-2 row">
            ${data.isVip == true ? `<img src="/images/vip.gif" height="25px"/>` : ``}
            <a href="#" class="${character._id} text-light font-weight-bold" id="fl${idTag}">${data.sender.name}:</a> 
            <p class="text-light"><small>&nbsp;${data.content}</small></p></li>`;
            $('#messages').append(child);
            $('#messages').scrollTop(document.getElementById('messages').scrollHeight);
            let chaxbubble = new google.maps.InfoWindow({
                content: `<div class="bg-light text-dark row px-2 ml-2">${data.isVip == true ? `<img src="/images/vip.gif" height="25px"/>` : ``}
                <h5 class="font-weight-bold">${data.sender.name}:</h5> <h5 class="font-weight-light">${data.content}</h5></div>`, maxWidth: 400
            });
            chaxbubble.open(map, playerOnMap[playerOnMap.findIndex(p => { return p.idchar == data.sender._id })]);
            setTimeout(function () { chaxbubble.close(); }, 3000);
            // console.log()
            // console.log($('#messages').scrollHeight)
            $(`#fl${idTag}`).click(function () {
                if (msg.sender.indexOf(character.name) > -1) {
                    alert('Bạn không thể follow chính bạn!')
                    return;
                }
                var result;
                $.ajax({
                    type: "POST",
                    url: "/ingame/follow",
                    data: { name: msg.sender },
                    async: true,
                    success: function (data) {
                        result = data;
                    },
                    error: function (xhr) {
                        alert('Lỗi - vui lòng F5 để load lại trang');
                        window.location.reload(true);
                    }
                })
                alert(result.content)
            })
        })

        socket.on('userAlready', () => {
            socket.disconnect();
            alert("Tài khoản đã bị đăng nhập ở một nơi khác.");
            window.location.replace(`${window.origin}/ingame/logout`);

        })

    });

    //=============================ANIMATION BALL=============================================
    var Screen = {
        height: window.innerHeight,
        width: window.innerWidth
    };

    var MAX_VELOCITY = Screen.height * 0.009;
    var Resources = {
        normalball: '/images/item/normal-ball.png',
        greatball: '/images/item/great-ball.png',
        ultraball: '/images/item/ultra-ball.png',
        masterball: '/images/item/master-ball.png',
        pokeballActive: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeballactive.png',
        pokeballClosed: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeballclosed.png'
    };
    //set số lượng bóng
    //số lượng bóng
    getCharacterInfo()
    document.getElementById('normalball').src = Resources.normalball;
    document.getElementById('normalballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng thường') === undefined ?
        'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng thường').amount;

    document.getElementById('greatball').src = Resources.greatball;
    document.getElementById('greatballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng tinh anh') === undefined ?
        'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng tinh anh').amount;

    document.getElementById('ultraball').src = Resources.ultraball;
    document.getElementById('ultraballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng siêu cấp') === undefined ?
        'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng siêu cấp').amount;

    document.getElementById('masterball').src = Resources.masterball;
    document.getElementById('masterballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng tối thượng') === undefined ?
        'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng tối thượng').amount;


    $('#modal').on('hidden.bs.modal', function () {
        getCharacterInfo()
        document.getElementById('normalball').src = Resources.normalball;
        document.getElementById('normalballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng thường') === undefined ?
            'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng thường').amount;

        document.getElementById('greatball').src = Resources.greatball;
        document.getElementById('greatballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng tinh anh') === undefined ?
            'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng tinh anh').amount;

        document.getElementById('ultraball').src = Resources.ultraball;
        document.getElementById('ultraballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng siêu cấp') === undefined ?
            'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng siêu cấp').amount;

        document.getElementById('masterball').src = Resources.masterball;
        document.getElementById('masterballnum').innerText = character.bagid.items.find(item => item.itemid.name === 'Bóng tối thượng') === undefined ?
            'x0' : 'x' + character.bagid.items.find(item => item.itemid.name === 'Bóng tối thượng').amount;
    })
    var linkBall = Resources.normalball;    //chọn bóng
    var idBall = '5c9742f813b44c2cecd19538';
    var tagId = 'normalballnum'
    var rateBall = 1;
    $("#normalball").click(function () {
        linkBall = Resources.normalball;
        idBall = '5c9742f813b44c2cecd19538'
        tagId = 'normalballnum'
        rateBall = 5;
        $("#normalballnum").addClass("bg-success")
        $("#greatballnum").removeClass("bg-success")
        $("#ultraballnum").removeClass("bg-success")
        $("#masterballnum").removeClass("bg-success")
        resetState();
    })
    $("#greatball").click(function () {
        linkBall = Resources.greatball;
        idBall = '5ca0b2a96cc6f43cac5062f6'
        tagId = 'greatballnum'
        rateBall = 10;
        $("#normalballnum").removeClass("bg-success")
        $("#greatballnum").addClass("bg-success")
        $("#ultraballnum").removeClass("bg-success")
        $("#masterballnum").removeClass("bg-success")
        resetState();
    })
    $("#ultraball").click(function () {
        linkBall = Resources.ultraball;
        idBall = '5ca4d63294257d1c90bce721'
        tagId = 'ultraballnum'
        rateBall = 15;
        $("#normalballnum").removeClass("bg-success")
        $("#greatballnum").removeClass("bg-success")
        $("#ultraballnum").addClass("bg-success")
        $("#masterballnum").removeClass("bg-success")
        resetState();
    })
    $("#masterball").click(function () {
        linkBall = Resources.masterball;
        idBall = '5ca4d65d94257d1c90bce722'
        tagId = 'masterballnum'
        rateBall = 20;
        $("#normalballnum").removeClass("bg-success")
        $("#greatballnum").removeClass("bg-success")
        $("#ultraballnum").removeClass("bg-success")
        $("#masterballnum").addClass("bg-success")
        resetState();
    })

    //set target
    $("#catchModal").on('show.bs.modal', function () {
        document.getElementById('target').style.backgroundImage = "url('" + pokeTarget.img + "')";
    });

    var Ball = {
        id: 'ball',
        size: 100,
        x: 0,
        y: 0,
        inMotion: false,
        moveBall: async function (x, y) {
            Ball.x = x;
            Ball.y = y;
            var BallElement = document.getElementById(Ball.id);
            BallElement.style.top = Ball.y + 'px';
            BallElement.style.left = Ball.x + 'px';
        },
        getElement() {
            return document.getElementById(Ball.id);
        },
        resetBall: function () {
            Ball.moveBall(Screen.width / 2 - (Ball.size / 2), Screen.height - (Ball.size + 50));
            var BallElement = document.getElementById(Ball.id);
            BallElement.style.transform = "";
            BallElement.style.width = BallElement.style.height = Ball.size + 'px';
            BallElement.style.backgroundImage = "url('" + linkBall + "')";  //gán hình
            Ball.inMotion = false;
        },
        savePosition: function () {
            var ballEle = document.getElementById('ball');
            var ballRect = ballEle.getBoundingClientRect();
            ballEle.style.transform = "";
            ballEle.style.top = ballRect.top + 'px';
            ballEle.style.left = ballRect.left + 'px';
            ballEle.style.height = ballEle.style.width = ballRect.width + 'px';
        }
    };

    //Initial Setup

    resetState();

    //Move omanyte
    // anime({
    //     targets: ['#target'],
    //     rotate: 20,
    //     duration: 700,
    //     loop: true,
    //     easing: 'easeInOutQuad',
    //     direction: 'alternate'
    // });

    window.onresize = function () {
        Screen.height = window.innerHeight;
        Screen.width = window.innerWidth;
        MAX_VELOCITY = Screen.height * 0.009;
        resetState();
    }

    /* Gesture Bindings */
    var touchElement = document.getElementById('touch-layer');
    var touchRegion = new ZingTouch.Region(touchElement);
    var CustomSwipe = new ZingTouch.Swipe({
        escapeVelocity: 0.1
    })

    var CustomPan = new ZingTouch.Pan();
    var endPan = CustomPan.end;
    CustomPan.end = function (inputs) {
        setTimeout(function () {
            if (Ball.inMotion === false) {
                Ball.resetBall();
            }
        }, 100);
        return endPan.call(this, inputs);
    }

    touchRegion.bind(touchElement, CustomPan, function (e) {
        Ball.moveBall(e.detail.events[0].x - Ball.size / 2, e.detail.events[0].y - Ball.size / 2);
    });

    touchRegion.bind(touchElement, CustomSwipe, function (e) {
        if (parseInt(document.getElementById(tagId).innerText.replace('x', '')) == 0) {
            alert('Hết bóng rồi bạn ei!');
            return;
        }
        Ball.inMotion = true;
        var screenEle = document.getElementById('screen');
        var screenPos = screenEle.getBoundingClientRect();
        var angle = e.detail.data[0].currentDirection;
        var rawVelocity = velocity = e.detail.data[0].velocity;
        velocity = (velocity > MAX_VELOCITY) ? MAX_VELOCITY : velocity;

        //Determine the final position.
        var scalePercent = Math.log(velocity + 1) / Math.log(MAX_VELOCITY + 1);
        var destinationY = (Screen.height - (Screen.height * scalePercent)) + screenPos.top;
        var movementY = destinationY - e.detail.events[0].y;

        //Determine how far it needs to travel from the current position to the destination.
        var translateYValue = -0.75 * Screen.height * scalePercent;
        var translateXValue = 1 * (90 - angle) * -(translateYValue / 100);

        anime.remove('#ring-fill');

        anime({
            targets: ['#ball'],
            translateX: {
                duration: 300,
                value: translateXValue,
                easing: 'easeOutSine'
            },
            translateY: {
                value: movementY * 1.25 + 'px',
                duration: 300,
                easing: 'easeOutSine'
            },
            scale: {
                value: 1 - (0.5 * scalePercent),
                easing: 'easeInSine',
                duration: 300
            },
            complete: function () {
                if (movementY < 0) {
                    throwBall(movementY, translateXValue, scalePercent);
                } else {
                    setTimeout(resetState, 400);
                }
            }
        })
        //End
    });

    function postUseItem(idx) {
        $.ajax({
            type: "POST",
            url: "/ingame/useitem",
            data: { type: 0, id: character._id, idx: idx, amount: 1 },
            success: function (jqXHR) {
                return jqXHR;
            },
            error: function (xhr) {
                return xhr.responseText;
            }
        });
    }

    function throwBall(movementY, translateXValue, scalePercent) {
        //Treat translations as fixed.
        Ball.savePosition();
        anime({
            targets: ['#ball'],
            translateY: {
                value: movementY * -0.5 + 'px',
                duration: 400,
                easing: 'easeInOutSine'
            },
            translateX: {
                value: -translateXValue * 0.25,
                duration: 400,
                easing: 'linear'
            },
            scale: {
                value: 1 - (0.25 * scalePercent),
                easing: 'easeInSine',
                duration: 400
            },
            complete: determineThrowResult
        })
        postUseItem(idBall);
        //update DOM num of ball
        document.getElementById(tagId).innerText = 'x' + parseInt(document.getElementById(tagId).innerText.replace('x', '') - 1);
        //resetNumOfBall();
    }

    function determineThrowResult() {
        //Determine hit-region
        var targetCoords = getCenterCoords('target');
        var ballCoords = getCenterCoords('ball');

        //Determine if the ball is touching the target.
        var radius = document.getElementById('target').getBoundingClientRect().width / 2;
        if (ballCoords.x > targetCoords.x - radius &&
            ballCoords.x < targetCoords.x + radius &&
            ballCoords.y > targetCoords.y - radius &&
            ballCoords.y < targetCoords.y + radius) {

            Ball.savePosition();
            var ballOrientation = (ballCoords.x < targetCoords.x) ? -1 : 1;
            anime({
                targets: ['#ball'],
                translateY: {
                    value: -1.15 * radius,
                    duration: 200,
                    easing: 'linear'
                },
                translateX: {
                    value: 1.15 * radius * ballOrientation,
                    duration: 200,
                    easing: 'linear'
                },
                scaleX: {
                    value: ballOrientation,
                    duration: 200,
                },
                complete: function () {
                    var ball = Ball.getElement();
                    ball.style.backgroundImage = "url('" + Resources.pokeballActive + "')";
                    emitParticlesToPokeball();
                }
            });
        } else {
            setTimeout(resetState, 400);
        }
    }


    function emitParticlesToPokeball() {
        $("#closemodalcatch").hide()
        $("#normalball").hide()
        $("#normalballnum").hide()
        $("#greatball").hide()
        $("#greatballnum").hide()
        $("#ultraball").hide()
        $("#ultraballnum").hide()
        $("#masterball").hide()
        $("#masterballnum").hide()
        var particles = [];
        var targetEle = getCenterCoords('target');
        var ballEle = Ball.getElement();
        var ballRect = ballEle.getBoundingClientRect();
        var particleLeft;
        var particleRight;
        var palette = [
            '#E4D3A8',
            '#6EB8C0',
            '#FFF',
            '#2196F3'
        ]
        var particleContainer = document.getElementById('particles');
        for (var i = 0; i < 50; i++) {
            var particleEle = document.createElement('div');
            particleEle.className = 'particle';
            particleEle.setAttribute('id', 'particle-' + i);;
            particleLeft = getRandNum(-60, 60) + targetEle.x;
            particleEle.style.left = particleLeft + 'px';
            particleRight = getRandNum(-60, 60) + targetEle.y;
            particleEle.style.top = particleRight + 'px';
            particleEle.style.backgroundColor = palette[getRandNum(0, palette.length)]
            particleContainer.appendChild(particleEle);
            anime({
                targets: ['#particle-' + i],
                translateX: {
                    value: ballRect.left - particleLeft,
                    delay: 100 + (i * 10)
                },
                translateY: {
                    value: ballRect.top + (Ball.size / 2) - particleRight,
                    delay: 100 + (i * 10),
                },
                opacity: {
                    value: 0,
                    delay: 100 + (i * 10),
                    duration: 800,
                    easing: 'easeInSine'
                }
            });
            anime({
                targets: ['#target'],
                opacity: {
                    value: 0,
                    delay: 200,
                    easing: 'easeInSine'
                }
            });
        }
        setTimeout(function () {
            var ball = Ball.getElement();
            ball.style.backgroundImage = "url('" + Resources.pokeballClosed + "')";
            ball.style.backgroundImage.zIndex = 20;
            document.getElementById('particles').innerHTML = "";
            Ball.savePosition();

            anime({
                targets: ['#ball'],
                translateY: {
                    value: "200px",
                    delay: 400,
                    duration: 400,
                    easing: 'linear'
                },
                complete: function () {
                    Ball.resetBall();
                }
            });
            setTimeout(function () {
                animateCaptureState();
                resetState();
            }, 750);

        }, 1000);
    }

    function postAddPokemon(pokeTarget) {
        return $.ajax({
            type: "POST",
            url: "/ingame/catch",
            data: { pokemonpositionid: pokeTarget.idPoke },
            success: function (data) {
                return data;
            },
            error: function (xhr) {
                return xhr.responseText;
            }
        });
    }
    function animateCaptureState() {
        var ballContainer = document.getElementById('capture-screen');
        ballContainer.classList.toggle('hidden');

        var duration = 500;
        anime({
            targets: ['#capture-ball'],
            rotate: 40,
            duration: duration,
            easing: 'easeInOutBack',
            loop: true,
            direction: 'alternate'
        });

        var ringRect = (document.getElementById('ring-active')).getBoundingClientRect();
        var viprate = vipflag == true ? 20 : 0;
        var successRate = (((150 - ringRect.width) / 150) * 120) + rateBall + viprate;
        console.log(`Tỉ lệ bắt trúng: ${successRate}`)
        var seed = getRandNum(0, 100);
        setTimeout(async function () {

            anime.remove('#capture-ball');

            if (seed < Math.floor(successRate)) {
                var captureBall = document.getElementById('capture-ball');
                var buttonContainer = document.getElementById('capture-ball-button-container');
                buttonContainer.classList.toggle('hidden');

                //Captured
                var captureStatus = document.getElementById('capture-status');
                captureStatus.classList.toggle('hidden');
                captureStatus.innerHTML = "Bắt thành công " + pokeTarget.title;

                makeItRainConfetti();

                anime({
                    targets: ['#capture-ball-button-container'],
                    opacity: {
                        value: 0,
                        duration: 800,
                        easing: 'easeInSine'
                    },
                    complete: function () {
                        setTimeout(function () {
                            var ballContainer = document.getElementById('capture-screen');
                            ballContainer.classList.toggle('hidden');
                            var buttonContainer = document.getElementById('capture-ball-button-container');
                            buttonContainer.classList.toggle('hidden');
                            buttonContainer.style.opacity = "";
                            document.getElementById('capture-status').classList.toggle('hidden');
                        }, 800);
                    }
                });
                var temp = await postAddPokemon(pokeTarget)
                if (temp.levelup == true) {
                    alert('Lên cấp rồi!!!');
                }
                getCharacterInfo();
                getBagInformation();
                getPokedexInfo("Bug");
                document.getElementById('expcatched').innerText = 'EXP +' + temp.exp;
                document.getElementById('lv').innerText = 'Lv: ' + temp.lv;
                document.getElementById('hp').innerText = 'HP: ' + temp.hp;
                document.getElementById('cp').innerText = 'CP: ' + temp.cp;
                document.getElementById('imgpokecatched').src = pokeTarget.img;
                document.getElementById('namepokemoncatched').innerText = pokeTarget.title;
                var pinterestShare = $("#pinterest-share-catched")
                pinterestShare.empty()
                pinterestShare.append(`<a class="social pinterest" href="#"` +
                    `data-media="` + window.location.origin + pokeTarget.img + `"` +
                    `data-description="Mình vừa bắt được ` + pokeTarget.title + `. Hãy vào pokebiz.tk để tỉ thí 500 hiệp với nó nhé!">Pinterest</a>`)
                $(".pinterest").click(function (e) {
                    PinUtils.pinOne({
                        url: "https://pokebiz.tk",
                        media: $(".pinterest").attr('data-media'),
                        description: $(".pinterest").attr('data-description')
                    });
                });

                //Share lên tumblr
                var tumblrShareCatched = $("#tumblr-share-catched")
                tumblrShareCatched.empty()
                tumblrShareCatched.append(`<a class="tumblr-share-button" data-posttype='photo' data-color='blue' ` +
                    `data-notes='right' data-href='pokebiz.tk' data-content='` + window.location.origin + pokeTarget.img + `' ` +
                    `data-caption='Mình vừa bắt được ` + pokeTarget.title + ` trong Pokebiz.tk! Hãy tham gia với mình nhé :)'` +
                    `data-tags='pokebiz, middlefield' href='https://embed.tumblr.com/share'></a>`)
                $.getScript("https://assets.tumblr.com/share-button.js");

                $('#catchModal').modal('hide');
                $('#catchedModal').modal('show')

                pokemonNear.shift();
                pokeTarget.setMap(null)
                loadPokemonNear();
                $("#closemodalcatch").show()
                $("#closemodalcatch").show()
                $("#normalball").show()
                $("#normalballnum").show()
                $("#greatball").show()
                $("#greatballnum").show()
                $("#ultraball").show()
                $("#ultraballnum").show()
                $("#masterball").show()
                $("#masterballnum").show()
            } else {
                var poofContainer = document.getElementById('poof-container');
                poofContainer.classList.toggle('hidden');

                var captureStatus = document.getElementById('capture-status');
                captureStatus.innerHTML = pokeTarget.title + " đã trốn thoát :(";
                captureStatus.classList.toggle('hidden');

                anime({
                    targets: ['#poof'],
                    scale: {
                        value: 20,
                        delay: 400,
                        easing: 'linear',
                        duration: 600
                    },
                    complete: function () {
                        var ballContainer = document.getElementById('capture-screen');
                        ballContainer.classList.toggle('hidden');

                        var poofEle = document.getElementById('poof');
                        poofEle.style.transform = "";
                        var poofContainer = document.getElementById('poof-container');
                        poofContainer.classList.toggle('hidden');

                        var captureStatus = document.getElementById('capture-status');
                        captureStatus.classList.toggle('hidden');
                    }
                })
                $("#closemodalcatch").show()
                $("#closemodalcatch").show()
                $("#normalball").show()
                $("#normalballnum").show()
                $("#greatball").show()
                $("#greatballnum").show()
                $("#ultraball").show()
                $("#ultraballnum").show()
                $("#masterball").show()
                $("#masterballnum").show()
            }
        }, duration * 6);

    }


    function makeItRainConfetti() {
        for (var i = 0; i < 100; i++) {
            var particleContainer = document.getElementById('capture-confetti');
            var particleEle = document.createElement('div');
            particleEle.className = 'particle';
            particleEle.setAttribute('id', 'particle-' + i);
            particleLeft = window.innerWidth / 2;
            particleEle.style.left = particleLeft + 'px';
            particleTop = window.innerHeight / 2;
            particleEle.style.top = particleTop + 'px';
            particleEle.style.backgroundColor = ((getRandNum(0, 2)) ? '#FFF' : '#4aa6fb')
            particleContainer.appendChild(particleEle);
            anime({
                targets: ['#particle-' + i],
                translateX: {
                    value: ((getRandNum(0, 2)) ? -1 : 1) * getRandNum(0, window.innerWidth / 2),
                    delay: 100
                },
                translateY: {
                    value: ((getRandNum(0, 2)) ? -1 : 1) * getRandNum(0, window.innerHeight / 2),
                    delay: 100,
                },
                opacity: {
                    value: 0,
                    duration: 800,
                    easing: 'easeInSine'
                },
                complete: function () {
                    document.getElementById('capture-confetti').innerHTML = "";
                }
            });
        }
    }

    function toggleInfoScreen() {
        var infoScreen = document.getElementById('info-screen');
        var infoButton = document.getElementById('info-button');
        infoScreen.classList.toggle('hidden');
        infoButton.innerHTML = (infoScreen.className === 'hidden') ? "?" : 'X';
    }

    /* * * * * * * * * * * * *
    * Universal Helpers
    * * * * * * * * * * * * */
    function resetState() {
        Ball.resetBall();
        document.getElementById('target').style.opacity = 1;
        //Adjust Ring
        var ring = document.getElementById('ring-fill');
        ring.style.height = "150px";
        ring.style.width = "150px";
        anime({
            targets: ['#ring-fill'],
            height: "5px",
            width: "5px",
            duration: 3000,
            loop: true,
            easing: 'linear'
        })

    }

    function getCenterCoords(elementId) {
        var rect = document.getElementById(elementId).getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    function getRandNum(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
});

