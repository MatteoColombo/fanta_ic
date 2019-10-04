$(document).ready(function () {
    $.getJSON("/api/cubers", function (data) {
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
        $.get("/api/cubers/import", function (data) {
            $('#progress').addClass("d-none");
            populateTable(data);
        });
    });

    $('#computeprices').click(function () {
        $('#progress').removeClass("d-none");
        $('#computeprices').prop("disabled", true);
        $.get("/api/cubers/import/prices", function (data) {
            $('#progress').addClass("d-none");
            populateTable(data);
        });
    });

    function populateTable(data) {
        var tab = $('#persons');
        tab.empty();
        for (var i = 0; i < data.length; i++) {
            tab.append("<tr><td class=\"text-left\">" +
                (data[i].wcaId ? "<a href=\"https://www.worldcubeassociation.org/persons/" + data[i].wcaId + "\">" : "") +
                data[i].name +
                (data[i].wcaId ? "<\a>" : "") +
                "</td><td>" +
                data[i].price +
                "</td></tr>");
        }
    }

});