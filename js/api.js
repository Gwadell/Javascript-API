const cmdbUrl = "https://grupp6.dsvkurs.miun.se/api"
const omdbUrl = "https://www.omdbapi.com/?t="

async function getApiKey(){
    const endpioint = "keys/omdb/bc432b7d-e136-4b40-937b-dfb423522505";
    const response = await fetch(cmdbUrl + endpioint);
    const data = await response.json();
    return data.apiKey;
}

async function getMovieByTitle(title, apiKey){
    const endpoint = "t="+ title + "&apikey=";
    const response = await fetch(omdbUrl + endpoint + apiKey);
    const data = await response.json();
    return data;
}

getMovieByTitle("hej"); 

//https://www.omdbapi.com/?t=the+wolf+of+wall+street&apikey=3eee559