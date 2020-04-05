
$(document).ready(function () {
    
    $('#hamburger').click(function () {
        $(this).toggleClass('open');
        $('nav').toggleClass('show');
    });
    
    $('#slideshow div:gt(0)').hide();

});