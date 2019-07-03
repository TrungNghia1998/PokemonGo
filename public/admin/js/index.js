$(document).ready(function () {
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
    var rechargeLogs = getJson('/admin/rechargelogs/api')

    //===============CHART theo tuần ============================================
    var dpsMCard = [];
    var dpsPaypal = [];
    var dpsBraintree = [];
    var chart = new CanvasJS.Chart("chartContainer", {
        axisY: {
            title: "M-Card (VND)",
            lineColor: "#C24642",
            tickColor: "#C24642",
            labelFontColor: "#C24642",
            titleFontColor: "#C24642",
            valueFormatString: "###,##0,.",
            suffix: "K"
        },
        axisY2: [{
            title: "Paypal (USD)",
            lineColor: "#7F6084",
            tickColor: "#7F6084",
            labelFontColor: "#7F6084",
            titleFontColor: "#7F6084",
            prefix: "$"
        }, {
            title: "Braintree (USD)",
            lineColor: "#369EAD",
            tickColor: "#369EAD",
            labelFontColor: "#369EAD",
            titleFontColor: "#369EAD",
            prefix: "$"
        }],
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },
        data: [{
            type: "line",
            name: "M-Card",
            color: "#C24642",
            axisYIndex: 0,
            showInLegend: true,
            dataPoints: dpsMCard
            // xValueFormatString: "DDDD"
        },
        {
            type: "line",
            name: "Paypal",
            color: "#7F6084",
            axisYType: "secondary",
            showInLegend: true,
            dataPoints: dpsPaypal
            // xValueFormatString: "DDDD"
        }, {
            type: "line",
            name: "Braintree",
            color: "#369EAD",
            axisYIndex: 1,
            axisYType: "secondary",
            showInLegend: true,
            dataPoints: dpsBraintree
        }]
    })

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    var initChart = function (logs) {
        for (var i = 0; i < logs.length; i++) {
            if (moment(new Date()).week() == moment(logs[i].date).week()) {
                switch (new Date(logs[i].date).getDay()) {
                    case 0:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[0] != undefined)
                                dpsMCard[0].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Chủ nhật", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[0] != undefined)
                                dpsPaypal[0].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Chủ nhật", y: logs[i].amount })
                        }
                        else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Chủ nhật", y: logs[i].amount })
                        }
                        break;
                    case 1:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[1] != undefined)
                                dpsMCard[1].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Thứ hai", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[1] != undefined)
                                dpsPaypal[1].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Thứ hai", y: logs[i].amount })
                        } else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Thứ hai", y: logs[i].amount })
                        }
                        break;
                    case 2:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[2] != undefined)
                                dpsMCard[2].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Thứ ba", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[2] != undefined)
                                dpsPaypal[2].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Thứ ba", y: logs[i].amount })
                        } else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Thứ ba", y: logs[i].amount })
                        }
                        break;
                    case 3:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[3] != undefined)
                                dpsMCard[3].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Thứ tư", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[3] != undefined)
                                dpsPaypal[3].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Thứ tư", y: logs[i].amount })
                        } else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Thứ tư", y: logs[i].amount })
                        }
                        break;
                    case 4:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[0] != undefined)
                                dpsMCard[0].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Thứ năm", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[0] != undefined)
                                dpsPaypal[0].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Thứ năm", y: logs[i].amount })
                        } else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Thứ năm", y: logs[i].amount })
                        }
                        break;
                    case 5:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[0] != undefined)
                                dpsMCard[0].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Thứ sáu", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[0] != undefined)
                                dpsPaypal[0].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Thứ sáu", y: logs[i].amount })
                        } else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Thứ sáu", y: logs[i].amount })
                        }
                        break;
                    default:
                        if (logs[i].method == "MCARD") {
                            if (dpsMCard[0] != undefined)
                                dpsMCard[0].y += logs[i].amount;
                            else
                                dpsMCard.push({ label: "Thứ bảy", y: logs[i].amount })
                        } else if (logs[i].method == "PAYPAL") {
                            if (dpsPaypal[0] != undefined)
                                dpsPaypal[0].y += logs[i].amount;
                            else
                                dpsPaypal.push({ label: "Thứ bảy", y: logs[i].amount })
                        } else {
                            if (dpsBraintree[0] != undefined)
                                dpsBraintree[0].y += logs[i].amount;
                            else
                                dpsBraintree.push({ label: "Thứ bảy", y: logs[i].amount })
                        }

                }
            }
        }
        chart.render();
    }
    initChart(rechargeLogs)

    //==============================================================================
    $("#adminTable #detail").click(function (e) {
        console.log(e)
    })
})