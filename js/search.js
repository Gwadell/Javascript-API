
import { displaySearchResults } from "./app.js";

import {searchtext} from "./app.js";
import {movieResults} from "./app.js";



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

