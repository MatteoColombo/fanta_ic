$(document).ready(function () {
    getOptions();

    function setOptions(data) {
        var select = $('#round-selector');
        select.empty();
        for (var i = 0; i < data.length; i++) {
            select.append(
                "<option value='/" + data[i].id + "/rounds/" + (data[i].importedRounds + 1) + "'>" + data[i].name + " - Round " + (data[i].importedRounds + 1) + "</option> "
            );
        }
    }

    function getOptions(){
        $.getJSON("/api/results/categories/importable", function (data) {
            setOptions(data);
        });
    }

    $('#import').click(function () {
        var value = $('#round-selector').children("option:selected").val();
        console.log(value);
        $.getJSON("/api/results/import" + value, function(data){
            getOptions();
        });
    });
});