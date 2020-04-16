
var selectedDisease = "malaria"; // default, gets updated on dropdown
window.onload = function() {
    clickDropDown()
};

function clickDropDown() {
    $("#malariaDrop").on("click", ()=>{
        selectedDisease = "malaria";
        document.getElementById("dropDownButton").innerHTML = "Malaria";
        updateMap();
        updateTreeMap();
    });
    $("#choleraDrop").on("click", ()=>{
        selectedDisease = "cholera";
        document.getElementById("dropDownButton").innerHTML = "Cholera";
        updateMap();
        updateTreeMap();
    });
    $("#hivAidsDrop").on("click", ()=>{
        selectedDisease = "hivAids";
        document.getElementById("dropDownButton").innerHTML = "HIV/AIDS";
        updateMap();
        updateTreeMap();
    });
}