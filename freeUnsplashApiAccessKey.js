const accessKey = "9beS940rLJidPSUoBNWeD9uSpKNV2F0ft6CJB1wvvF8";

const form = document.querySelector("form");
const input = document.querySelector("input");
const cols = document.querySelectorAll(".col");

let currentQuery = "horse";
let currentPage = 1;

// fetch data
const getData = async ({ query, page }) => {
    const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=30&client_id=${accessKey}`
    );
    const data = await response.json();
    return data.results;
};

// create card
const createCard = (image, col) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = image;

    card.appendChild(img);
    col.appendChild(card);
};

// clear old data
const clearImages = () => {
    cols.forEach(col => col.innerHTML = "");
};

// load images
const loadImages = async () => {
    const images = await getData({
        query: currentQuery,
        page: currentPage
    });

    images.forEach((img, idx) => {
        createCard(img.urls.regular, cols[idx % cols.length]);
    });
};

// default load
window.addEventListener("DOMContentLoaded", async () => {
    input.value = "horse";     // default input value
    clearImages();
    await loadImages();
});

// search submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const value = e.target.input.value.trim();
    if (!value) return;

    currentQuery = value;
    currentPage = 1;

    clearImages();      // ❌ remove old
    await loadImages(); // ✅ show new
});

