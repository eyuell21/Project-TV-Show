let url = "https://api.tvmaze.com/shows";
//global variable state is defined to store all movies the search term and cached episodes once from the fetched data.
const state = {
  allMovies: [],
  searchTerm: "",
  cachedEpisodes: {},
};
const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
const epiDropDownSelector = document.getElementById("episode");
const counter = document.getElementById("counter");

//Function getMovies to fetch all movies
async function getMovies() {
  try {
    const res = await fetch(url);
    if (!res.ok)
      throw new Error("Network response was not ok " + res.statusText);
    const data = await res.json();
    return data.sort((a, b) =>a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (error) {
    displayErrorMessage("Error loading the movies. Please try again later.");
    return [];
  }
}
//Function to display error message
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}
//Function to populates the dropdown selector of all movies
function populateShowSelector(allMovies) {
  dropDownSelector.innerHTML = `<option value="">Select a Show</option>`;
  allMovies.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropDownSelector.appendChild(option);
  });
}
//Function to fetches and populates episodes for the selected show
async function episodeSelector(showId) {
  //if (!showId) return;
  if (state.cachedEpisodes[showId]) { //if cachedEpisodes of a certain id(movie) exist, update the dropdown for the cachedEpisode 
    updateEpisodeDropdown(state.cachedEpisodes[showId]);
    return;
  }
  try {
    const episodeUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
    const res = await fetch(episodeUrl); 
    if (!res.ok) throw new Error("Error fetching episodes");
    const episodes = await res.json();
    state.cachedEpisodes[showId] = episodes;
    updateEpisodeDropdown(episodes);
  } catch (error) {
    displayErrorMessage("Error loading episodes. Please try again.");
  }
}
//function to create elements and update the episode dropdown 
function updateEpisodeDropdown(episodes) {
  epiDropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.name} (S${episode.season}E${episode.number})`;
    epiDropDownSelector.appendChild(option);
  });
}
//Function for CreateFilmCard to be used for movies and episodes
function createFilmCard(item, isEpisode = false) {
  const filmCard = document.createElement("div");
  filmCard.classList.add("film-card");
  const bannerImg = document.createElement("img");
  bannerImg.src = item.image?.medium || "https://via.placeholder.com/210x295";
  filmCard.appendChild(bannerImg);
  const titleElement = document.createElement("h3");
  //if isEpisode is true we set it for the details of the season.
  titleElement.textContent = isEpisode && item.season ? `${item.name} (S${item.season}E${item.number})` : item.name;
  filmCard.appendChild(titleElement);
  const summaryElement = document.createElement("p");
  summaryElement.innerHTML = item.summary || "No summary available.";
  filmCard.appendChild(summaryElement);
  const linkElement = document.createElement("a");
  linkElement.href = item.url;
  linkElement.textContent = "More Info";
  linkElement.target = "_blank";
  linkElement.classList.add("redirect");
  filmCard.appendChild(linkElement);
  return filmCard;
}
//Display the movies given an input movies
function displayMovies(movies) {
  counter.textContent = `Results: ${movies.length}`;
  filmCardContainer.innerHTML = "";
  movies.forEach((movie) => {
    filmCardContainer.appendChild(createFilmCard(movie));
  });
}
//Display the episodes given the episodes
function displayEpisodes(episodes) {
  counter.textContent = `Results: ${episodes.length}`;
  filmCardContainer.innerHTML = "";
  episodes.forEach((episode) => {
    filmCardContainer.appendChild(createFilmCard(episode, true));
  });
}
//this function handles user selecting a show from the dropdown and if a movie is selected add the episodes to cachedEpisodes.
async function userSelection() {
  dropDownSelector.addEventListener("change", async () => {
    const selectedShowId = dropDownSelector.value;
    if (!selectedShowId) return;

    await episodeSelector(selectedShowId);
    const episodes = state.cachedEpisodes[selectedShowId] || [];
    displayEpisodes(episodes);
  });
}
//select an episode
epiDropDownSelector.addEventListener("change", function () {
  const selectedEpisodeId = this.value;
  const selectedShowId = dropDownSelector.value;
  if (!selectedShowId || !state.cachedEpisodes[selectedShowId]) return;

  if (!selectedEpisodeId) {
    // if allEpisodes are selected it displays all episodes else display for the selected episode only.
    displayEpisodes(state.cachedEpisodes[selectedShowId]);
  } else {
    const selectedEpisode = state.cachedEpisodes[selectedShowId].find(
      (episode) => episode.id.toString() === selectedEpisodeId
    );
    if (selectedEpisode) {
      displayEpisodes([selectedEpisode]);
    }
  }
});
//Filter episodes based on search input
function searchResults(event) {
  state.searchTerm = event.target.value.toLowerCase();
  //If no show is selected, filter the full list of movies
  if (!dropDownSelector.value) {
    const filteredMovies = state.allMovies.filter((movie) =>movie.name.toLowerCase().includes(state.searchTerm));
    displayMovies(filteredMovies);
  } else {
    //filter episodes for the selected show
    const selectedShowId = dropDownSelector.value;
    if (!state.cachedEpisodes[selectedShowId]) return;
    const filteredEpisodes = state.cachedEpisodes[selectedShowId].filter((episode) => episode.name.toLowerCase().includes(state.searchTerm));
    displayEpisodes(filteredEpisodes);
  } 
}
searchBox.addEventListener("input", searchResults);

async function setup() {
  state.allMovies = await getMovies();
  populateShowSelector(state.allMovies);
  userSelection();
}
window.onload = setup;
