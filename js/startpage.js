import { cmdbUrl } from "./app.js";
import { getMovieById } from "./app.js";
import { setGrade } from "./app.js";
import { handleError } from "./app.js";



//hämtar och visar 10 filmer 
getAndDisplayMovies(10);



//Hämtar filmer från topplistan och visar dem på startsidan
async function getAndDisplayMovies(numberofMovies) {
    try {
        const cmdbMovies = await getToplist(numberofMovies);
    
        const startpage = document.querySelector(".startpage");
    
        const movieElements = startpage.querySelectorAll('.movie');
    
        for (let i = 0; i < numberofMovies; i++) {
            const movie = cmdbMovies.movies[i];
            const movieId = cmdbMovies.movies[i].imdbID;
            
            const omdbMovie = await getMovieById(movieId);
            
            const movieElement = movieElements[i];
    
            movieElement.dataset.movieId = movieId; // Set the movie ID as a data attribute on the movie element
    
            const titleLink = movieElement.querySelector('h3 a');
            const poster = movieElement.querySelector('img');
            const cmdbScore = movieElement.querySelector('.startpagegrade');
            const summary = movieElement.querySelector('.summary');
            
            titleLink.href = `moviePage.html?id=${movieId}`;
            titleLink.textContent = `${i + 1}. ${omdbMovie.Title}`;
            poster.src = omdbMovie.Poster;
            poster.alt = omdbMovie.Title;
            cmdbScore.textContent = `Betyg: ${movie.cmdbScore}`;
            summary.textContent = omdbMovie.Plot;
        }
    } catch (error) {
        handleError(error); 
    }
   
}


// Retrieve the toplist 
 async function getToplist(limit) {
    try {
        const endpoint = "/toplists?sort=desc&limit=" +limit +"&page=1&countlimit=2";
        const response = await fetch(cmdbUrl + endpoint);
        const data = await response.json();
        return data;
    } catch (error) {
        handleError(error); 
    }
    
}


// Method to create three new movies
let movieButton;
let numberOfCreatedMovies = 0;
function createANewMovie () {
    const startpage = document.querySelector(".startpage");
    const latestReview = startpage.querySelector(".latest-review");
    
    for (let i = 0; i < 3; i++) {
        const newMovie = startpage.querySelector(".movie4-10").cloneNode(true);
        
        const img = newMovie.querySelector("img");
        const title = newMovie.querySelector("h3 a");
        
        img.src = "../img/loading.gif";
        title.textContent = "Laddar...";
        
        startpage.insertBefore(newMovie, latestReview);
        movieButton = newMovie.querySelectorAll(".rating a");
        numberOfCreatedMovies++;
        movieButton.forEach((button) => {
            button.classList.remove('disabled');
        });
    }
}



//hämtar mer filmer knappen och skapar 3 nya filmer
const moreBtn = document.querySelector(".more-btn")
if (moreBtn) {
    moreBtn.addEventListener("click", function (event) {
    
        createANewMovie();
        getAndDisplayMovies(10 + numberOfCreatedMovies);
    });
}


//klicka på betygsknapparna
document.addEventListener("click", async function (event) {
    try {
        const targetClass = event.target.classList[0];
        const ratingButton = ratingButtons.find(button => button.className === targetClass);
    
        if (ratingButton && !ratingButton.element.disabled) {
            event.preventDefault();
            const movieElement = event.target.closest(".movie");
            const movieId = movieElement.dataset.movieId;
            const grade = ratingButton.grade;
            
            //hämtat titeln på filmen
            const movieTitle = movieElement.querySelector('h3 a').textContent;
            
            const confirmMessage = `Är du säker att du vill ge filmen ${movieTitle} betyg ${grade}?`;
            const userConfirmed = confirm(confirmMessage); 
            
            if (userConfirmed) {
                const response = await setGrade(movieId, grade);
                
                //lägger till klassen disabled på betygsknapparna
                movieButton = movieElement.querySelectorAll(".rating a");
                
                    movieButton.forEach((button) => {
                        button.classList.add('disabled');
                    });
                    
            }
            gradedMovieId = movieId;
        } 
    } catch (error) {
       handleError(error); 
    }
});


//alla betygsknappar i en array
const ratingButtons = [
    { grade: 1, className: "one", element: document.querySelector('.one') },
    { grade: 2, className: "two", element: document.querySelector('.two') },
    { grade: 3, className: "three", element: document.querySelector('.three') },
    { grade: 4, className: "four", element: document.querySelector('.four') }
];

//Metod för att disabla betygskanpparna vid klick
let gradedMovieId;
function toggleRatingBtns () {
    const allMovieElements = document.querySelectorAll(".movie");
    for (let i = 0; i < allMovieElements.length; i++) {
        if(allMovieElements[i].dataset.movieId === gradedMovieId) {
            const ratingButtons = allMovieElements[i].querySelectorAll(".rating a")
            movieButton.forEach((button) => {
                button.classList.remove('disabled');
            });
            ratingButtons.forEach((button) => {
                button.classList.add('disabled');
            });
        }
    }
}

//läs mer kanpp 
document.addEventListener("click", function (event) { 
    try {
        const expandButton = event.target; 
    
        if (expandButton.classList.contains("expand-button")) {
            const summary = expandButton.previousElementSibling;
    
            if (summary.style.maxHeight) {
                summary.style.maxHeight = null;
                expandButton.textContent = "Läs mer...";
            } else {
                summary.style.maxHeight = "200px";
                expandButton.textContent = "Visa mindre";
            }
        }
    } catch (error) {
        handleError(error); 
    }
   
});

///Hämtar senaste recensionen
async function getLatestReview () {
    try {
        const endpoint = "/movies/latest";
    const response = await fetch(cmdbUrl + endpoint);
    const data = await response.json();
    return data;
    } catch (error) {
        handleError(error); 
    }
    
}

//Metod för att visa den senast skrivna recensionen
async function displayLatestReview () {
    try {
        const latestReview = await getLatestReview();
        const movie = await getMovieById(latestReview.imdbID);
        const reviewInfo = document.querySelector(".latest-review");
        const title = reviewInfo.querySelector("#title")
        const score = reviewInfo.querySelector("#score")
        const reviewer = reviewInfo.querySelector("#reviewer");
        const date = reviewInfo.querySelector("#date");
        const reviewText = reviewInfo.querySelector("#review-text");
    
        title.textContent = `Titel: ${movie.Title}`;
        score.textContent = `Betyg: ${latestReview.score}`;
        reviewer.textContent = `Recensent: ${latestReview.reviewer}`;
        date.textContent = `Datum: ${latestReview.date}`;
        reviewText.textContent = `Recension: ${latestReview.review}`;  
    } catch (error) {
        handleError(error);
    }
    
}

displayLatestReview();
const latestReviewInterval = setInterval(displayLatestReview, 3000);

//uppdaterar topplistan och toggleknapparna var 3e sekund
const displayMovieInterval = setInterval(() => {
    getAndDisplayMovies(10 + numberOfCreatedMovies);
    toggleRatingBtns();
}, 3000); 

