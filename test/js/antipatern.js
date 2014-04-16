module.exports = function (params) {
  var __expr0__ = "";
  if (params.c) {
    __expr0__ = "fail"
  };
  params.d = params.a - params.b;
  var __expr1__ = "";
  if (params.d) {
    __expr1__ = "good"
  }
  return ((params.c = params.a + params.b, params.c)) + __expr0__ + __expr1__
}