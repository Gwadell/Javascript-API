const cmdbUrl = "https://grupp6.dsvkurs.miun.se/api"
const omdbUrl = "https://www.omdbapi.com/?"

export async function getApiKey(){
    const endpioint = "/keys/omdb/bc432b7d-e136-4b40-937b-dfb423522505";
    const response = await fetch(cmdbUrl + endpioint);
    const data = await response.json();
    return data.apiKey;
} 

