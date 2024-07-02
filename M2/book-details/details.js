$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        $('#bookDetails').html('<p>No book ID provided.</p>');
        return;
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function (data) {
            const book = {
                title: data.volumeInfo.title,
                authors: data.volumeInfo.authors || [],
                year: data.volumeInfo.publishedDate ? new Date(data.volumeInfo.publishedDate).getFullYear() : 'N/A',
                publisher: data.volumeInfo.publisher,
                description: data.volumeInfo.description || 'None',
                coverImage: data.volumeInfo.imageLinks?.thumbnail || '../images/imageNotFound.png',
                price: data.saleInfo.listPrice ? `$${data.saleInfo.listPrice.amount}` : 'Not for sale'
            };

            const bookDetailsHtml = `
                <div class="book-detail">
                    <img src="${book.coverImage}" alt="book image">
                    <h1>${book.title}</h1>
                    <p><strong>Authors:</strong> ${book.authors.join(', ')}</p>
                    <p><strong>Publisher:</strong> ${book.publisher}</p>
                    <p><strong>Published:</strong>  ${book.year}</p>
                    <p><strong>Description:</strong> ${book.description}</p>
                    <p><strong>Price:</strong> ${book.price}</p>
                </div>
            `;

            $('#bookDetails').html(bookDetailsHtml);

            $('#returnHomeBtn').on('click', function() {
                window.location.href = '../M2.html';
            });
        },
        error: function () {
            $('#bookDetails').html('<p>Book details not found.</p>');
        }
    });
});
