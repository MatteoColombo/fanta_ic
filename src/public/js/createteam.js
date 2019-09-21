$(document).ready(function () {

    var cubers = [], myTeam = [];

    $.getJSON("/api/persons", function (data) {
        cubers = data;
        setCubers();
    });

    $.getJSON("/api/persons/team", function (data) {
        myTeam = data;
        setTeam();
    });   

    function setCubers() {
        cubers.forEach(c => {
            $("#cubers-list").append(
            `<li class='list-group-item'><div class='row'>
            <div class='col-md-6'>` + c.name + `</div>
            <div class='col-md-1'><i class='fas fa-coins'></i></div>
            <div class='col-md-2'>` + c.price + `</div>
            <div class='col-md-2'><button class='btn btn-info b-list' id='a`+c.id+`' onclick="selectCuber(`+c.id+`)">
            <i class='fas fa-plus'></i></button></div>`)
        });
    }

    function setTeam() {
        myTeam.forEach(c => {
            $("#team").append(`<li class="list-group-item back"><div class="row">
            <div class="col-md-9">` + c.name + `</div>
            <div class="col-md-2"><button class="btn btn-info t-list" id='a`+c.id+`' onclick="deselectCuber(`+c.id+`)">
            <i class="fas fa-times"></i></button></div>
            </div></li>`)
        });
    }

    
    function selectCuber(id) {
        cuber = findPerson();
        $("#a"+id).attr("disabled");
        myTeam.push(cuber); /* Add cuber to the team */
        $("#team").append(`<li class="list-group-item back"><div class="row">
            <div class="col-md-9">` + cuber.name + `</div>
            <div class="col-md-2"><button class="btn btn-info t-list" id='a`+cuber.id+`' onclick="deselectCuber(`+cuber.id+`)">
            <i class="fas fa-times"></i></button></div>
            </div></li>`) /* visualize the new cuber */
    }

    function deselectCuber(id) {
        $("#a"+id).detach(); /* delete cuber from page */
        myTeam.splice(findIndex(id), 1); /*delete cuber from team variable*/
    }

    function findPerson(id) {
        for(c of cubers) {
            if(c.id === id)
                return c;
        }
    }

    function findIndex(id) {
        for(let i=0; i<myTeam.length; i++) {
            if(c[i].id === id)
                return i;
        }
    }
});