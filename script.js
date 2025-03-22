//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

const filmCardContainer = document.getElementById("filmCard-container");

function makePageForEpisodes(episodeList) {
  const allEpisodes = getAllEpisodes();
  allEpisodes.forEach(filmData =>{
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

window.onload = setup;
