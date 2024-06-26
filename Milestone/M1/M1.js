$(document).ready(function() {
    var url = "https://www.googleapis.com/books/v1/volumes/Wfan6L9RGgYC";
    $.getJSON(url, function(data) {
        var content = '';
        var book = data.volumeInfo;
        content += '<h1>' + book.title + '</h1>';
        content += '<h2>' + book.subtitle + '</h2>';
        content += '<h3>Author(s): ' + book.authors.join(', ') + '</h3>';
        content += '<p>' + book.description + '</p>';
        content += '<p>Publisher: ' + book.publisher + ', ' + '<strong>'+book.publishedDate + '</strong>'+'</p>';
        content += '<img src="' + book.imageLinks.thumbnail + '" alt="Book cover image">';
        
        $.each(book.industryIdentifiers, function(i, identifier) {
            content += '<p>' + identifier.type + ': ' + identifier.identifier + '</p>';
        });

        $('#content').html(content);
    });
});