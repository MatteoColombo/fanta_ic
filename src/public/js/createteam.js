var cubers = [], myTeam = [];
var maxCubers = 6;
var maxCredits = 2500;
var teamId;
var teamName;


$(document).ready(function () {

    /** Download the persons list */
    $.getJSON("/api/persons", function (data) {
        cubers = data;
        /** Download my team */
        $.getJSON("/api/persons", function (data) {
            /** If team exists, save data and populate */
            if (data.id) {
                teamId = data.id;
                $("#teamname").val(data.name);
                myTeam = data.cubers;
                printTeamList();
            }
            updateCredits();
            setSaveButtonState();
            printCubersList();
        });
    });


});

/** Prints the list of cubers */
function printCubersList() {
    cubers.forEach(c => {
        // If the cuber is already in the team, disable the add button
        var inTeam = myTeam.findIndex((p) => p.id === c.id) > -1;
        $("#cubers-list").append(
            `<li class='list-group-item' id='p` + c.id + `'><div class='row'>
        <div class='col-md-6'>` + c.name + `</div>
        <div class='col-md-1'><i class='fas fa-coins'></i></div>
        <div class='col-md-2 price'>` + c.price + `</div>
        <div class='col-md-2'><button class='btn btn-info b-list' onclick="selectCuber(` + c.id + `)"` + (inTeam ? "disabled" : "") + `>
        <i class='fas fa-plus'></i></button></div></li>`)
    });
}

/** Prints the list of cubers in the team */
function printTeamList() {
    myTeam.forEach(cuber => printTeamMember(cuber));
}

/** Print a single cuber in the team */
function printTeamMember(cuber) {
    $("#team").append(`<li class="list-group-item back" id='t` + cuber.id + `'><div class="row">
    <div class="col-md-9">` + cuber.name + `</div>
    <div class="col-md-2"><button class="btn btn-info t-list" onclick="deselectCuber(` + cuber.id + `)">
    <i class="fas fa-times"></i></button></div>
    </div></li>`)
}

/** Select cuber to add him to the team */
function selectCuber(id) {
    /** If the team is full, refuse */
    if (myTeam.length === maxCubers) {
        alert("Limite cuber raggiunto!");
    } else {
        /** Get the person from the cubers list */
        cuber = findPerson(id);
        /** Add to the team */
        myTeam.push(cuber);
        /** Disable the add button */
        $("#p" + id + " button").prop("disabled", true)
        printTeamMember(cuber);
        updateCredits();
        setSaveButtonState();
    }
}

function setSaveButtonState() {
    if (myTeam.length < maxCubers || getTeamCredits() < 0) {
        $("#save").prop("disabled", true)
    } else {
        $("#save").prop("disabled", false)
    }
}

function deselectCuber(id) {
    /*delete cuber from team variable*/
    myTeam.splice(findIndex(id), 1);
    /** Re-enable add button */
    $("#p" + id + " button").prop("disabled", false)
    /** Remove row from team list */
    $("#t" + id).remove();
    updateCredits();
    setSaveButtonState();
}

function findPerson(id) {
    return cubers.find(p => p.id === id);
}

function findIndex(id) {
    return myTeam.findIndex(p => p.id === id);
}

function updateCredits() {
    $("#credits").text(maxCredits - getTeamCredits());
}

function getTeamCredits() {
    return myTeam.reduce((v, p) => v + p.price, 0);
}

function save() {
    if ($("#teamname").val() === "") {
        alert("È necessario inserire un nome per il team");
    } else {
        var team = {
            "team": {
                "name": $("#teamname").val(),
                "cubers": myTeam
            }
        }
        if (teamId !== undefined) {
            team.team["id"] = teamId;
        }
        $.ajax({
            type: teamId? "PUT":"POST",
            url: "/api/team",
            data: team,
            success: function (data) {
                teamId = data.id;
                $("#teamname").val(data.name);
                myTeam = data.cubers;
                $("#cubers-list").empty();
                $("#team").empty();
                printTeamList();
                updateCredits();
                setSaveButtonState();
                printCubersList();
                alert("Team aggiornato!");
            },
            error: function (err) {
                alert("errore!");
                console.log(err);
            }
        });
    }
}
