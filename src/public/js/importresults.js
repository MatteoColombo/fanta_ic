$(document).ready(function () {
    getOptions();

    function setOptions(data) {
        var select = $('#round-selector');
        select.empty();
        for (var i = 0; i < data.length; i++) {
            select.append(
                "<option value='/" + data[i].eventId + "/rounds/" + (data[i].importedRounds + 1) + "'>" + data[i].name + " - Round " + (data[i].importedRounds + 1) + "</option> "
            );
        }
    }

    function getOptions() {
        $.getJSON("/api/results/categories/importable", function (data) {
            if (data.length === 0) {
                $('#import-section').addClass("d-none");
                $('#comp-finished').removeClass("d-none");
            } else {
                setOptions(data);
            }
        });
    }

    $('#import').click(function () {
        var value = $('#round-selector').children("option:selected").val();
        $('#import').prop("disabled", true);
        $('#progress').removeClass("d-none");
        $('#round-selector').prop("disabled", true);
        $.getJSON("/api/results/import/events" + value, function (data) {
            getOptions();
            $('#import').prop("disabled", false);
            $('#progress').addClass("d-none");
            $('#round-selector').prop("disabled", false);
        });
    });
});