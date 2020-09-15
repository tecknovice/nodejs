var fs = require("fs");
module.exports = function(url) {
  var data = fs
    .readFileSync(url)
    .toString() // convert Buffer to string
    .split("\n") // split string to lines
    .map((e) => e.trim()) // remove white spaces for each line
    .map((e) => e.split("|").map((e) => e.trim())) // split each line to array
    .map((e) => {
      return { id: e[0], value: e[1] };
    });
  return data;
}
