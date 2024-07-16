$(document).ready(function () {
  const userId = "101165516868001481525";
  const shelfId = "1001";
  const booksPerPage = 10;

  let books = [];
  let currentPage = 1;
  let totalBooks = 0;

  function fetchBooks(page) {
    const startIndex = (page - 1) * booksPerPage;
    const bookshelfApiUrl = `https://www.googleapis.com/books/v1/users/${userId}/bookshelves/${shelfId}/volumes?&maxResults=${booksPerPage}&startIndex=${startIndex}`;

    $.ajax({
      url: bookshelfApiUrl,
      method: "GET",
      success: function (data) {
        if (data.items) {
          books = data.items.map((item) => ({
            id: item.id,
            title: item.volumeInfo.title,
            coverImage:
              item.volumeInfo.imageLinks?.thumbnail || "../imageNotFound.png",
            authors: item.volumeInfo.authors || [],
          }));
          totalBooks = data.totalItems;

          displayBooks("#bookshelf", books);
          setupPagination(totalBooks);
        } else {
          $("#bookshelf").html("<p>No books found.</p>");
          $("#pagination").empty();
        }
      },
      error: function () {
        $("#bookshelf").html("<p>Failed to fetch books from bookshelf.</p>");
        $("#pagination").empty();
      },
    });
  }

  fetchBooks(currentPage);

  function displayBooks(container, books) {
    const resultsContainer = $(container);
    resultsContainer.empty();

    books.forEach((book) => {
      const bookTemplate = $("#shelf-book-template").html();
      const rendered = Mustache.render(bookTemplate, book);
      resultsContainer.append(rendered);
    });

    $(".book-content").on("click", function () {
      const bookId = $(this).data("id");
      displayBookDetails(bookId);
    });
  }

  function setupPagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    const paginationContainer = $("#pagination");
    const currentPageIndicator = $("#currentPage");

    paginationContainer.empty();

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = `<button class="page-btn" data-page="${i}">${i}</button>`;
      paginationContainer.append(pageButton);
    }

    currentPageIndicator.text(`Page: ${currentPage} of ${totalPages}`);

    paginationContainer
      .off("click", ".page-btn")
      .on("click", ".page-btn", function () {
        currentPage = $(this).data("page");
        fetchBooks(currentPage);
        currentPageIndicator.text(`Page: ${currentPage} of ${totalPages}`);
      });
  }

  function displayBookDetails(bookId) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    $.ajax({
      url: apiUrl,
      method: "GET",
      success: function (data) {
        const book = {
          title: data.volumeInfo.title,
          authors: data.volumeInfo.authors || [],
          year: data.volumeInfo.publishedDate
            ? new Date(data.volumeInfo.publishedDate).getFullYear()
            : "N/A",
          publisher: data.volumeInfo.publisher,
          description: data.volumeInfo.description || "None",
          coverImage:
            data.volumeInfo.imageLinks?.thumbnail ||
            "../images/imageNotFound.png",
          price: data.saleInfo.listPrice
            ? `$${data.saleInfo.listPrice.amount}`
            : "Not for sale",
        };

        const bookDetailsTemplate = $("#shelf-book-details-template").html();
        const rendered = Mustache.render(bookDetailsTemplate, book);
        $("#selectedBook").html(rendered).addClass("show-details");
        $("html, body").animate(
          { scrollTop: $("#selectedBook").offset().top },
          500
        );

        $("#closeBtn").on("click", function () {
          $("html, body").animate({ scrollTop: 0 }, 500);
          $("#selectedBook").empty().removeClass("show-details");
        });
      },
      error: function () {
        $("#selectedBook").html("<p>Book details not found.</p>");
      },
    });
  }
});
