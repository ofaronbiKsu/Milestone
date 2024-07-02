$(document).ready(function () {
    const userId = '101165516868001481525'; 
    const shelfId = '1001'; 
    const booksPerPage = 30; 

    let books = [];
    let currentPage = 1;
    let totalBooks = 0;

    function fetchBooks(page, searchTerm = '') {
        const startIndex = (page - 1) * booksPerPage;
        let bookshelfApiUrl = `https://www.googleapis.com/books/v1/users/${userId}/bookshelves/${shelfId}/volumes?&maxResults=${booksPerPage}&startIndex=${startIndex}`;

        if (searchTerm !== '') {
            bookshelfApiUrl += `&q=${encodeURIComponent(searchTerm)}`;
        }

        $.ajax({
            url: bookshelfApiUrl,
            method: 'GET',
            success: function (data) {
                if (data.items) {
                    books = data.items.map(item => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        coverImage: item.volumeInfo.imageLinks?.thumbnail || '../imageNotFound.png',
                        authors: item.volumeInfo.authors || []
                    }));
                    totalBooks = data.totalItems;

                    
                    if (searchTerm === '') {
                        displayBooks('#bookshelf', books);
                    } else {
                        const filteredBooks = filterBooks(searchTerm);
                        displayBooks('#bookshelf', filteredBooks);
                        setupPagination(filteredBooks.length);
                    }
                    setupPagination(totalBooks);
                } else {
                    $('#bookshelf').html('<p>No books found.</p>');
                    $('#pagination').empty(); 
                }
            },
            error: function () {
                $('#bookshelf').html('<p>Failed to fetch books from bookshelf.</p>');
                $('#pagination').empty(); 
            }
        });
    }

   
    fetchBooks(currentPage);

    $('#searchButton').on('click', function() {
        const searchTerm = $('#searchInput').val().trim().toLowerCase();
        fetchBooks(currentPage, searchTerm);
    });

    $('#clearButton').on('click', function() {
        $('#searchInput').val('');
        fetchBooks(currentPage);
    });

    function filterBooks(searchTerm) {
        return books.filter(book =>
            book.title.toLowerCase().includes(searchTerm)
        );
    }

    function displayBooks(container, books) {
        const resultsContainer = $(container);
        resultsContainer.empty(); 

        books.forEach(book => {
            const bookElement = `
                <div class="book">
                    <a href="/M2/book-shelf/book-shelf-details/details.html?id=${book.id}">
                        <img src="${book.coverImage}" alt="book image">
                        <p>${book.title}</p>
                    </a>
                </div>
            `;
            resultsContainer.append(bookElement);
        });
    }

    function setupPagination(totalBooks) {
        const totalPages = Math.ceil(totalBooks / booksPerPage);
        const paginationContainer = $('#pagination');
        paginationContainer.empty();

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = `<button class="page-btn" data-page="${i}">${i}</button>`;
            paginationContainer.append(pageButton);
        }


        $('.page-btn').on('click', function() {
            currentPage = $(this).data('page');
            const searchTerm = $('#searchInput').val().trim().toLowerCase();
            fetchBooks(currentPage, searchTerm);
        });
    }


    $('#home-button').on('click', function() {
        window.location.href = '../M2.html';
    });
});
