$(document).ready(function(){
    var bookTitle = '',
        bookAuthor = '',
        bookThumbnail = '';

    $('#searchsubmit').on('click', function(){
        var keyword = $('#keyword')[0].value;

        $.ajax({
            url: '/books',
            data: {keyword: keyword},
            type: 'GET',
            success: function(result){
                if(result.title){
                    console.log(result);
                    var authorStr = "Authors: "+result.authors.join(', ');
                    bookTitle = result.title;
                    bookAuthor = result.authors.join(', ');
                    bookThumbnail = result.thumbnail;

                    $("#bookimg").attr("src",result.thumbnail);
                    $("#booktitle").text(result.title);
                    $("#bookauthor").text(authorStr);
                    $("#searchresult").show();
                }else{
                    $("#searchresult").hide();
                    bookAuthor = '';
                    bookTitle = '';
                    bookThumbnail = '';
                }
            },
            error: function(err){
                $("#searchresult").hide();
                bookAuthor = '';
                bookTitle = '';
                bookThumbnail = '';
            }
        });
    });

    $("#addbook").on('click', function(){
        //console.log(book)
        $.ajax({
            url: '/books/add',
            method: 'POST',
            data: {
                title: bookTitle,
                thumbnail: bookThumbnail,
                author: bookAuthor
            },
            success: function(result){
                console.log(result)
                location.reload();
            },
            error: function(err){
                $("#searchresult").hide();
                bookAuthor = '';
                bookTitle = '';
                bookThumbnail = '';
            }
        })
    });

    $("#cancel").on('click', function(){
        $("#searchresult").hide();
        bookAuthor = '';
        bookTitle = '';
        bookThumbnail = '';
    });


});