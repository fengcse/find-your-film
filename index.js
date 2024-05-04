document.addEventListener("DOMContentLoaded", function () {
  // Your JavaScript code here

  const indexHTML = document.URL.includes("index" || "searchBox" || "");
  const watchHTML = document.URL.includes("Watchlist");
  const searchBox = document.querySelector(".searchBox"); // input field
  const searchButton = document.querySelector(".searchButton");
  const myForm = document.querySelector("#myForm"); // input and search button form
  const toDisplayIndexPage = document.querySelector(".toDisplayIndexPage"); // main content
  const mains = document.querySelectorAll("main"); // index page main and watchlist main
  const watchListMain = document.querySelector(".watchListMain"); // watchlist main content region
  const toDisplayWatchList = document.querySelector(".toDisplayWatchList"); // watchlist page - main content
  const watchlistChecker = document.URL.includes("Watchlist");
  const tooltip = document.getElementById("tooltip"); // tooltip for search input box
  let notInWatchlistArray = [];

  let imdbIDArray = []; // array of imdbIDs (movie id's)
  let keyForLocalStorage = "watchlistArray"; // key for watch list array in localStorage
  let keyForMovieDetailArray = "movieDetailArray"; // key for movie detail array from search in localStorage
  let movieDetailArray = localStorage.getItem(keyForMovieDetailArray) || []; // array of movie details from localStorage
  let watchlistArray =
    JSON.parse(localStorage.getItem(keyForLocalStorage)) || []; // array of watchlist from localStorage or an empty array
  let inputValue = ""; // search input value declared as empty string

  getMovieDetailLocalStorage(); // get movie details (result from previous movie search) from localStorage

  // function to get movie details from localStorage
  function getMovieDetailLocalStorage() {
    if (localStorage.getItem(keyForMovieDetailArray)) {
      movieDetailArray = JSON.parse(
        localStorage.getItem(keyForMovieDetailArray)
      );
    }
  }

  // function to set movie details to localStorage
  function setMovieDetailLocalStorage() {
    localStorage.setItem(
      keyForMovieDetailArray,
      JSON.stringify(movieDetailArray)
    );
  }

  // get watch list Array from localStorage
  function getLocalStorage() {
    if (localStorage.getItem(keyForLocalStorage)) {
      watchlistArray = JSON.parse(localStorage.getItem(keyForLocalStorage));
    }
  }

  // set watch list Array to localStorage
  function setLocalStorage() {
    localStorage.setItem(keyForLocalStorage, JSON.stringify(watchlistArray));
  }

  // if movieDetailArray is not empty, display the movie details when the page loads
  if (movieDetailArray.length) {
    toStartUpCodeWithLocalStorageData();
  } else {
    // if movieDetailArray is empty, display the start exploring message on webpage
    if (toDisplayIndexPage) {
      const p = document.createElement("p");
      p.innerHTML = "<p>Start Exploring</p>";
      toDisplayIndexPage.innerHTML = "";

      toDisplayIndexPage.append(p);
      p.classList.add("start-exploring");
    }
  }

  // function to display movie details when the page loads
  function toStartUpCodeWithLocalStorageData() {
    if (toDisplayIndexPage) {
      toDisplayIndexPage.innerHTML = toDisplay(movieDetailArray);
    }
  }

  // when the user starts typing in the search box, hide the tooltip
  if (myForm) {
    searchBox.addEventListener("input", function () {
      tooltip.style.display = "none";
    });
  }

  // Search for movie, get imdbIDArray, get movieDetailArray, then toDisplay
  if (myForm) {
    myForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      inputValue = searchBox.value; // get input from search box
      inputValue = inputValue.trim(); // remove leading and trailing spaces

      // if the search box is empty, display the tooltip and stop execution.
      if (inputValue.length === 0) {
        tooltip.style.display = "block";
        return; // stop execution
      }

      // get an array of ID's of movies (imdbID's) from the search result
      // if no movies are found, the error is thrown, and the error message is displayed
      imdbIDArray = await getImdbIDArray();

      searchBox.value = "";

      ///////////////////////////////////
      // if you get the movie ID's (imdbID's) sucessfully,
      //Clear movieDetailArray from localStorage
      movieDetailArray = JSON.parse(
        localStorage.getItem(keyForMovieDetailArray)
      );
      movieDetailArray = [];
      // set new movieDetailArray to localStorage
      localStorage.setItem(
        keyForMovieDetailArray,
        JSON.stringify(movieDetailArray)
      );
      ///////////////////////////////////

      // get movie details from the array of movie ID's
      movieDetailArray = await imdbIdToMovieArray(imdbIDArray);
      console.log(movieDetailArray);
      if (toDisplayIndexPage) {
        setMovieDetailLocalStorage();
        toDisplayIndexPage.innerHTML = toDisplay(movieDetailArray);
      }
    });
  }

  // function to display error message when no movies are found (error is throw from getImdbIDArray function call)
  function displayUnableToFind() {
    const p = document.createElement("p");
    toDisplayIndexPage.innerHTML = "";
    p.innerHTML = `<p>Unable to find what you're looking for. Please try another search.</p>`;
    toDisplayIndexPage.append(p);
    p.classList.add("unable-to-find");
  }

  // function to get imdbIDArray (array of movie ID's) from the search result
  const getImdbIDArray = async () => {
    try {
      const inputValueArray = inputValue.split(" ");
      const searchValue = inputValueArray.join("+");
      const url = `https://www.omdbapi.com/?apikey=ae1152a9&s=${searchValue}`;
      const response = await fetch(url);
      const data = await response.json();
      const result = data.Search;
      console.log(result); // This is the array of movies

      if (!Array.isArray(result)) {
        displayUnableToFind(); // Call the function to display the error message
        console.error("No movies found.");
        return; // Stop execution by returning from the function
      }

      imdbIDArray = result.map((movie) => {
        return movie.imdbID;
      });
      console.log(imdbIDArray);
      return imdbIDArray;
    } catch (error) {
      displayUnableToFind(); // Call the function to display the error message
      console.error("Error fetching movie data:", error.message);
      throw error; // Re-throw the error if needed
    }
  };

  // iterate (map) through the array of imdbID's and get movie details of each movie from the API (omdbapi.com
  const imdbIdToMovieArray = async (imdbIDArray) => {
    const movieData = await Promise.all(
      imdbIDArray.map(async (imdbID) => {
        const url = `https://www.omdbapi.com/?apikey=ae1152a9&i=${imdbID}`;
        const response = await fetch(url);
        const data = await response.json();
        const result = data;
        // console.log(result);
        return result;
      })
    );
    return movieData;
  };

  // function to display movieArray or watchlistArray, return array of movies in strings,
  // for rendering on the webpage later.
  function toDisplay(movieDetailArray) {
    // Genre: "Comedy, Drama, Romance"
    // Plot: "A self-help seminar inspires a sixty-something woman to romantically pursue her younger co-worker."
    // Poster: "https://m.media-amazon.com/images/M/MV5BNDZlM2ZjMzctYTgxNS00NTcxLTk4YWItZGZhOWM5YTQ5MmIyXkEyXkFqcGdeQXVyMTU3NDU4MDg2._V1_SX300.jpg"
    // Runtime: "90 min"
    // Title: "Hello, My Name Is Doris"
    // imdbID: "tt3766394"
    // imdbRating: "6.6"
    const movieStringArray = movieDetailArray.map((movie) => {
      return ` <div class="movie" id=${movie.imdbRating}>
                <img class="poster-image" src="${movie.Poster}" alt="${
        movie.Title
      }" />
              <div class = "right-contents">
            
                <div class="movie-info">
                    <h3>${movie.Title}</h3>
                    <p>${movie.imdbRating} ⭐</p>  
                </div>
              <div class="overview">
                    <p>${movie.Runtime}</p>
                    <p>${movie.Genre}</p>
                    <p class="plot">${movie.Plot}</p>
              </div>
              <button class="addButton removeButton" id=${movie.imdbID} 
              data-status=${checkWatchStatus(movie.imdbID)}>
              ${updateButton(movie.imdbID)} 
              </button> 
            </div>
            </div>
    `;
    });
    return movieStringArray.join("");
  }

  // assign an "add to watchlist" button or an "remove from watchlist" button
  mains.forEach((main) => {
    main.addEventListener("click", (e) => {
      if (e.target.classList.contains("addButton")) {
        const buttonimdbID = e.target.id;
        const button = e.target;
        if (button.dataset.status === "notInWatchlist") {
          watchlistArray.unshift(buttonimdbID);
          button.dataset.status = "inWatchlist";
          // button.innerHTML = "Remove from Watchlist";
        } else {
          watchlistArray = watchlistArray.filter(
            (imdbID) => imdbID !== buttonimdbID
          );
          button.dataset.status = "notInWatchlist";
          // button.innerHTML = "Add to Watchlist";
        }

        setLocalStorage();
        toRenderIndexpage(); // render the index page
        toRenderWatchList(); // render the watchlist page
        console.log(watchlistArray);
      }
    });
  });

  // Reload the page when the tab is in focus
  window.addEventListener("focus", function () {
    var currentURL = window.location.href;
    if (currentURL.includes("Watchlist")) {
      console.log("Tab with Watch.html is in focus");
      window.location.reload(); // Reloads the page when in focus
    } else {
      console.log("Tab with Index.html is in focus");
      window.location.reload(); // Reloads the page when in focus
    }
  });

  // function to check if the movie is in the watchlist
  function checkWatchStatus(imdbID) {
    if (watchlistArray.includes(imdbID)) {
      console.log(watchHTML);
      console.log(watchListMain);
      return "inWatchlist";
    } else {
      return "notInWatchlist";
    }
  }

  // function to update content of the watchlist button
  function updateButton(imdbID) {
    if (watchlistArray.includes(imdbID)) {
      console.log(watchlistArray);
      return "Remove from Watchlist";
    } else {
      return "Add to Watchlist";
    }
  }

  // function to render the index page
  function toRenderIndexpage() {
    getLocalStorage();
    if (toDisplayIndexPage) {
      toDisplayIndexPage.innerHTML = toDisplay(movieDetailArray);
    }
  }

  toRenderWatchList(); // render the watchlist page

  // function to render the watchlist page
  function toRenderWatchList() {
    if (watchListMain) {
      getLocalStorage();
      console.log(watchlistArray);

      // if the watchlistArray is empty, display the message "No movies in your watchlist"
      if (watchlistArray.length === 0) {
        watchListMain.innerHTML = `
        <div class="noMovies">
        <p >No movies in your watchlist</p>
        <br>
        <br>
        <a href="./index.html" >Click to add movies</a>
            </div>`;

        return;
      }

      // else get watch list data, then display the watchlist
      imdbIdToMovieArray(watchlistArray).then((watchlistArrayOfMovies) => {
        toDisplayWatchList.innerHTML = toDisplay(watchlistArrayOfMovies);
      });
      console.log(watchListMain);
    }
  }
});
