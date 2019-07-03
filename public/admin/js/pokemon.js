$(document).ready(function () {
    //UPDATE=====================================================
    //Chọn type 
    $(".typeSelect").change(function () {
        var imgSrc = $("option:selected", this).attr('data');
        var idTag = $(this).attr('id');
        $(".img" + idTag).attr('src', imgSrc)
    })
    //chọn hình
    $(".imgSelect").change(function (e) {
        var imgSrc = $("option:selected", this).attr('data')
        var idTag = $(this).attr('id');
        $("#inputImg" + idTag).attr('disabled', '')
        $(".img" + idTag).attr('src', imgSrc)
    })
    //review
    function readURL(input) {
        var idTag = $(input).attr('id');
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#img' + idTag).attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $(".inputImg").change(function (e) {
        readURL(e.target);
    });

    $(".switchUpload").change(function (e) {
        var idTag = $(e.target).attr('id')
        if ($(e.target).prop('checked')) {
            $("#" + idTag.replace('switch', '')).prop('disabled', true)
            $("#input" + idTag).show();
            $("#imginput" + idTag).show();
            $("#imginput" + idTag).attr('src', '');
            $("#input" + idTag).val("");
            $("#" + idTag.replace('switch', '')).val("");
        }
        else {
            $("#" + idTag.replace('switch', '')).prop('disabled', false)
            $("#input" + idTag).hide();
            $("#imginput" + idTag).hide();
            $("#imginput" + idTag).attr('src', '');
            $("#input" + idTag).val("");
            $("#" + idTag.replace('switch', '')).val("");
        }

    })

    //CREATE===================================================
    //Chọn type 
    $(".typeSelectCreate").change(function () {
        var imgSrc = $("option:selected", this).attr('data');
        $("#imgTypeCreate").attr('src', imgSrc)
    })

    function readURLCreate(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#imgImgCreate').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#inputImg").change(function (e) {
        readURLCreate(this);
    });

    //UPDATE POKEMON POSITION======================================
    $(".dateappear").change(function (e) {
        var idTag = $(e.target).attr('id');
        var value = $(e.target).val();
        $("#show" + idTag).text(moment(value).format("HH:mm DD-MM-YYYY"));
        $("#input" + idTag).val(moment(value));
    })
    $(".selectpokeidPP").change((e) => {
        var idTag = $(e.target).attr('id');
        var srcImg = $(`#${idTag} option:selected`).attr('imageSrc');
        console.log(srcImg)
        $(".img" + idTag).attr('src', srcImg);
    });


    //CREATE POKEMON POSITION
    $("#selectCreatePP").change(() => {
        var srcImg = $("#selectCreatePP option:selected").attr('imageSrc');
        $("#imgcreatePP").attr('src', srcImg);
    });

    $("#createdate").change(function () {
        var value = $(this).val();
        $("#showcreatedate").text(moment(value).format("HH:mm DD-MM-YYYY"));
        $("#inputcreatedate").val(moment(value));
    })

    $("#randomxposPP").click(() => {
        let value = (Math.random() * (11.1602136 - 10.3493704) + 10.3493704).toFixed(6);
        $("#createPP input[name=xpos]").val(value);
    })

    $("#randomyposPP").click(() => {
        let value = (Math.random() * (107.0265769 - 106.3638784) + 106.3638784).toFixed(6);
        $("#createPP input[name=ypos]").val(value);
    })
})