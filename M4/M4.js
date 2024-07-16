$(document).ready(function () {
  const booksPerPage = 10;
  let currentPage = 1;
  let books = [];

  $("#searchButton").on("click", function () {
    const searchTerm = $("#searchInput").val().trim();
    if (searchTerm === "") {
      $("#milestoneTwoResults").html("<p>Search box is empty.</p>");
      return;
    }
    books = [];
    fetchBooks(searchTerm, 0, 50);
  });

  $("#clear-button").on("click", function () {
    $("#searchInput").val("");
    $("#milestoneTwoResults").empty();
    $("#selectedBook").empty().removeClass("show-details");
    $("#homePagePagination").empty();
    $("#currentHomePage").empty();
  });

  $("#home-button").on("click", function () {
    $("#searchInput").val("");
    window.location.href = "../#";
  });

  function fetchBooks(searchTerm, startIndex, totalResults) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      searchTerm
    )}&maxResults=40&startIndex=${startIndex}`;

    $.ajax({
      url: apiUrl,
      method: "GET",
      success: function (data) {
        if (data.items) {
          books = books.concat(
            data.items.map((item) => ({
              id: item.id,
              title: item.volumeInfo.title,
              coverImage:
                item.volumeInfo.imageLinks?.smallThumbnail ||
                "images/imageNotFound.png",
            }))
          );
        }

        if (
          books.length < totalResults &&
          books.length < 50 &&
          data.totalItems > books.length
        ) {
          fetchBooks(searchTerm, books.length, totalResults);
        } else {
          books = books.slice(0, totalResults);
          displayBooks(currentPage);
          setupPagination(books.length);
        }
      },
      error: function () {
        $("#milestoneTwoResults").html("<p>Book not found.</p>");
      },
    });
  }

  function displayBooks(page) {
    const startIndex = (page - 1) * booksPerPage;
    const endIndex = Math.min(startIndex + booksPerPage, books.length);

    const milestoneTwoResults = $("#milestoneTwoResults");
    milestoneTwoResults.empty();

    const template = $("#book-template").html();

    for (let i = startIndex; i < endIndex; i++) {
      const book = books[i];
      const rendered = Mustache.render(template, book);
      milestoneTwoResults.append(rendered);
    }

    milestoneTwoResults.find(".book").on("click", function () {
      const bookId = $(this).attr("data-book-id");
      showBookDetails(bookId);
    });
  }

  function setupPagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    const paginationContainer = $("#homePagePagination");
    const currentPageIndicator = $("#currentHomePage");

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
        displayBooks(currentPage);

        currentPageIndicator.text(`Page: ${currentPage} of ${totalPages}`);
      });
  }

  function showBookDetails(bookId) {
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
            data.volumeInfo.imageLinks?.thumbnail || "images/imageNotFound.png",
          price: data.saleInfo.listPrice
            ? `$${data.saleInfo.listPrice.amount}`
            : "Not for sale",
        };

        const template = $("#book-detail-template").html();
        const rendered = Mustache.render(template, book);

        $("#selectedBook").html(rendered).addClass("show-details");
        $("html, body").animate(
          {
            scrollTop: $("#selectedBook").offset().top,
          },
          500
        );

        $("#closeBookBtn").on("click", function () {
          $("html, body").animate(
            {
              scrollTop: 0,
            },
            500
          );
          $("#selectedBook").empty().removeClass("show-details");
        });
      },
      error: function () {
        $("#selectedBook").html("<p>Book details not found.</p>");
      },
    });
  }

  function loadBookshelfContent() {
    $.ajax({
      url: "book-shelf/shelf.html",
      method: "GET",
      success: function (data) {
        $("#myBookshelContainer").html(data);
      },
      error: function () {
        console.log("Failed to load second page content.");
      },
    });
  }

  loadBookshelfContent();
});
