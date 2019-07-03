$(document).ready(() => {
    //Lấy vị trí
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Định vị không được hỗ trợ bởi trình duyệt này. Vui lòng thử lại!");
        }
    }

    function showPosition(position) {
        $("#xpos").val(position.coords.latitude)
        $("#ypos").val(position.coords.longitude)
    }

    getLocation();

    $("#male").click(() => {
        $("#male img").addClass('selected');
        $("#female img").removeClass('selected');
        $("#gender").val('true');
    })

    $("#female").click(() => {
        $("#male img").removeClass('selected');
        $("#female img").addClass('selected');
        $("#gender").val('false');
    })

    $("#mystic").click(() => {
        $("#mystic").addClass('selected2');
        $("#instinct, #valor").removeClass('selected2');
        $("#clan").val('5c9a623f1c9d44000036f9b6');
    })

    $("#instinct").click(() => {
        $("#instinct").addClass('selected2');
        $("#mystic, #valor").removeClass('selected2');
        $("#clan").val('5c9a622b1c9d44000036f9b4');
    })

    $("#valor").click(() => {
        $("#valor").addClass('selected2');
        $("#mystic, #instinct").removeClass('selected2');
        $("#clan").val('5c972db51c9d4400003faa2b');
    })


}) 