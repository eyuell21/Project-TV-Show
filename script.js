
let url = "https://api.tvmaze.com/shows";

const state = {
  allMovies: [],
  searchTerm: "",
  cachedEpisodes: {},
};

let currentShowId = null; // Track the currently selected show for filtering

const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
const epiDropDownSelector = document.getElementById("episode");
const epiDropDownSelectorLabel = document.getElementById("select-episode");
const counter = document.getElementById("counter");

// Fetch all shows
async function getMovies() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    return data.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (error) {
    displayErrorMessage("Error loading the movies. Please try again later.");
    return [];
  }
}

// Display error message
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}

// Show/hide episode dropdown
function toggleEpisodeSelector(visible) {
  epiDropDownSelector.style.display = visible ? "block" : "none";
  epiDropDownSelectorLabel.style.display = visible ? "block" : "none";
}

// Populate show dropdown
function populateShowSelector(allMovies) {
  dropDownSelector.innerHTML = `<option value="">Select a Show</option>`;
  allMovies.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropDownSelector.appendChild(option);
  });
}

// Fetch and cache episodes
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

// Update episode dropdown
function updateEpisodeDropdown(episodes) {
  epiDropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.name} (S${episode.season}E${episode.number})`;
    epiDropDownSelector.appendChild(option);
  });
}

// Create film/episode card
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
    <strong>Rating:</strong> ${item.rating?.average || "N/A"}<br>
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

// Display all shows
function displayMovies(movies) {
  counter.textContent = `Results: ${movies.length}`;
  filmCardContainer.innerHTML = "";
  toggleEpisodeSelector(false); // Hide episode dropdown

  movies.forEach((movie) => {
    const filmCard = createFilmCard(movie);
    filmCard.addEventListener("click", () => displayEpisodeView(movie.id));
    filmCardContainer.appendChild(filmCard);
  });
}

// Display episodes for a selected show
function displayEpisodes(episodes) {
  counter.textContent = `Results: ${episodes.length}`;
  filmCardContainer.innerHTML = "";

  const backButton = document.createElement("button");
  backButton.textContent = "Back to Shows";
  backButton.classList.add("back-button");
  backButton.addEventListener("click", showShowListing);
  filmCardContainer.appendChild(backButton);

  episodes.forEach((episode) => {
    filmCardContainer.appendChild(createFilmCard(episode, true));
  });

  toggleEpisodeSelector(true); // Show episode dropdown
}

// Display episode view when show is clicked
function displayEpisodeView(showId) {
  currentShowId = showId; // Store current show ID for dropdown filtering
  dropDownSelector.value = showId;
  searchBox.value = "";

  if (state.cachedEpisodes[showId]) {
    updateEpisodeDropdown(state.cachedEpisodes[showId]);
    epiDropDownSelector.value = "";
    displayEpisodes(state.cachedEpisodes[showId]);
  } else {
    episodeSelector(showId).then(() => {
      epiDropDownSelector.value = "";
      displayEpisodes(state.cachedEpisodes[showId]);
    });
  }
}

// Return to all shows
function showShowListing() {
  currentShowId = null;
  displayMovies(state.allMovies);
  dropDownSelector.value = "";
  epiDropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  epiDropDownSelector.value = "";
  toggleEpisodeSelector(false);
  searchBox.value = "";
}

// Free-text search for shows or episodes
function searchResults(event) {
  state.searchTerm = event.target.value.toLowerCase();

  if (!currentShowId) {
    // If no show is selected, search through all shows
    const filteredMovies = state.allMovies.filter((movie) =>
      movie.name.toLowerCase().includes(state.searchTerm) ||
      movie.genres.some(genre => genre.toLowerCase().includes(state.searchTerm)) ||
      (movie.summary && movie.summary.toLowerCase().includes(state.searchTerm))
    );
    displayMovies(filteredMovies);
    epiDropDownSelector.value = ""; // Reset episode dropdown when searching for shows
  } else {
    // If a show is selected, filter episodes
    const filteredEpisodes = state.cachedEpisodes[currentShowId].filter((episode) =>
      episode.name.toLowerCase().includes(state.searchTerm) ||
      (episode.summary && episode.summary.toLowerCase().includes(state.searchTerm))
    );

    // Reset the episode dropdown to show "All Episodes" when searching
    epiDropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
    filteredEpisodes.forEach((episode) => {
      const option = document.createElement("option");
      option.value = episode.id;
      option.textContent = `${episode.name} (S${episode.season}E${episode.number})`;
      epiDropDownSelector.appendChild(option);
    });

    // If no episodes match the search term, show "No episodes found" in the dropdown
    if (filteredEpisodes.length === 0) {
      const option = document.createElement("option");
      option.textContent = "No episodes found";
      epiDropDownSelector.appendChild(option);
    }

    displayEpisodes(filteredEpisodes); // Show filtered episodes
  }
}

// Episode selector change: show one episode
epiDropDownSelector.addEventListener("change", () => {
  if (!currentShowId || !state.cachedEpisodes[currentShowId]) return;

  const selectedEpisodeId = epiDropDownSelector.value;

  if (selectedEpisodeId === "") {
    displayEpisodes(state.cachedEpisodes[currentShowId]);
  } else {
    const episode = state.cachedEpisodes[currentShowId].find(
      ep => ep.id.toString() === selectedEpisodeId
    );
    if (episode) displayEpisodes([episode]);
  }
});

// Setup function
async function setup() {
  state.allMovies = await getMovies();
  populateShowSelector(state.allMovies);
  displayMovies(state.allMovies);
}

// Event listeners
window.onload = setup;
searchBox.addEventListener("input", searchResults);

dropDownSelector.addEventListener("change", async () => {
  const selectedShowId = dropDownSelector.value;
  if (!selectedShowId) {
    showShowListing();
    return;
  }

  currentShowId = selectedShowId;
  await episodeSelector(selectedShowId);
  epiDropDownSelector.value = "";
  displayEpisodeView(selectedShowId);
});
