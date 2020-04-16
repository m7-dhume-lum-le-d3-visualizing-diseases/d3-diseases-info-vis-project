
function showPeople() {
    var person = document.getElementById("person")
    var infectedIcon = '<i class="fa fa-male" style="font-size:60px;color:red;"></i>';
    var icon = '<i class="fa fa-male" style="font-size:60px;"></i>';
    var pictures = "";
    var text = "";
    var CongoCases = 127939;
    var tempSummedDeaths = 0;
    var i;
    var tempSummedCases = 0;
    var difference = 0;
    var tempSummedDeaths = 0;
    try {
        for (i = selectedMinYear; i < selectedMaxYear; i++) {
            difference = 2018-i; // ie. Min = 2013, Max = 2015. This iteration does: 2018-2013 = 4, 2018-2014 = 3, 2018-2015 = 2, and sums data[4], data[3], data[2].
            try{
                tempSummedCases += d.data[difference].cases; // We can sum for example, sum the years 2013-2015 with data[4] + data[3] + data[2].
            }
            catch(e){
                tempSummedCases += 0;
            }
        }
    }
    catch(e){
        tempSummedCases = 0; // Exception handle if it does not exist
    }
    i = 0;
    difference = 0;
    try{
        for (i = selectedMinYear; i < selectedMaxYear; i++) {
            difference = 2018-i;
            try{
                tempSummedDeaths += d.data[difference].deaths;
            }
            catch(e){
                tempSummedDeaths += 0;
            }
        }
    }
    catch(e){
        tempSummedDeaths = 0; // Exception handle if it does not exist
    }
    var CongoPop = 81340000;
    var DeathRate = tempSummedDeaths / tempSummedCases * 10;
    //var CongoInfectedRate = tempSummedCases / CongoPop * 10;
    //document.getElementById("test").innerHTML = CongoInfectedRate;
    for (i = 0; i < 10; i++) {
        if (i < Math.round(DeathRate)) {
            pictures += infectedIcon;
        }
        else {
            pictures += icon;
        }
    }
    document.getElementById("person").innerHTML = pictures;
    console.log(document.getElementById("test"));
    text = DeathRate + " out of 10 people in Congo infected with malaria died";
    document.getElementById("test").innerHTML = text;
}


