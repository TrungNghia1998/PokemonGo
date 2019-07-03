$(document).ready(() => {
    //Thêm pokestop
    $(`#create #search`).click(() => {
        var map = new google.maps.Map(document.getElementById('map'));
        var service = new google.maps.places.PlacesService(map);
        let keyword = $(`#create input[name=search]`).val();
        var child = ``;
        var resultTag = $(`#create #searchResults`);
        // $.post(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${keyword}&inputtype=textquery&fields=geometry,photos,formatted_address,name&key=AIzaSyDEHnr26FuYpc2KjXhuJ36jrvSbCNC5mAg`, (data) => {
        //     console.log(data);
        // })
        let request = {
            query: keyword
        }
        resultTag.empty();
        var color = ['success', 'info'];
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach((e, index) => {
                    child += `
                    <a class="list-group-item list-group-item-action list-group-item-${color[index % 2]}">
                    <div class="row"><div class="col-md-8">
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Tên: </label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="nameIP">${e.name}</label>
                    </div>
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Vĩ độ:</label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="xposIP">` + e.geometry.location.lat() + `</label>
                    </div>
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Kinh độ:</label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="yposIP">` + e.geometry.location.lng() + `</label>
                    </div>
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Địa chỉ: </label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="addressIP">${e.formatted_address}</label>
                    </div></div>
                    <div class="col-md-2">
                    <img name="imageIP" class="rounded" width="200px" src="${e.photos == undefined ? '/images/img_not_found.png' : e.photos[0].getUrl()}">
                    </div></div></a>`;
                });
                child += `</ul>`;
                resultTag.append(child);

                $(`#create #searchResults a`).click((e) => {
                    var target = $(e.currentTarget);
                    var a_list = $('#create #searchResults').find('a');
                    for (var i = 0; i < a_list.length; i++) {
                        $(a_list[i]).removeClass('active');
                    };
                    target.addClass('active');
                    $("#create #name").val(target.find('label[name=nameIP]').text());
                    $("#create #xpos").val(parseFloat(target.find('label[name=xposIP]').text()).toFixed(6));
                    $("#create #ypos").val(parseFloat(target.find('label[name=yposIP]').text()).toFixed(6));
                    $("#create #image").val(target.find('img[name=imageIP]').attr("src"));
                    $("#create #mota").text(target.find('label[name=addressIP]').text());
                });
            } else {
                child += `<div class="display-4 text-center bg-success text-light">Không tìm thấy gì cả! ${status}</div></ul>`;
                resultTag.append(child);
            }
        });
    });

    //Cập nhật pokestop
    $(`.modaledit`).click((e) => {
        var idModal = $(e.currentTarget).attr('id');
        if ($(e.target).hasClass('search btn btn-outline-success')) {
            var map = new google.maps.Map(document.getElementById('map'));
            var service = new google.maps.places.PlacesService(map);
            let keyword = $(`#${idModal} input[name=search]`).val();
            var child = ``;
            var resultTag = $(`#${idModal} #sr${idModal}`);

            let request = {
                query: keyword
            }
            resultTag.empty();
            var color = ['success', 'info'];
            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach((e, index) => {
                        child += `
                    <a class="list-group-item list-group-item-action list-group-item-${color[index % 2]}">
                    <div class="row"><div class="col-md-8">
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Tên: </label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="nameIP">${e.name}</label>
                    </div>
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Vĩ độ:</label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="xposIP">` + e.geometry.location.lat() + `</label>
                    </div>
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Kinh độ:</label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="yposIP">` + e.geometry.location.lng() + `</label>
                    </div>
                    <div class="row"><label class="col-sm-2 badge badge-${color[index % 2]} mr-2 rounded">Địa chỉ: </label>
                    <label class="col-sm badge badge-${color[(index + 1) % 2]} rounded" name="addressIP">${e.formatted_address}</label>
                    </div></div>
                    <div class="col-md-2">
                    <img name="imageIP" class="rounded" width="200px" src="${e.photos == undefined ? '/images/img_not_found.png' : e.photos[0].getUrl()}">
                    </div></div></a>`;
                    });
                    child += `</ul>`;
                    resultTag.append(child);

                    $(`#${idModal} #sr${idModal} a`).click((e) => {
                        var target = $(e.currentTarget);
                        var a_list = $(`#${idModal} #sr${idModal}`).find('a');
                        for (var i = 0; i < a_list.length; i++) {
                            $(a_list[i]).removeClass('active');
                        };
                        target.addClass('active');
                        $(`#${idModal} input[name=name]`).val(target.find('label[name=nameIP]').text());
                        $(`#${idModal} input[name=xpos]`).val(parseFloat(target.find('label[name=xposIP]').text()).toFixed(6));
                        $(`#${idModal} input[name=ypos]`).val(parseFloat(target.find('label[name=yposIP]').text()).toFixed(6));
                        $(`#${idModal} input[name=image]`).val(target.find('img[name=imageIP]').attr("src"));
                        $(`#${idModal} textarea[name=detail]`).text(target.find('label[name=addressIP]').text());
                    });
                } else {
                    child += `<div class="display-4 text-center bg-success text-light">Không tìm thấy gì cả! ${status}</div></ul>`;
                    resultTag.append(child);
                }
            });
        }
    });
})