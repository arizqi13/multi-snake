var randomlyGeneratedUID = Math.random().toString(36).substring(3,16) + +new Date;
var elem = document.getElementById("id");
elem.value = randomlyGeneratedUID;