$(document).ready(function () {

    var cubers = [], myTeam = [];

    $.getJSON("/api/persons", function (data) {
        cubers = data;
        setCubers();
    });

    function setCubers() {
        cubers.forEach(c => {
            $("#cubers-list").append("<li class='list-group-item'><div class='row'><div class='col-md-6'>" + c.name + "</div><div class='col-md-1'><i class='fas fa-coins'></i></div><div class='col-md-2'>" + c.price + "</div>")
        });
    }
});