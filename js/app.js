export const cmdbUrl = "https://grupp6.dsvkurs.miun.se/api"
export const omdbUrl = "https://www.omdbapi.com/?"

async function getApiKey(){
    const endpioint = "/keys/omdb/bc432b7d-e136-4b40-937b-dfb423522505";
    const response = await fetch(cmdbUrl + endpioint);
    const data = await response.json();
    return data.apiKey;
} 


export async function displaySearchResults(title) {
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

export const searchtext = document.querySelector(".searchtext"); 
export const searchButton = document.querySelector(".searchbutton"); 
export const movieResults = document.querySelector(".movie-results"); 

//Visar filmer samtidigt som jag skriver i sökfältet
searchtext.addEventListener("input", async function () { 
    const text = searchtext.value; 

    if (text.trim() !== '') { // så fort det står något i sökfältet så hämtas filmer från api

        document.querySelector('.popup').style.display = 'block';

        const movies = await displaySearchResults(text); 
        
        movieResults.innerHTML = '';
        // visar filmerna
        movies.forEach( async movie => {
            let id = movie.imdbID;
            const movieInfo =  await getMovieById(id);

            const movieDiv = document.createElement("div"); 
            movieDiv.classList.add("movie"); 
            movieDiv.innerHTML = `  
            <img src="${movie.Poster}" alt="${movie.Title} bild">
                <section class="movie-extra-info">
                <p> <span>Titel: </span><a href=moviePage.html?id=${movie.imdbID}> ${movie.Title}<a/></p>
                <p> <span>År: </span> ${movie.Year}</p>
                <p><span>Längd: </span> ${movieInfo.Runtime}</p>
                <p><span>Genre: </span> ${movieInfo.Genre}</p>
                </section>
            `;
            
            const img = movieDiv.querySelector('img');
            img.addEventListener('click', function() {
                window.location.href = `moviePage.html?id=${movie.imdbID}`;
            });

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


//hämta filmer från cmdb 
async function getCmdbMovies() {
    const endpoint = "/movies";
    const response = await fetch(cmdbUrl + endpoint);
    const data = await response.json();
    return data;
} 

//hämtar film från cmdb med id 
export async function getCmdbMoviesById(id) {
    try {
        const endpoint = "/movies/" + id;
        const response = await fetch(cmdbUrl + endpoint);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

//hämtar film från omdb med id
export async function getMovieById(id) {
    const apiKey = await getApiKey();
    const endpoint = "i=" + id + "&apikey=";
    const response = await fetch(omdbUrl + endpoint + apiKey);
    const data = await response.json();
    return data;
} 