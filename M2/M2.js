$(document).ready(function () {
    const booksPerPage = 30;
    let currentPage = 1; 
    let books = [];

    $('#searchButton').on('click', function() {
        const searchTerm = $('#searchInput').val().trim();
        if (searchTerm === '') {
            $('#milestoneTwoResults').html('<p>Search box is empty.</p>');
            return; 
        }
        books = []; 
        fetchBooks(searchTerm, 0, 120); 
    });

    $('#clear-button').on('click', function(){
        $('#searchInput').val('');
        window.location.href = 'M2.html';
    });

    $('#home-button').on('click', function(){
        $('#searchInput').val('');
        window.location.href = '../#';
    });

    $('#bookshelf-button').on('click', function() {
        window.location.href = 'book-shelf/shelf.html';
    });

    function fetchBooks(searchTerm, startIndex, totalResults) {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=40&startIndex=${startIndex}`;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function (data) {
                if (data.items) {
                    books = books.concat(data.items.map(item => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        coverImage: item.volumeInfo.imageLinks?.smallThumbnail || 'images/imageNotFound.png'
                    })));
                }
                
                if (books.length < totalResults && data.totalItems > books.length) {
                    fetchBooks(searchTerm, books.length, totalResults);
                } else {
                    displayBooks(currentPage);
                    createPagination();
                }
            },
            error: function () {
                $('#milestoneTwoResults').html('<p>Book not found.</p>');
            }
        });
    }

    function displayBooks(page) {
        const startIndex = (page - 1) * booksPerPage;
        const endIndex = Math.min(startIndex + booksPerPage, books.length);

        const milestoneTwoResults = $('#milestoneTwoResults');
        milestoneTwoResults.empty();

        for (let i = startIndex; i < endIndex; i++) {
            const book = books[i];
            const title = book.title;
            const coverImage = book.coverImage;

            const bookElement = `
                <div class="book">
                <a href="book-details/details.html?id=${book.id}">
                    <img src="${coverImage}" alt="book image" onerror="this.onerror=null;this.src='images/imageNotFound.png';">
                    ${title}</a>
                </div>
            `;

            milestoneTwoResults.append(bookElement);
        }
    }

    function createPagination() {
        const totalPages = Math.ceil(books.length / booksPerPage);
        const pagination = $('#pagination');
        pagination.empty();

        for (let i = 1; i <= totalPages; i++) {
            pagination.append(`<button class="page-btn">${i}</button>`);
        }

        $('.page-btn').on('click', function () {
            const page = parseInt($(this).text());
            currentPage = page;
            displayBooks(currentPage);
        });
    }
});
