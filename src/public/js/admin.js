$(document).ready(function () {
    $.getJSON("/api/persons", function (data) {
        populateTable(data);
        if (data.length > 0) {
            $('#importdata').prop("disabled", true);
        }
        if ($.grep(data, function (n, _) {
            return n.price > 10;
        }).length > 0) {
            $('#computeprices').prop("disabled", true);
        }
    });

    $('#importdata').click(function () {
        $('#progress').removeClass("d-none");
        $('#importdata').prop("disabled", true);
        $.get("/api/persons/import", function (data) {
            $('#progress').addClass("d-none");
            populateTable(data);
        });
    });

    $('#computeprices').click(function () {
        $('#progress').removeClass("d-none");
        $('#computeprices').prop("disabled", true);
        $.get("/api/persons/import/prices", function (data) {
            $('#progress').addClass("d-none");
            populateTable(data);
        });
    });

    function populateTable(data) {
        var tab = $('#persons');
        tab.empty();
        for (var i = 0; i < data.length; i++) {
            tab.append("<tr><td>" +
                data[i].name +
                "</td><td>" +
                data[i].price +
                "</td></tr>");
        }
    }

});