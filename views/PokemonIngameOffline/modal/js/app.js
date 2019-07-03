function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

var hasPaused = false;
document.addEventListener('click', function(e) {
  if (hasPaused) {
    return;
  }
  if (e.target.id == "errordot") {
  	var sun = document.getElementById('errordot');
    // var classes = sun.className.split(" ");
    if (sun.className == "rotateY") {
      	//sun.className = "";
        sun.setAttribute('class', 'paused');
        e.target.style.backgroundColor = 'green';
        hasPaused = true;
      }
      else {
      	sun.setAttribute('class', 'rotateY');
        e.target.style.backgroundColor = 'yellow';
      }
    }
});