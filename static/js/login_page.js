$(document).ready(function(){
    $('p.newaccount').click(function(){
        $("div.register-box").toggleClass("show")
        $("div.login-box").toggleClass("hidden")
    });

    $('.error_close').click(function(){
        $('.error').css("display","none")
    });

    $('.back_button').click(function(){
        $("div.register-box").toggleClass("show")
        $("div.login-box").toggleClass("hidden")
    });
});

function showError(x){
    $("#error_text").html(x)
    if (!$("#error_text").html()){
        $('.error').css('display', 'none')
    }
}
