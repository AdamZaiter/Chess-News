$(document).ready(function () {
  $("#hamburger").click(function () {
    $(this).toggleClass("open");
    $("nav").toggleClass("show");
  });

  $("#slideshow div:gt(0)").hide();
    const button = document.querySelector('.btn')
    const form   = document.querySelector('.form')

    button.addEventListener('click', function() {
    form.classList.add('form--no') 
});
});
