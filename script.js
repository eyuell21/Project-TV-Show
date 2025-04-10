
let url = "https://api.tvmaze.com/shows"; // Global variable state to store all movies, the search term, and cached episodes.
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

// Function to fetch all shows (movies)
async function getMovies() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok " + res.statusText);
    const data = await res.json();
    return data.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (error) {
    displayErrorMessage("Error loading the movies. Please try again later.");
    return [];
  }
}




// Function to display error message
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}

// Function to populate the dropdown selector of all movies
function populateShowSelector(allMovies) {
  dropDownSelector.innerHTML = `<option value="">Select a Show</option>`;
  allMovies.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropDownSelector.appendChild(option);
  });
}

// Function to fetch and populate episodes for the selected show
async function episodeSelector(showId) {
  if (state.cachedEpisodes[showId]) {
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

// Function to update episode dropdown
function updateEpisodeDropdown(episodes) {
  epiDropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.name} (S${episode.season}E${episode.number})`;
    epiDropDownSelector.appendChild(option);
  });
}

// Function to create a film card (for shows and episodes)
function createFilmCard(item, isEpisode = false) {
  const filmCard = document.createElement("div");
  filmCard.classList.add("film-card");

  const bannerImg = document.createElement("img");
  bannerImg.src = item.image?.medium || "https://via.placeholder.com/210x295";
  filmCard.appendChild(bannerImg);

  const titleElement = document.createElement("h3");
  titleElement.textContent = isEpisode && item.season
    ? `${item.name} (S${item.season}E${item.number})`
    : item.name;
  filmCard.appendChild(titleElement);

  const detailsElement = document.createElement("p");
  detailsElement.innerHTML = `
    <strong>Summary:</strong> ${item.summary || "No summary available."}<br>
    <strong>Genres:</strong> ${item.genres ? item.genres.join(", ") : "N/A"}<br>
    <strong>Status:</strong> ${item.status || "N/A"}<br>
    <strong>Rating:</strong> ${item.rating ? item.rating.average : "N/A"}<br>
    <strong>Runtime:</strong> ${item.runtime ? item.runtime + " minutes" : "N/A"}
  `;
  filmCard.appendChild(detailsElement);

  const linkElement = document.createElement("a");
  linkElement.href = item.url;
  linkElement.textContent = "More Info at TVmaze.com";
  linkElement.target = "_blank";
  linkElement.classList.add("redirect");
  
  filmCard.appendChild(linkElement);

  return filmCard;
}

// Function to display movies
function displayMovies(movies) {
  counter.textContent = `Results: ${movies.length}`;
  filmCardContainer.innerHTML = ""; // Clear previous content
  movies.forEach((movie) => {
    const filmCard = createFilmCard(movie);
    filmCard.addEventListener("click", () => displayEpisodeView(movie.id)); // Add click listener for shows
    filmCardContainer.appendChild(filmCard);
  });
}

// Function to display episodes for a selected show
function displayEpisodes(episodes) {
  counter.textContent = `Results: ${episodes.length}`;
  filmCardContainer.innerHTML = ""; // Clear previous content

  // Prepend the "Back to Shows" button at the top of the container
  const backButton = document.createElement("button");
  backButton.textContent = "Back to Shows";
  backButton.classList.add("back-button");
  backButton.addEventListener("click", showShowListing); // Add click handler for back button
  filmCardContainer.appendChild(backButton);

  // Display episodes
  episodes.forEach((episode) => {
    filmCardContainer.appendChild(createFilmCard(episode, true));
  });
}

// Function to handle the show selection and display the episodes
function displayEpisodeView(showId) {
  filmCardContainer.innerHTML = ""; // Clear the container before displaying episodes

  // Show the episodes view
  if (state.cachedEpisodes[showId]) {
    // If episodes are cached, display them directly
    displayEpisodes(state.cachedEpisodes[showId]);
  } else {
    // Otherwise, fetch episodes from the API
    episodeSelector(showId).then(() => {
      displayEpisodes(state.cachedEpisodes[showId]); // Display the fetched episodes
    });
  }
}

// Function to show the show listing again
function showShowListing() {
  filmCardContainer.innerHTML = ""; // Clear the container
  displayMovies(state.allMovies); // Redisplay the list of movies
}

// Function to handle search results
function searchResults(event) {
  state.searchTerm = event.target.value.toLowerCase();

  if (!dropDownSelector.value) {
    const filteredMovies = state.allMovies.filter((movie) =>
      movie.name.toLowerCase().includes(state.searchTerm) ||
      movie.genres.some(genre => genre.toLowerCase().includes(state.searchTerm)) ||
      (movie.summary && movie.summary.toLowerCase().includes(state.searchTerm))
    );
    displayMovies(filteredMovies);
  } else {
    const selectedShowId = dropDownSelector.value;
    if (!state.cachedEpisodes[selectedShowId]) return;

    const filteredEpisodes = state.cachedEpisodes[selectedShowId].filter((episode) =>
      episode.name.toLowerCase().includes(state.searchTerm) ||
      (episode.summary && episode.summary.toLowerCase().includes(state.searchTerm))
    );
    displayEpisodes(filteredEpisodes);
  }
}

// Event listener for search input
searchBox.addEventListener("input", searchResults);

// Function to set up the app
async function setup() {
  state.allMovies = await getMovies();
  populateShowSelector(state.allMovies);
  displayMovies(state.allMovies);
}

window.onload = setup;

// Handle show selection in dropdown
dropDownSelector.addEventListener("change", async () => {
  const selectedShowId = dropDownSelector.value;
  if (!selectedShowId) return;

  await episodeSelector(selectedShowId);
  displayEpisodeView(selectedShowId); // Show the episode view
});
