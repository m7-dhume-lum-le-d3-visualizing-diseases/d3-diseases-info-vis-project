
    var person = document.getElementById("person")
    var infectedIcon = '<i class="fa fa-male" style="font-size:60px;color:red;"></i>';
    var icon = '<i class="fa fa-male" style="font-size:60px;"></i>';
    var pictures = "";
    var text = "";
    var CongoCases = 127939;
    var CongoDeaths = 27458;
    var CongoPop = 81340000;
    var CongoDeathRate = CongoDeaths / CongoCases * 10;
    var CongoInfectedRate = CongoCases / CongoPop * 10;
    //document.getElementById("test").innerHTML = CongoInfectedRate;
    for (i = 0; i < 10; i++) {
        if (i < Math.round(CongoDeathRate)) {
            pictures += infectedIcon;
        }
        else {
            pictures += icon;
        }
    }
    document.getElementById("person").innerHTML = pictures;
    text = Math.round(CongoDeathRate) + " out of 10 people in Congo infected with malaria died";
    document.getElementById("test").innerHTML = text;
