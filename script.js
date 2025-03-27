
// api for game of thrones from TVmaze.com

let url = 'https://api.tvmaze.com/shows/82/episodes'

async function getEpisodes(params) {

  try {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error('Network response was not ok ' + res.statusText); 
    }
    const data = await res.json();
    return data; // Return filtered episodes
    } 
    catch (error) {
      displayErrorMessage('Sorry, there was an error loading the episodes. Please try again later.');
  }
}


//Function Setup : To load this 3 functions when page is running.
async function setup() {
  const allEpisodes = await getEpisodes(); // Await the promise
  state.allEpisodes = allEpisodes;
  makePageForEpisodes(allEpisodes);
  selector(allEpisodes);
  userSelection();
}

// error handling
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = 'block'; // Show the error message
}


//All global variables defined here
const allEpisodes = getEpisodes();
const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");

const state = { allEpisodes, searchTerm: "" };

const dropDownSelector = document.getElementById("movie");
let counter = document.getElementById('counter');
//Function to display Dropdown Menu

function selector(allEpisodes) {
  dropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  for (let n of allEpisodes) {
    if (n.name !== "") {
      const movieSelector = document.createElement("option");
      movieSelector.setAttribute("value", `${n.name}`);
      let valOpt = document.createTextNode(`${n.name}`);
      movieSelector.appendChild(valOpt);
      dropDownSelector.append(movieSelector);
    } else {
      const movieSelector = document.createElement("option");
      movieSelector.setAttribute("value", "");
      let valOpt = document.createTextNode(`${n.id} Have no name !!!`);
      movieSelector.appendChild(valOpt);
      dropDownSelector.append(movieSelector);
    }
  }}


function makePageForEpisodes(episodeList) {
  counter.textContent = `Results:  ${episodeList.length}/${state.allEpisodes.length}`;
  filmCardContainer.innerHTML = "";
  episodeList.forEach(filmData =>{
    const filmCard = document.createElement('div')
    filmCard.classList.add("film-card")

    const bannerImg = document.createElement('img');
    bannerImg.src =filmData.image.medium
    filmCard.appendChild(bannerImg);

    const titleElement = document.createElement('h3');
    titleElement.textContent = filmData.name;
    filmCard.appendChild(titleElement);

    const summaryElement = document.createElement('p');
    summaryElement.textContent = filmData.summary.replace(/<[^>]*>/g, '')
    filmCard.appendChild(summaryElement);

    const linkElement = document.createElement('a');
    linkElement.href = filmData.url;
    linkElement.textContent = "Re-direct to www.tvmaze.com"
    linkElement.classList.add('redirect')
    filmCard.appendChild(linkElement);

    filmCardContainer.appendChild(filmCard)
 
  })

}
//Render function : to render based on search
function render(){
  const searchedMovie = state.allEpisodes.filter((film)=>film.name.toLowerCase().includes(state.searchTerm.toLocaleLowerCase()));
  counter.textContent = `Results: ${searchedMovie.length}/73`;
  makePageForEpisodes(searchedMovie);
}
function searchRes(event){
  state.searchTerm = event.target.value;
  render();
}
searchBox.addEventListener("input", searchRes);

//userSelection Function to render based on Option choice from dropdown
function userSelection() {
  dropDownSelector.addEventListener("change", () => {
    const selectedValue = dropDownSelector.value.toLowerCase();
    const filteredEpisodes = state.allEpisodes.filter((film) =>film.name.toLowerCase().includes(selectedValue) || selectedValue === "");
    makePageForEpisodes(filteredEpisodes);
    counter.textContent = `Results: ${filteredEpisodes.length}/${state.allEpisodes.length}`;
  });
}

window.onload = setup;
