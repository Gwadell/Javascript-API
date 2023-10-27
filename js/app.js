


const cmdbUrl = "https://grupp6.dsvkurs.miun.se/api"
const omdbUrl = "https://www.omdbapi.com/?"

async function getApiKey(){
    const endpioint = "/keys/omdb/bc432b7d-e136-4b40-937b-dfb423522505";
    const response = await fetch(cmdbUrl + endpioint);
    const data = await response.json();
    return data.apiKey;
} 


async function displaySearchResults(title) {
    const movie = await getListMoviesByTitle(title); 
    return movie.Search || []; 
}

async function getListMoviesByTitle(title) {
    const apiKey = await getApiKey();
    const endpoint = "s=" + title + "&apikey=";
    const response = await fetch(omdbUrl + endpoint + apiKey);
    const data = await response.json();
    return data;
}



const searchtext = document.querySelector(".searchtext"); 
const searchButton = document.querySelector(".searchbutton"); 
const movieResults = document.querySelector(".movie-results"); 

//Visar filmer samtidigt som jag skriver i sökfältet
searchtext.addEventListener("input", async function () { 
    const text = searchtext.value; 


    if (text.trim() !== '') { // så fort det står något i sökfältet så hämtas filmer från api

        document.querySelector('.popup').style.display = 'block';

        const movies = await displaySearchResults(text); 
        console.log(movies);

         movieResults.innerHTML = '';
        
        movies.forEach(movie => {
            const movieDiv = document.createElement("div"); 
            movieDiv.classList.add("movie"); 

            movieDiv.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title} poster">  
                <h2> <a href=moviePage.html?id=${movie.imdbID}> ${movie.Title}<a/></h2>
            `;
            movieResults.appendChild(movieDiv); 
        });
        }
        if (text.trim() === '') { 
            document.querySelector('.popup').style.display = 'none';
        }
});


//för sökknappen på alla sidor
searchButton.addEventListener("click", function (event) {
    event.preventDefault(); 

    const searchtext = document.querySelector(".searchtext");
    const text = searchtext.value;
    const searchForm = document.querySelector("form");

    if (text.trim() !== '') {
        const actionUrl = searchForm.action + `?search=${text}`;
        searchForm.action = actionUrl;
        searchForm.submit();
    }
});

// För att visa sökresultat på söksidan
document.addEventListener("DOMContentLoaded", async function () { 
    const urlParams = new URLSearchParams(window.location.search); // hämtar sökordet från urlen
   
    const text = urlParams.get("search");
    

    if (text) {
        const movies = await displaySearchResults(text); 
        
        searchtext.value = text; 
        
        movieResults.innerHTML = '';
        // visar filmerna
        movies.forEach(movie => {
            const movieDiv = document.createElement("div"); 
            movieDiv.classList.add("movie"); 
            movieDiv.innerHTML = `  
                <img src="${movie.Poster}" alt="${movie.Title} bild">
                <h2> <a href=moviePage.html?id=${movie.imdbID}> ${movie.Title}<a/></h2>
            `;
            movieResults.appendChild(movieDiv);
        });
    }
});

//hämta filmer från cmdb och visa på startsidan
async function getCmdbMovies() {
    const endpoint = "/movies";
    const response = await fetch(cmdbUrl + endpoint);
    const data = await response.json();
    return data;
}

async function getCmdbMoviesById(id) {
    try {
        const endpoint = "/movies/" + id;
        const response = await fetch(cmdbUrl + endpoint);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

//Hämta topplistan 
async function getToplist(limit) {
    const endpoint = "/toplists?sort=desc&limit=" +limit +"&page=1&countlimit=2";
    const response = await fetch(cmdbUrl + endpoint);
    const data = await response.json();
    return data;
}

async function GetMovieById(id) {
    const apiKey = await getApiKey();
    const endpoint = "i=" + id + "&apikey=";
    const response = await fetch(omdbUrl + endpoint + apiKey);
    const data = await response.json();
    
    return data;
}



async function getAndDisplayMovies() {
    const cmdbMovies = await getToplist(10);
    
    const startpage = document.querySelector(".startpage");

    const movieElements = startpage.querySelectorAll('.movie');

    for (let i = 0; i < 10; i++) {

        const movie = cmdbMovies.movies[i];
        const movieId = cmdbMovies.movies[i].imdbID;
        
        const omdbMovie = await GetMovieById(movieId);
        
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
}


getAndDisplayMovies();

//läs mer kanpp 
document.addEventListener("click", function (event) { 
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
});


//detaljsidan
document.addEventListener("DOMContentLoaded", async function () { 
    const urlParams = new URLSearchParams(window.location.search); // Get query parameters from the URL
    const movieId = urlParams.get("id");
    
    if (movieId) {
        const movie = await GetMovieById(movieId);
        const cmdbMovie = await getCmdbMoviesById(movieId);
        const moviePage = document.querySelector(".movie-details");

        // Hitta de befintliga elementen inom "movie-details"
        const image = moviePage.querySelector('.image img');
        const storyText = moviePage.querySelector('.story p');
        const gradeText = moviePage.querySelector('.grade p');
        const reviewList = document.querySelector('.listofreview');
        
        // Uppdatera innehållet i elementen med filmens data
        image.src = movie.Poster;
        image.alt = "Filmposter";
        storyText.textContent = movie.Plot;

        // Check if cmdbMovie exists and has a cmdbScore
        if (cmdbMovie && cmdbMovie.cmdbScore) {
            gradeText.textContent = `Betyg: ${cmdbMovie.cmdbScore}`;
        } else {
            gradeText.textContent = "Filmen finns inte i Cmdb.Skriv en rececion eller sätt ett betyg för att lägga till den.";
        }

        // Ta bort befintliga recensioner
        while (reviewList.firstChild) {
            reviewList.removeChild(reviewList.firstChild);
        }

        let rating = 1;
        const reviewsPerPage = 5;
        let textReviews = [];
        let reviewIndex = 0;
        let currentPage = 1;

        // Check if cmdbMovie exists and has reviews
        if (cmdbMovie && cmdbMovie.reviews) {
            for (let i = 0; i < cmdbMovie.reviews.length; i++) {
                if (cmdbMovie.reviews[i] && cmdbMovie.reviews[i].review) {
                    textReviews.push(cmdbMovie.reviews[i]);
                }
            }
        }

        function addNextReview() {
            for (let i = 0; i < textReviews.length; i++) {
                if (i < reviewsPerPage * currentPage && i >= reviewsPerPage * (currentPage - 1)) {
                    const reviewItem = document.createElement("li");
                    reviewItem.textContent = `Recension ${rating}: ${textReviews[i].review}`;
                    reviewList.appendChild(reviewItem);
                    rating++;
                }
            }
        }

        addNextReview();

        const btnNext = document.querySelector(".btn-next");
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            if ((rating - 1) % 5 === 0) {
                // Ta bort befintliga recensioner
                while (reviewList.firstChild) {
                    reviewList.removeChild(reviewList.firstChild);
                }
                currentPage++;
                addNextReview();
            }

            
        });

        const btnPrev = document.querySelector(".btn-prev");
        btnPrev.addEventListener("click", function (event) {
            event.preventDefault();

            if (currentPage > 1) {
                // Ta bort befintliga recensioner
                while (reviewList.firstChild) {
                    reviewList.removeChild(reviewList.firstChild);
                }
                
                const test = (currentPage * reviewsPerPage) - (rating - 1)
                rating = rating - 10 + test;
                currentPage--;
                addNextReview();
            }
        });
    }
});




const form = document.getElementById("review-form");
const ratingButtonsForm = document.querySelectorAll('.rating a');
let score = 0;

ratingButtonsForm.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        score = parseFloat(button.textContent);
    });
});

document.addEventListener("submit", async function (e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search); // Get query parameters from the URL
    const movieId = urlParams.get("id");
    const movie = await getCmdbMoviesById(movieId)
    const submitButton = form.querySelector('input[type="submit"]');
    const confirmationMessage = document.querySelector("#confirmation-message");
    

    const reviewer = document.querySelector("#fname").value;
    const review = document.querySelector("#review").value;

    for (let i = 0; i < movie.count; i++) {
        if (movie.reviews[i].reviewer === reviewer) {
            submitButton.disabled = true;
            alert("Du har redan skrivit en recension för den här filmen.")
            break
        }
    }

    reviewMovie(movieId, reviewer, score, review);
    submitButton.disabled = true;

    confirmationMessage.style.display = "block";

    setTimeout(function () {
        confirmationMessage.style.display = "none";
    }, 3000);
});

async function reviewMovie(movieId, author, score, review) {
    const endpoint = "/movies/review";
    const response = await fetch(cmdbUrl + endpoint, {
        method: 'POST',
        body: JSON.stringify({
            "imdbID": movieId,
            "reviewer": author,
            "score": score,
            "review": review
        }),
        headers: {
            'Content-type': 'application/json; charset = UTF-8'
        }
    });

    const data = await response.json();
    console.log(data);
}


async function setGrade(id, grade) {
    console.log(id);
    console.log(grade);
    const endpoint = "/movies/rate/" + id + "/" + grade;
    const response = await fetch(cmdbUrl + endpoint, {
        method: 'PUT',
        body: JSON.stringify({ 
            imdbID: id,
            score: grade 
        }),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }, 
    });
    const data = await response.json();
    console.log(data);
    console.log(ratingButtons);
    
    
}

// array med betygsknappar
const ratingButtons = [
    { grade: 1, className: "one", element: document.querySelector('.one') },
    { grade: 2, className: "two", element: document.querySelector('.two') },
    { grade: 3, className: "three", element: document.querySelector('.three') },
    { grade: 4, className: "four", element: document.querySelector('.four') }
];

console.log(ratingButtons);


document.addEventListener("click", async function (event) {
    const targetClass = event.target.classList[0];
    const ratingButton = ratingButtons.find(button => button.className === targetClass);

    if (ratingButton && !ratingButton.element.disabled) {
        const movieElement = event.target.closest(".movie");
        console.log(movieElement);
        const movieId = movieElement.dataset.movieId;
        const grade = ratingButton.grade;
        
        //hämtat titeln på filmen
        const movieTitle = movieElement.querySelector('h3 a').textContent;

        
        const confirmMessage = `Är du säker att du vill ge filmen ${movieTitle} betyg ${grade}?`;
        const userConfirmed = confirm(confirmMessage); 
        
        if (userConfirmed) {
            const response = await setGrade(movieId, grade);
            
            //lägger till klassen disabled på betygsknapparna
            const movieButton = movieElement.querySelectorAll(".rating a");
            
                movieButton.forEach((button) => {
            
                    button.classList.add('disabled');
                });
                
        }
    }
});
