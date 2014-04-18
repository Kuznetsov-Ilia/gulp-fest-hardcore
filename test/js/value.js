module.exports = function (params) {
  var value = "<script/>";
  return value + $.escapeHTML("" + value) + $.escapeJS("" + value) + $.escapeJSON("" + value)
}