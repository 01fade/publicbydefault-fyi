import Data from "../data/daysofyear.json";

console.log(d3, _, Data);

$(document).ready(function(){
    console.log("Yay");
    console.log(_.meanBy(Data, 'items'));
});