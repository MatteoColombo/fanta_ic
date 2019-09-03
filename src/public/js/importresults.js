$(document).ready(function () {
    console.log("here");

    $.getJSON("/api/results/categories/importable", function (data) {
        console.log(data);
        setOptions(data);
    });

    function setOptions(data) {
        var select = $('#round-selector');
        select.empty();
        for (var i = 0; i < data.length; i++) {
            select.append(
                "<option>" + data[i].name + " - Round " + (data[i].importedRounds + 1) + "</option> "
            );
        }
    }
});