import $ from "jquery"

$("[name='command-btn']").click(function () {
  $(".modal").css({ "display": "flex" })
})

$(".modal").click(function () {
  $(this).hide()
})

