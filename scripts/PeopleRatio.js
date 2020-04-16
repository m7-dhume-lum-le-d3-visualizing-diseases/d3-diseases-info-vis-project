function showPeople() {
    var person = document.getElementById("person")
    var infectedIcon = '<i class="fa fa-male" style="font-size:60px;color:red;"></i>';
    var icon = '<i class="fa fa-male" style="font-size:60px;"></i>';
    var pictures = "";
    var text = "";
    var i;

    // Grab from session cases/deaths
    var tempSummedCases = sessionStorage.getItem("tempSummedCasesKey");
    var tempSummedDeaths = sessionStorage.getItem("tempSummedDeathsKey");

    var DeathRate = tempSummedDeaths / tempSummedCases * 100;
    for (i = 0; i < 100; i++) {
        if (i < Math.round(DeathRate)) {
            pictures += infectedIcon;
        }
        else {
            pictures += icon;
        }
    }
    document.getElementById("person").innerHTML = pictures;
    console.log(document.getElementById("test"));
    text = DeathRate + " out of 100 people in this country infected with this diseases died";
    document.getElementById("test").innerHTML = text;
}


