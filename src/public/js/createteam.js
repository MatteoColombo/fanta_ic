var cubers = [], myTeam = [], filteredCubers;
var maxCubers = 6;
var maxCredits = 2500;
var teamId;
var teamName;


$(document).ready(function () {
    /** Download the persons list */
    $.getJSON("/api/persons", function (data) {
        cubers = data;
        filteredCubers = data;
        /** Download my team */
        $.getJSON("/api/persons/team", function (data) {
            /** If team exists, save data and populate */
            if (data.id) {
                teamId = data.id;
                $("#teamname").val(data.name);
                myTeam = data.cubers;
            }
            printTeamList();
            printCubersList();
            updateCredits();
            setSaveButtonState();
        });
    });

    $("#teamname").on("input", function () {
        setSaveButtonState();
    });


    $("#findperson").on("input", function () {
        var query = $("#findperson").val();
        filterList(query);
    });

});

function filterList(query) {
    filteredCubers = cubers.filter(p => p.name.toLowerCase().startsWith(query.toLowerCase()));
    printCubersList();
}

/** Prints the list of cubers */
function printCubersList() {
    $("#cubers-list").empty();
    filteredCubers.forEach(c => {
        // If the cuber is already in the team, disable the add button
        var inTeam = myTeam.findIndex((p) => p.id === c.id) > -1;
        msg = "<div class=\"list-group-item d-flex\" id=\"pl" + c.id + "\">";
        msg += "<div class=\"flex-fill\">";
        msg += "<p class=\"person\">" + c.name + "</p>";
        msg += "<p>" + c.price + "€</p>";
        msg += "</div><button class=\"btn btn-warning\"" + (inTeam ? "disabled" : "") + " onclick=\"selectCuber(" + c.id + ")\">+</button></div>"
        $("#cubers-list").append(msg);
    });
}

/** Prints the list of cubers in the team */
function printTeamList() {
    $("#team").empty();
    for (var i = 0; i < maxCubers; i++) {
        if (i < myTeam.length) printTeamMember(myTeam[i], i);
        else printTeamMemberNoUser(i);
    }
}

/** Print a single cuber in the team */
function printTeamMember(cuber, i) {
    var msg = "<div class=\"col-4 text-center team-usr\" id=\"tp" + i + "\">";
    msg += "<button class=\"team-rm btn btn-danger\" onclick=\"deselectCuber(" + cuber.id + ")\">X</button>";
    msg += "<img src=\"/public/img/user" + i + ".png\" class=\"img-fluid team-usr-img\">";
    msg += "<p class=\"team-usr-p tpname\">" + cuber.name + "</p>";
    msg += "<p class=\"tpprice\">" + cuber.price + "€</p></div>";
    $("#team").append(msg);
}

function printTeamMemberNoUser(i) {
    var msg = "<div class=\"col-4 text-center team-usr\" id=\"tp" + i + "\">";
    msg += "<button class=\"team-rm btn btn-danger d-none\">X</button>";
    msg += "<img src=\"/public/img/nouser.png\" class=\"img-fluid team-usr-img\">";
    msg += "<p class=\"team-usr-p tpname\">Inserisci Cuber</p>";
    msg += "<p class=\"tpprice\"> - </p></div>";
    $("#team").append(msg);
}



function selectCuber(id) {
    if (myTeam.length === maxCubers) {

    } else {
        var credits = getTeamCredits();
        var cuber = findPerson(id);
        if ((credits + cuber.price) > maxCredits) {

        } else {
            myTeam.push(cuber);
            $("#pl" + id + " button").prop("disabled", true)
            printTeamList()
            updateCredits();
            setSaveButtonState();
            $("#findperson").val("");
            filterList("");
        }
    }
}

function setSaveButtonState() {
    if (myTeam.length < maxCubers || getTeamCredits() < 0 || $("#teamname").val() === "") {
        $("#save").prop("disabled", true)
    } else {
        $("#save").prop("disabled", false)
    }
}

function deselectCuber(id) {
    myTeam.splice(findIndex(id), 1);
    $("#pl" + id + " button").prop("disabled", false);
    printTeamList();
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
    var credits = getTeamCredits();
    $("#remaining-credits").text(maxCredits - getTeamCredits());
    $("#credits-indicator").width(((maxCredits - credits) / maxCredits) * 100 + "%");
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
            type: teamId ? "PUT" : "POST",
            url: "/api/team",
            data: team,
            success: function (data) {
                console.log("success");
                teamId = data.id;
                $("#teamname").val(data.name);
                myTeam = data.cubers;
                printTeamList();
                printCubersList();
                updateCredits();
                setSaveButtonState();
                $("#findperson").val("");
                filterList("");
            },
            error: function (err) {
                alert("errore!");
                console.log(err);
            }
        });
    }
}
