let elements = document.getElementById("rowTbody").children;
console.log(elements);

for (let i = 0; i < elements.length; i++) {
  if (i <= 3 ){
    elements[i].style.backgroundColor = "green";
  }else
    if (i >= elements.length - 4 ) {
      elements[i].style.backgroundColor = "orange"; }
}