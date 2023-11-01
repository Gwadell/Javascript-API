import { cmdbUrl } from "./app.js";
import { getMovieById } from "./app.js";
import { getCmdbMoviesById } from "./app.js";

//Detaljsidan
document.addEventListener("DOMContentLoaded", async function () { 
    const urlParams = new URLSearchParams(window.location.search); // Get query parameters from the URL
    const movieId = urlParams.get("id");
    
    if (movieId) {
        const movie = await getMovieById(movieId);
        const cmdbMovie = await getCmdbMoviesById(movieId);
        const moviePage = document.querySelector(".movie-details");

        // Hitta de befintliga elementen inom "movie-details"
        const image = moviePage.querySelector('.image img');
        const title = moviePage.querySelector('.movie-header');
        const storyText = moviePage.querySelector('.story p');
        const ratingsAmount = moviePage.querySelector('.number-of-ratings h6');
        const ratingSpans = moviePage.querySelectorAll(".rating-number");
        const ratingMark = moviePage.querySelector(".rating-mark");
        const ratingNo1 = moviePage.querySelector(".rating-no1");
        const spanFills = moviePage.querySelectorAll(".span-fills");
        const reviewList = document.querySelector('.listofreview');
        
        // Uppdatera innehållet i elementen med filmens data
        image.src = movie.Poster;
        image.alt = "Filmposter";
        title.textContent = movie.Title;
        storyText.textContent = movie.Plot;


        // Check if cmdbMovie exists and has a cmdbScore
        if (cmdbMovie && cmdbMovie.cmdbScore) {
            ratingNo1.textContent = `Betyg: ${cmdbMovie.cmdbScore}`;
            ratingsAmount.textContent = `Antal röster: ${cmdbMovie.count}`
        } else {
            ratingNo1.textContent = "Filmen finns inte i Cmdb. Skriv en rececion eller sätt ett betyg för att lägga till den.";
        }

        // Makes the rating scale respond to the movies average rating 
        const decimalOfScore = cmdbMovie.cmdbScore / 4;
        const percentageOfScore = decimalOfScore * 100;
        ratingMark.style.marginLeft = `${percentageOfScore}%`;
        ratingNo1.style.marginLeft = `${percentageOfScore}%`;
        

        // Sets the rating detail spans to the correct rating numbers
        const availableScores = [4, 3, 2, 1];
        let allMovieScores = cmdbMovie.categorizedScores;

        for (let i = 0; i < availableScores.length; i++) {
            const scoreData = allMovieScores.find(score => score.score === availableScores[i]);
            if (scoreData) {
                ratingSpans[i].textContent = scoreData.count;
            } else {
                ratingSpans[i].textContent = 0;
            }
        }

        // Asignes the spans the correct width so the color corresponds with the amount of votes.
        for (let i = 0; i < ratingSpans.length; i++) {
            const decimalOfVotes = parseFloat(ratingSpans[i].textContent) / cmdbMovie.count
            const percentageOfVotes = decimalOfVotes * 100;  //Multiply by 100 to get the floatnumber into a percentage
            spanFills[i].style.width = `${percentageOfVotes}%`;
        }

        let rating = 1;
        const reviewsPerPage = 5;
        let textReviews = []
        let currentPage = 1;

        // Check if cmdbMovie exists and has reviews
        if (cmdbMovie && cmdbMovie.reviews) {
            for (let i = 0; i < cmdbMovie.reviews.length; i++) {
                if (cmdbMovie.reviews[i] && cmdbMovie.reviews[i].review) {
                    textReviews.push(cmdbMovie.reviews[i]);
                }
            }
        }

        function updateMovieInfo() {
            const infoPosterH3 = moviePage.querySelector('.info-poster h3');
            const infoPoster = moviePage.querySelector('.mini-poster');
            const imdbScore = moviePage.querySelector('#imdb-score');
            const tomatoScore = moviePage.querySelector('#tomato-score');
            
            const year = moviePage.querySelector('#year');
            const runTime = moviePage.querySelector('#run-time');
            const genre = moviePage.querySelector('#genre');
            const language = moviePage.querySelector('#language');
            const director = moviePage.querySelector('#director');
            const writer = moviePage.querySelector('#writer');

            infoPoster.src = movie.Poster;
            infoPosterH3.textContent = movie.Title;
            imdbScore.textContent = movie.Ratings[0].Value;
            tomatoScore.textContent = movie.Ratings[1].Value;
            
            function makeFirstWordBold(text) {
                var words = text.split(":");
                if (words.length === 2) {
                    let word1 = words[0].trim();
                    let boldElement = document.createElement("b");
                    boldElement.textContent = word1;
                    let textNode = document.createTextNode(`: ${words[1]}`);
                    let container = document.createElement("span");
                    container.appendChild(boldElement);
                    container.appendChild(textNode);
                    
                    return container;
                }
                return text;
            }
             
            year.appendChild(makeFirstWordBold(`Year: ${movie.Year}`));
            runTime.appendChild(makeFirstWordBold(`Runtime: ${movie.Runtime}`))
            genre.appendChild(makeFirstWordBold(`Genre: ${movie.Genre}`));
            language.appendChild(makeFirstWordBold(`Language: ${movie.Language}`));
            director.appendChild(makeFirstWordBold(`Director: ${movie.Director}`));
            writer.appendChild(makeFirstWordBold(`Writer: ${movie.Writer}`));
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
        updateMovieInfo();
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
        ratingButtonsForm.forEach((btn) => btn.classList.remove('enable'));
        button.classList.add('enable');
    });
}); 

// Skapa en recension
document.addEventListener("submit", async function (e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search); // Get query parameters from the URL
    const movieId = urlParams.get("id");
    const movie = await getCmdbMoviesById(movieId)
    const submitButton = form.querySelector('input[type="submit"]');
    const confirmationMessage = document.querySelector("#confirmation-message");
    
    const reviewer = document.querySelector("#fname").value;
    const review = document.querySelector("#review").value;

    if (movie) {
        for (let i = 0; i < movie.count; i++) {
            if (movie.reviews[i].reviewer === reviewer) {
                submitButton.disabled = true;
                alert("Du har redan skrivit en recension för den här filmen.")
                break
            }
        }
    }

    reviewMovie(movieId, reviewer, score, review);
    submitButton.disabled = true;
    
    confirmationMessage.style.display = "block";

    setTimeout(function () {
        confirmationMessage.style.display = "none";
    }, 3000);
});

//Post method för att skicka recensionen till cmdb
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
    
}