var pattern_1 = new RegExp('^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$');
var pattern_2 = new RegExp('^[A-Za-z0-9]{40}$');

var str_1 = "E5B3C054-4D4F-42AE-BB5C-C1D7708C5798";
var str_2 = "5181c8b9b5bf98f2e417824aa4d2560c3fc61592";

if(!str_2.match(pattern_1) && !str_2.match(pattern_2)){
    // doSomething
    console.log("str_2 不符合格式");
}else{
    console.log("str_2 符合格式");
}

// if(str_1.match(pattern_1)){
//     console.log("str_1 符合格式");
// }else{
//     console.log("str_1 不符合格式");
// }

// if(str_2.match(pattern_2)){
//     console.log("str_2 符合格式");
// }else{
//     console.log("str_2 不符合格式");
// }