function nick_visibility(e){
    str = $(e).html()
    if (str.includes(" (Ty)")) {
        str = str.substring(0,str.search("(Ty)")-2)
    }
    else {
        str = str.substring(0,str.search("<"))
    }

    if ($(e).find("span").html() == "visibility"){
        $(e).find("span").html("visibility_off")
        $(e).css('opacity',0.7)
        board.hidePaths(str)
    }
    else {
        $(e).find("span").html("visibility")
        $(e).css('opacity',1)
        board.showPaths(str)
    }
    
}

function mouseOverPath(e){
    str = $(e).html()
    if (str.includes(" (Ty)")) {
        str = str.substring(0,str.search("(Ty)")-2)
    }
    else {
        str = str.substring(0,str.search("<"))
    }
    board.selectPaths(str)

}

function mouseOutOfPath(e){
    str = $(e).html()
    if (str.includes(" (Ty)")) {
        str = str.substring(0,str.search("(Ty)")-2)
    }
    else {
        str = str.substring(0,str.search("<"))
    }
    board.unselectPaths(str)
}