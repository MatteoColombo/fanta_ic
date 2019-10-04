var cubers = [], myTeam = [], filteredCubers;
var maxCubers = 6;
var maxCredits = 2500;
var teamId;
var teamName;
var nameAvailable;
var teamInput;


$(document).ready(function () {
    /** Download the persons list */
    $.getJSON("/api/cubers", function (data) {
        cubers = data;
        filteredCubers = data;
        /** Download my team */
        $.getJSON("/api/cubers/team", function (data) {
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

    teamInput = $("#teamname");
    nameAvailable = true;

    teamInput.on("input", function () {
        var name = teamInput.val();
        if (name === "") {
            teamInput.removeClass("is-valid");
            teamInput.removeClass("is-invalid");
            setSaveButtonState();
        } else if (name.match(/^[A-Za-z0-9àèéìòùÀÈÉÌÒÙ!\s]+$/) ? false : true) {
            teamInput.removeClass("is-valid");
            teamInput.addClass("is-invalid");
            nameAvailable = false;
            setSaveButtonState();
        } else {
            $.ajax({
                url: "/api/team/exists?name=" + name.trim(),
                type: "GET",
                success: function (data) {
                    if (data.exists) {
                        teamInput.removeClass("is-valid");
                        teamInput.addClass("is-invalid");
                        nameAvailable = false;
                    } else {
                        teamInput.removeClass("is-invalid");
                        teamInput.addClass("is-valid");
                        nameAvailable = true
                    }
                    setSaveButtonState();
                }
            });
        }
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
        msg += "<p class=\"person\">" + (c.wcaId ? "<a target=\"blank\" href=\"https://www.worldcubeassociation.org/persons/" + c.wcaId + "\">" : "") + c.name + (c.wcaId ? "<\a>" : "") + "</p > ";
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
    if (cuber.photoUrl) {
        msg += "<img src=\"" + cuber.photoUrl + "\" class=\"img-fluid team-usr-img rounded-circle\">";
    } else {
        msg += "<img src=\"/public/img/user" + i + ".png\" class=\"img-fluid team-usr-img\">";
    }
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
        var btn = $("#pl" + id + " button");
        btn.tooltip({ title: "Hai già raggiunto il numero massimo di cuber!", placement: "right", delay: { show: 0, hide: 2000 } });
        btn.tooltip('show');
        btn.on('hidden.bs.tooltip', function () {
            btn.tooltip("dispose");
        });
    } else {
        var credits = getTeamCredits();
        var cuber = findPerson(id);
        if ((credits + cuber.price) > maxCredits) {
            var btn = $("#pl" + id + " button");
            btn.tooltip({ title: "Questo cuber è oltre il tuo budget!", placement: "right", delay: { show: 0, hide: 2000 } });
            btn.tooltip('show');
            btn.on('hidden.bs.tooltip', function () {
                btn.tooltip("dispose");
            });
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
    if (myTeam.length < maxCubers || getTeamCredits() < 0 || $("#teamname").val() === "" || !nameAvailable) {
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
                teamId = data.id;
                $("#teamname").val(data.name);
                myTeam = data.cubers;
                printTeamList();
                printCubersList();
                updateCredits();
                setSaveButtonState();
                $("#findperson").val("");
                filterList("");
                $(".alert").removeClass("d-none");
                setTimeout(function () { $('.alert').addClass("d-none") }, 3000);
            },
            error: function (err) {
                alert("errore!");
                console.log(err);
            }
        });
    }
}
