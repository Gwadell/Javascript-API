import { displaySearchResults, searchtext, movieResults, getMovieById, escapeHTML } from "./app.js";

// Function to display search results on the search page
document.addEventListener("DOMContentLoaded", async function () { 
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get("search");

    if (text) {
        const movies = await displaySearchResults(text); 
        searchtext.value = escapeHTML(text);

        movieResults.innerHTML = '';

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
         
        if (movies.length === 0) {
            movieResults.innerHTML = 'Inga sökresultat hittades.';
        }
    }
});


