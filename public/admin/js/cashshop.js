$(document).ready(() => {
    function readURLCreate(input) {
        let idTag = $(input).attr('id');
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#preview' + idTag).attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $(".inputImgUpdate").change(function (e) {
        readURLCreate(e.target);
    });

    //Thêm vật phẩm
    $(`#inputImg`).change(e => {
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#createImg').attr('src', e.target.result);
            }

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    //thêm vật phâm3 vào cashshop
    $(`#itemidCash`).change(() => {
        $("#createCashImg").attr('src', $("#itemidCash option:selected").attr('data'));
    });

    //Sửa vật phẩm vào shop
    $(`.itemidCash`).change((e) => {
        let idTag = $(e.target).attr('id');
        ("#create" + idTag).attr('src', $("#idTag option:selected").attr('data'));
    })
})