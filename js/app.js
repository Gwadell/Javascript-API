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
const movieResults = document.getElementById("movieResults"); 

//Visar filmer samtidigt som jag skriver i sökfältet
searchtext.addEventListener("input", async function () { 
    const text = searchtext.value; 

    if (text.trim() !== '') { // så fort det står något i sökfältet så hämtas filmer från api
        const movies = await displaySearchResults(text); 

        movieResults.innerHTML = '';
        
        movies.forEach(movie => {
            const movieDiv = document.createElement("div"); 
            movieDiv.classList.add("movie"); 
            movieDiv.innerHTML = `  
                <h2>${movie.Title}</h2>
                <img src="${movie.Poster}" alt="${movie.Title} poster">
                <p>${movie.Year}</p>
                <p>${movie.Type}</p>
            `;
            movieResults.appendChild(movieDiv);
        });
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
    console.log(urlParams);
    const text = urlParams.get("search");
    console.log(text);

    if (text) {
        const movies = await displaySearchResults(text); 
        
        searchtext.value = text; 
        
        movieResults.innerHTML = '';
        // visar filmerna
        movies.forEach(movie => {
            const movieDiv = document.createElement("div"); 
            movieDiv.classList.add("movie"); 
            movieDiv.innerHTML = `  
                <h2>${movie.Title}</h2>
                <img src="${movie.Poster}" alt="${movie.Title} bild">
                <p>${movie.Year}</p>
                <p>${movie.Type}</p>
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
    const endpoint = "/movies/" + id;
    const response = await fetch(cmdbUrl + endpoint);
    const data = await response.json();
    return data;
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
    //const cmdbMovies = await getCmdbMovies();

    const cmdbMovies = await getToplist(10);
    console.log(cmdbMovies)
    
    const startpage = document.querySelector(".startpage");

    const movieElements = startpage.querySelectorAll('.movie');
    //sorterar filmerna efter betyg
    //cmdbMovies.sort((a, b) => b.cmdbScore - a.cmdbScore);
    

    //begränsar antalet filmer som visas på startsidan
    //const numMoviesToDisplay = Math.min(10, cmdbMovies.length);

    for (let i = 0; i < 10; i++) {

        const movie = cmdbMovies.movies[i];
        const movieId = cmdbMovies.movies[i].imdbID;
        
        const omdbMovie = await GetMovieById(movieId);
        
        const movieElement = movieElements[i];
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
        const reviewList = moviePage.querySelector('.listofreview');
        
        // Uppdatera innehållet i elementen med filmens data
        image.src = movie.Poster;
        image.alt = "Filmposter";
        storyText.textContent = movie.Plot;
        gradeText.textContent = `Betyg: ${cmdbMovie.cmdbScore}`;

        // Ta bort befintliga recensioner
        while (reviewList.firstChild) {
            reviewList.removeChild(reviewList.firstChild);
        }

        let rating = 1;
        console.log(cmdbMovie)
        // Lägg till de nya recensionerna
        for (let i = 0; i < cmdbMovie.count; i++) {
            if (cmdbMovie.reviews[i] && cmdbMovie.reviews[i].review) {
                const reviewItem = document.createElement("li");
                reviewItem.textContent = `Recension ${rating}: ${cmdbMovie.reviews[i].review}`;
                reviewList.appendChild(reviewItem);
                rating++;
            }
            
        }

    }
});




const form = document.getElementById("review-form");
const ratingButtons = document.querySelectorAll('.rating a');
let score = 0;

ratingButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        score = parseFloat(button.textContent);
    });
});

form.addEventListener("submit", async function (e) {
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