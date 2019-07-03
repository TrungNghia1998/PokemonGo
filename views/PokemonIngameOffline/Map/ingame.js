

function attachSecretMessage(marker, num) {
    var message = ['This', 'is', 'the', 'secret', 'message'];
    var infowindow = new google.maps.InfoWindow({
        content: message[num]
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(marker.get('map'), marker);
    });
}
function initialize() {
    var myLatlng = new google.maps.LatLng(10.8231995, 106.6296638);
    var mapOptions = {
        zoom: 14,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        center: myLatlng,
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

    var image = {
        url: 'https://scontent.fhan2-4.fna.fbcdn.net/v/t1.15752-9/55439586_412784232789541_5064298897669619712_n.png?_nc_cat=104&_nc_oc=AQmtTPbIiTkSyCBteXIy-0Uf04SOuWMgYkuM6BlWyEmCT3amDCWwPIyBLgD5TcR9KT0&_nc_ht=scontent.fhan2-4.fna&oh=885cb117f3fdc93d585936dc66729681&oe=5D14A741',
        // This marker is 20 pixels wide by 32 pixels high.
        scaledSize: new google.maps.Size(100, 100),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(70, 80)
    };
    //tạo marker ( Nhân vật)
    var myMarker = new google.maps.Marker({
        position: new google.maps.LatLng(10.8231995, 106.6296638),
        draggable: true,
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
        radius: 2000
    });

    //    google.maps.event.addListener(map,'idle',function(){
    //     myMarker.setPosition(this.getCenter());
    //     //markerCircle.setPosition(this.getCenter());
    //     antennasCircle.setCenter(myMarker.getPosition());});


    google.maps.event.addListener(myMarker, 'dragend', function (evt) {
        document.getElementById('dragStatus').innerHTML = '<p> Current Lat: ' + evt.latLng.lat().toFixed(4) + ' Current Lng: ' + evt.latLng.lng().toFixed(4) + '</p>';


        var point = myMarker.getPosition();
        console.log(point);
        map.setCenter(point); // setCenter takes a LatLng object
        map.panTo(point);
    });
    google.maps.event.addListener(myMarker, 'dragstart', function (evt) {
        //-------------
        //------------
    });

    //hàm lấy vị trí


    ///di chuyển marker vs circle
    google.maps.event.addListener(map, 'idle', function () {
        if (!this.get('dragging') && this.get('oldCenter') && this.get('oldCenter') !== this.getCenter()) {
            //do what you want to

            myMarker.setPosition(this.getCenter());
            //markerCircle.setPosition(this.getCenter());
            antennasCircle.setCenter(myMarker.getPosition());
            var point = myMarker.getPosition();
            console.log(point);
            var point1 = marker.getPosition();
            console.log(point1);
            var x = point.lat();
            console.log(x);
            var y = point.lng();
            console.log(y);
            var x1 = point1.lat();
            var y1 = point1.lng();


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
    // $('<div/>').addClass('centerMarker').appendTo(map.getDiv())
    // //do something onclick
    // .click(function () {
    //   var that = $(this);
    //   if (!that.data('win')) {

    //     that.data('win').bindTo('position', map, 'center');
    //   }
    //   that.data('win').open(map);
    // });
    //////////////////////////////////////////////////////////
    ///lấy vị tris đầu và cuối hcm
    var southWest = new google.maps.LatLng(11.159544, 106.458129);
    var northEast = new google.maps.LatLng(10.391145, 106.925713);
    var lngSpan = northEast.lng() - southWest.lng();
    var latSpan = northEast.lat() - southWest.lat();
    var markers = [];
    ///dòng for để bỏ vị tris và random pokemon vs pokestop 
    for (var i = 1; i < 50; i++) {

        var location = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random());

        var image1 = {
            url: 'https://pngimage.net/wp-content/uploads/2018/06/pokestop-png-6.png',
            // This marker is 20 pixels wide by 32 pixels high.
            scaledSize: new google.maps.Size(100, 100),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 0)
        };
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: image1,

        });
        /// push pokestop lên
        markers.push(marker);

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(marker.get('map'), marker);
        });
        ////////////////////////////////////////////////////////////////////////////
    }
    for (var i = 1; i < 20; i++) {
        setInterval(function () {
            var location = new google.maps.LatLng(
                southWest.lat() + latSpan * Math.random(),
                southWest.lng() + lngSpan * Math.random());
                var icons = [
                    "https://scontent.fsgn5-1.fna.fbcdn.net/v/t1.15752-9/56451944_305196193493547_4556476378500825088_n.png?_nc_cat=101&_nc_oc=AQlnN_OzMI6ReAlIhQCPMWj1kbvWOn40bRV7S3naKd5BTBULjz5jddzwi-iCgx8QcKLWMwFW4ZJYkVd1N4_ak4kT&_nc_ht=scontent.fsgn5-1.fna&oh=9b39f0f1c5985de6a4541e60e5cec3a2&oe=5D46E0E7",
                    "https://scontent.fsgn5-1.fna.fbcdn.net/v/t1.15752-9/55624268_609824182816811_3668043053085491200_n.png?_nc_cat=101&_nc_oc=AQlG5jHq6jQJl2d2L15HbSb39r7kQiu1u-7PAMRNMOjELKhtPnWwU-NdZ0bRcpgLe-UlmDYiH9Y9L7BBgAMl6wnR&_nc_ht=scontent.fsgn5-1.fna&oh=96602f491b570beb5e490732ff0c497c&oe=5D083E0E",
                    "https://scontent.fsgn5-2.fna.fbcdn.net/v/t1.15752-9/55810973_294812554776802_5838051678544199680_n.png?_nc_cat=107&_nc_oc=AQlvDf0O82sGFE6_OlxkXHsnJQngSabxQvnWX51al8Lqv4fi0tq9CHjvos_pXAogHDX9Q_bi_Oq5xUHMy5aKDrpR&_nc_ht=scontent.fsgn5-2.fna&oh=58e079d1e6c7b9b75ae2fc2c0a0ea560&oe=5D109C31",
                    "https://scontent.fsgn5-6.fna.fbcdn.net/v/t1.15752-9/55853766_425527331538527_6126591464139915264_n.png?_nc_cat=109&_nc_oc=AQkZgUkfgM-CTYyIDZq66DKflF4-XFZIZC33p01HlVQVf_B2yY1MVbYEv1JFSEDT9mcgnIdK4Xu8FD6_5jt7Hxea&_nc_ht=scontent.fsgn5-6.fna&oh=18a7a340390355f45330a34c04f38c1c&oe=5D42B402",
                    "https://scontent.fsgn5-7.fna.fbcdn.net/v/t1.15752-9/56295396_312154012812375_731409359728279552_n.png?_nc_cat=103&_nc_oc=AQni5DKuqV19KFNEaV8OXNWwn4-s_psxcm0lChzYHriBA08FyoShnVeJcGbJMwZ0szdWj1Bt9h7TejZo0-wtGCCG&_nc_ht=scontent.fsgn5-7.fna&oh=2b6f47c16b23db00485d2397b8473f63&oe=5D4B07DF",
                    "https://scontent.fsgn5-6.fna.fbcdn.net/v/t1.15752-9/55609024_408003269992866_4369859443899236352_n.png?_nc_cat=106&_nc_oc=AQmC9mGq3muTzEaIC1Ccv2olm-8FKcX4GOlHxOeQ-24gGQu9FxqeEmU3npZPTZDcPVva5BY57Ak-gIUV_SFr9tum&_nc_ht=scontent.fsgn5-6.fna&oh=5a76dadc17396a88295b76f8493ae758&oe=5D4691C2",
                    "https://scontent.fsgn5-2.fna.fbcdn.net/v/t1.15752-9/56162889_315282455855714_1122918920366325760_n.png?_nc_cat=105&_nc_oc=AQk3UYsW70Tk27GbO4eRslf4EABQ4fLeeDw_D9r-BExuo_6OeNk5Kmxqmsh5GlSuXIX0ZlBzwxYXRNGuReexF7tL&_nc_ht=scontent.fsgn5-2.fna&oh=7bc1415ca12dcae81aa9f5915de5a603&oe=5D43367B",
                    "https://scontent.fsgn5-6.fna.fbcdn.net/v/t1.15752-9/55704539_2354501998118488_6771783371195416576_n.png?_nc_cat=106&_nc_oc=AQl6wnTasa2StwR8Nz4ypW2uXzkUd_r_9yGWhIBEanxcWyJv02d7-Tz2jQNuFh1aDGk6Mfg4iqXk6LC_ZX4caNUQ&_nc_ht=scontent.fsgn5-6.fna&oh=e9e4929dc16c5858353203e3e472a51c&oe=5D3D2D49",
                    "https://scontent.fsgn5-2.fna.fbcdn.net/v/t1.15752-9/55776244_2778935538998592_7356629437258924032_n.png?_nc_cat=107&_nc_oc=AQm1ejyP2Y_3d-1OKXdaM9V-rpYQhgMjzvMiiF3QyX0oQ0gPZrZ-Lagq7m-N28jO97dbttqc7hBM2mzoUkQYBUoM&_nc_ht=scontent.fsgn5-2.fna&oh=ae37d752affc7436283eacd3a6b51e50&oe=5D058595",
                    "https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.15752-9/55939890_834018916949498_5920539527646019584_n.png?_nc_cat=111&_nc_oc=AQmllbudW5pP2ugmY80LE2GS5YJP3CkoJLxfgIGSfbonQC0YxtvRjleKG8_PiYw8AFbN_xRXff_6q9i2e4ZqnonJ&_nc_ht=scontent.fsgn5-3.fna&oh=52f47fd8c24402c7c6d343d1ee8b739a&oe=5D04D4B4",
                    "https://scontent.fsgn5-6.fna.fbcdn.net/v/t1.15752-9/56312153_642023582896371_4347193028872503296_n.png?_nc_cat=106&_nc_oc=AQnjSYFujAhNNfrvw1d33vBgTjsdrM5PXtDsJkidDw8W5uIzUm9dweLyHVL9Nq-mae1LHncGkl3SdulsMmXg-CKD&_nc_ht=scontent.fsgn5-6.fna&oh=881bbbfa9fb2a274d67d9766b0430530&oe=5D47D6DE",
                    "https://scontent.fsgn5-1.fna.fbcdn.net/v/t1.15752-9/56443032_1244948228992177_3264584189055336448_n.png?_nc_cat=101&_nc_oc=AQlv2Pupt05-PmvNXs1sj0WEqnRl19Jqd6veObHJZ2DWDei91l51Mt0PCXs_rorm8eAEOaG-pBF2zJfxe4hMxMeE&_nc_ht=scontent.fsgn5-1.fna&oh=291f938f674c6f2552466cc10a3fbefa&oe=5D4833B8",
                    "https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.15752-9/56264355_401341263758311_3612414765516718080_n.png?_nc_cat=111&_nc_oc=AQnvmw4JflxjY7wnNCciIdGnWEgjOSXdNfZBKkbbMu7VCvMf8IinGdg-BXXXQRuHFZIrAolsRilAgAjek1PFNHaf&_nc_ht=scontent.fsgn5-3.fna&oh=7b1f6efbd5180b2ebb6da4864d55a3a6&oe=5D4B739A",
                    "https://scontent.fsgn5-4.fna.fbcdn.net/v/t1.15752-9/56229321_780493819004146_7100634293902245888_n.png?_nc_cat=102&_nc_oc=AQk3ruWLwOU0A-FrFXO_RtUh3n_b4h26KfOVambPA65SfHv85qd3iWrz-1K3HsY3cTvLGZlpILASG_dYmeOIKcpX&_nc_ht=scontent.fsgn5-4.fna&oh=94f33a9b29232020b8da6c8e9d2cfd9c&oe=5D40F0AC",
                    "https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.15752-9/56248084_2126235270747648_4978567734078996480_n.png?_nc_cat=111&_nc_oc=AQlC2J4VEbRHGR3px8cDfr5Kerec3KYuucuhepVieBa_rCScQYr6Cwy7PRj8qjdpnAH681sFib_Hrx43BG30mBD9&_nc_ht=scontent.fsgn5-3.fna&oh=672c0277a83c97ce446c7fbb45a1cd66&oe=5D025EB9",
                    "https://scontent.fsgn5-2.fna.fbcdn.net/v/t1.15752-9/55698545_455630708509254_2639361320125726720_n.png?_nc_cat=105&_nc_oc=AQlhtQXfGIJKZE35AnH46jd8UIrAqEPgtlVM23OZ6fTCU8lRm-naaLHSpq-gKJXkNcmbwU2TnkDB8QcWvA4S8Poz&_nc_ht=scontent.fsgn5-2.fna&oh=54a172df0100887ef8ed2c486e0d0cfd&oe=5D0B6A8D"
            
                ];
            
                var Pokemarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    draggable: false,
                    icon: icons[Math.floor(Math.random() * icons.length)],
                    zIndex: 9999,
                    animation: google.maps.Animation.DROP
                });
                
                setTimeout(function () {
                    Pokemarker.setMap(null);
                    delete Pokemarker;
                }, 2000);
               

           Pokemarker.setTitle((i + 1).toString());
            attachSecretMessage(Pokemarker, i);
        }, 2000);
       
    }
    //set time out
   

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


    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });

    // Add markers to the map
    // Set up three markers with info windows 
    // add the points    

}

var infowindow = new google.maps.InfoWindow({
    size: new google.maps.Size(150, 50)
});

// This function picks up the click and opens the corresponding info window
function myclick(i) {
    google.maps.event.trigger(gmarkers[i], "click");
}

// A function to create the marker and set up the event window function 
function createMarker(latlng, name, html) {
    var contentString = html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        zIndex: Math.round(latlng.lat() * -100000) << 5
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
    });
    // save the info we need to use later for the side_bar
    gmarkers.push(marker);
    // add a line to the side_bar html
    var sidebar = $('#side_bar');
    var sidebar_entry = $('<li/>', {
        'html': name,
        'click': function () {
            google.maps.event.trigger(marker, 'click');
        },
        'mouseenter': function () {
            $(this).css('color', 'red');
        },
        'mouseleave': function () {
            $(this).css('color', '#999999');
        }
    }).appendTo(sidebar);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(myMarker, Pokemarker);
 if(distance > 400) {
    google.maps.event.addListener(Pokemarker, 'click', function() {
        Pokemarker.setVisible(false); // maps API hide call
      });
 }


}
google.maps.event.addDomListener(window, 'load', initialize);


//Bảo
function thongtinnhanvat(){
    
}



