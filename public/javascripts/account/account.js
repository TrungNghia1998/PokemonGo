$(document).ready(function () {
    // if(window.location.href.indexOf('#exchange') != -1) {
    //     $('#exchange').modal('show');
    //   }
    
    //-============================EXCHANGE
    $('#submitex').hide()
    function checkBalance(cash) {
        var balance = $('#balance').attr('data')
        if (parseInt(cash) > parseInt(balance)) {
            $('#contentex').empty()
            $('#contentex').text("CASH của bạn không đủ, nhấp vào nút bên dưới sẽ chuyển hướng bạn đến trang nạp thẻ.")
            $('#contentex').append("<hr><button type='button' id='redirect' class='btn btn-danger float-right'>Nạp thẻ</button>")
            $('#redirect').click(function () {
                $('#exchange').modal('hide')
                $('#recharge').modal('show')
            })
            $('#title').text('Chuyển hướng đến nạp cash')
            $('#title').attr('class', 'text-danger')
            $('#submitex').hide()
        }
        else {
            $('#contentex').empty()
            $('#title').text('Xác nhận chuyển đổi')
            $('#title').attr('class', 'text-success')
            $('#contentex').text("Nhấp vào nút bên dưới để xác nhận.")
            $('#contentex').append("<hr>")
            $('#submitex').show()
        }
    }

    $('#gem1').click(function () {
        checkBalance(this.value)
    })
    $('#gem2').click(function () {
        checkBalance(this.value)
    })
    $('#gem3').click(function () {
        checkBalance(this.value)
    })
    $('#gem4').click(function () {
        checkBalance(this.value)
    })
    $('#gem5').click(function () {
        checkBalance(this.value)
    })
    $('#gem6').click(function () {
        checkBalance(this.value)
    })
    $('#gem7').click(function () {
        checkBalance(this.value)
    })
    $('#gem8').click(function () {
        checkBalance(this.value)
    })


    //===========================RECHARGE
    $('#rechargepaypal').hide();
    $('#rechargenganluong').hide();
    $('#rechargebraintree').hide();

    $("#paypal").click(function () {   
        $("#rechargepaypal").show()

        $("#mcash").attr('class', 'typerecharge')
        $("#rechargemcash").hide()

        $('#nganluong').attr('class', 'typerecharge')
        $('#rechargenganluong').hide()

        $('#braintree').attr('class', 'typerecharge')
        $('#rechargebraintree').hide()
 
        $(this).attr('class', 'typerecharge-selected')
    })

    $("#nganluong").off('click').on('click',function () {  
        $("#rechargenganluong").show()

        $("#mcash").attr('class', 'typerecharge')
        $("#rechargemcash").hide()

        $('#paypal').attr('class', 'typerecharge')
        $("#rechargepaypal").hide()

        $('#braintree').attr('class', 'typerecharge')
        $('#rechargebraintree').hide()
        
        $(this).attr('class', 'typerecharge-selected')
    })

    $("#mcash").click(function () {
        $("#rechargemcash").show()  

        $("#rechargepaypal").hide()
        $("#paypal").attr('class', 'typerecharge')

        $('#nganluong').attr('class', 'typerecharge')
        $('#rechargenganluong').hide()

        $('#braintree').attr('class', 'typerecharge')
        $('#rechargebraintree').hide()

        $(this).attr('class', 'typerecharge-selected')
    })

    $("#braintree").click(function(){
        $("#rechargebraintree").show()

        $("#rechargepaypal").hide()
        $("#paypal").attr('class', 'typerecharge')

        $('#nganluong').attr('class', 'typerecharge')
        $('#rechargenganluong').hide()

        $("#mcash").attr('class', 'typerecharge')
        $("#rechargemcash").hide()

        $(this).attr('class', 'typerecharge-selected')
    })

    //Ngân lượng
    $("#rechargenganluong #productNganLuong1").click(function () {
        $("#rechargenganluong #product").text('Cash x 20 (tặng thêm 10)')
        $("#rechargenganluong #price").text('20.000 VNĐ')
        $("#rechargenganluong #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('1')
    })

    $("#productNganLuong2").click(function () {
        $("#rechargenganluong #product").text('Cash x 50 (tặng thêm 25)')
        $("#rechargenganluong #price").text('50.000 VNĐ')
        $("#rechargenganluong #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('2')
    })

    $("#productNganLuong3").click(function () {
        $("#rechargenganluong #product").text('Cash x 100 (tặng thêm 50)')
        $("#rechargenganluong #price").text('100.000 VNĐ')
        $("#rechargenganluong #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('5')
    })

    $("#productNganLuong4").click(function () {
        $("#rechargenganluong #product").text('Cash x 200 (tặng thêm 100)')
        $("#rechargenganluong #price").text('200.000 VNĐ')
        $("#rechargenganluong #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('10')
    })

    $("#productNganLuong5").click(function () {
        $("#rechargenganluong #product").text('Cash x 500 (tặng thêm 250)')
        $("#rechargenganluong #price").text('500.000 VNĐ')
        $("#rechargenganluong #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('25')
    })

    //BrainTree
    $("#rechargebraintree #productBrainTree1").click(function () {
        $("#rechargebraintree #product").text('Cash x 23 (tặng thêm 2)')
        $("#rechargebraintree #price").text('0.99 $')
        $("#rechargebraintree #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('0.99')
    })

    $("#productBrainTree2").click(function () {
        $("#rechargebraintree #product").text('Cash x 230 (tặng thêm 23)')
        $("#rechargebraintree #price").text('9.99 $')
        $("#rechargebraintree #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('9.99')
    })

    $("#productBrainTree3").click(function () {
        $("#rechargebraintree #product").text('Cash x 2,300 (tặng thêm 230)')
        $("#rechargebraintree #price").text('99.99 $')
        $("#rechargebraintree #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('99.99')
    })

    $("#productBrainTree4").click(function () {
        $("#rechargebraintree #product").text('Cash x 23,000 (tặng thêm 2,300)')
        $("#rechargebraintree #price").text('999.99 $')
        $("#rechargebraintree #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('999.99')
    })

    $("#productBrainTree5").click(function () {
        $("#rechargebraintree #product").text('Cash x 230,000 (tặng thêm 23,000) ')
        $("#rechargebraintree #price").text('9,999.99 $')
        $("#rechargebraintree #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('9999.99')
    })

    //Paypal
    $("#rechargepaypal #product1").click(function () {
        $("#rechargepaypal #product").text('Cash x 23 (tặng thêm 2)')
        $("#rechargepaypal #price").text('0.99 $')
        $("#rechargepaypal #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('0.99')
    })
    $("#product2").click(function () {
        $("#rechargepaypal #product").text('Cash x 230 (tặng thêm 23)')
        $("#rechargepaypal #price").text('9.99 $')
        $("#rechargepaypal #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('9.99')
    })
    $("#product3").click(function () {
        $("#rechargepaypal #product").text('Cash x 2,300 (tặng thêm 230)')
        $("#rechargepaypal #price").text('99.99 $')
        $("#rechargepaypal #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('99.99')
    })
    $("#product4").click(function () {
        $("#rechargepaypal #product").text('Cash x 23,000 (tặng thêm 2,300)')
        $("#rechargepaypal #price").text('999.99 $')
        $("#rechargepaypal #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('999.99')
    })
    $("#product5").click(function () {
        $("#rechargepaypal #product").text('Cash x 230,000 (tặng thêm 23,000) ')
        $("#rechargepaypal #price").text('9,999.99 $')
        $("#rechargepaypal #contentrc").text('Xem lại giao dịch')
        $("input[name=price]").val('9999.99')
    })

    $("#processpayment").click(function () {
        var amount = $("input[name=product]:checked").val()
        if (amount == undefined) {
            alert('Vui lòng chọn số lượng CASH muốn mua :)')
            return
        } else {
            $("#rechargepaypal form").submit()
        }
    })

    $("#processpaymentNganLuong").click(function () {
        var amount = $("input[name=product]:checked").val()
        if (amount == undefined) {
            alert('Vui lòng chọn số lượng CASH muốn mua :)')
            return
        } else {
            $("#rechargenganluong form").submit()
        }
    })

    $("#processpaymentBrainTree").click(function () {
        var amount = $("input[name=product]:checked").val()
        if (amount == undefined) {
            alert('Vui lòng chọn số lượng CASH muốn mua :)')
            return
        } else {
            $("#rechargebraintree form").submit()
        }
    })

    //Thanh toán ngân lượng
    // $('#nganluong').off('click').on('click', function(){
    //     $('#nganluong').attr("href", "https://www.nganluong.vn/button_payment.php?receiver=nghia.trungnguyen1980@gmail.com&product_name=Test&price=20000&return_url=localhost:3000&comments=Test luôn");
    // });
})