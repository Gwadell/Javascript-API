export const cmdbUrl = "https://grupp6.dsvkurs.miun.se/api"
export const omdbUrl = "https://www.omdbapi.com/?"

export function handleError(error) {
    console.error("An error occurred:", error);
}

async function getApiKey(){
    const endpioint = "/keys/omdb/bc432b7d-e136-4b40-937b-dfb423522505";
    try {
        const response = await fetch(cmdbUrl + endpioint);
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        handleError(error)
    }
} 


export async function displaySearchResults(title) {
    try {
        const movie = await getListMoviesByTitle(title); 
        return movie.Search || [];
    } catch (error) {
        handleError(error)
        return [];
    }
}

async function getListMoviesByTitle(title) {
    const apiKey = await getApiKey();
    const endpoint = "s=" + title + "&apikey=";
    try {
        const response = await fetch(omdbUrl + endpoint + apiKey);
        const data = await response.json();
        return data;
    } catch (error) {
        handleError(error)
    }
}

export const searchtext = document.querySelector(".searchtext"); 
export const searchButton = document.querySelector(".searchbutton"); 
export const movieResults = document.querySelector(".movie-results"); 

//Show movies in the popup when user writes in the searchinput
searchtext.addEventListener("input", async function () { 
    let text = searchtext.value; 
    text = escapeHTML(text); //remove html

    if (text.trim() !== '') { 
        console.log(text); 
        document.querySelector('.popup').style.display = 'block';

        const movies = await displaySearchResults(text); 
        
        movieResults.innerHTML = '';
        // show movies
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

// Clickevent for the searchbutton
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

// Get the fim from cmdb with id
export async function getCmdbMoviesById(id) {
    try {
        const endpoint = "/movies/" + id;
        const response = await fetch(cmdbUrl + endpoint);
        const data = await response.json();
        return data;
    } catch (error) {
        handleError(error);
    }
}

// Get the movie omdb with id 
export async function getMovieById(id) {
    const apiKey = await getApiKey();
    const endpoint = "i=" + id + "&apikey=";
    try {
        const response = await fetch(omdbUrl + endpoint + apiKey);
        const data = await response.json();
        return data;
    } catch (error) {
        handleError(error); 
    }
    
} 


export async function setGrade(id, grade) {
    try {
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
    return data; 
    } catch (error) {
        handleError(error); 
    }
    
}

export function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
