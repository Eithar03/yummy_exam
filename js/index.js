"use strict";
// ---------------- Elements ----------------
const menu = document.querySelector('#menu');
const xIcon = document.querySelector('#x-icon');
const innerNavbar = document.querySelector('#inner-navbar');
const mealsSection = document.querySelector('#meals');
const searchSection = document.querySelector('#search');
const categorySection = document.querySelector('#category');
const areaSection = document.querySelector('#area');
const ingredientsSection = document.querySelector('#ingredients');
const contactSection = document.querySelector('#contact');
const detailsSection = document.querySelector('#details');

const loadingScreen = document.querySelector('#loding-screen');

// ---------------- API ----------------
const API = "https://www.themealdb.com/api/json/v1/1/";

// ---------------- Inputs & Submit ----------------
const inputs = document.querySelectorAll("#contact input");
const submitBtn = document.getElementById("submitBtn");

// ---------------- Regex ----------------
const regex = {
  name: /^[A-Za-z\s]{3,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10,14}$/,
  age: /^[1-9][0-9]?$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
};

// ---------------- Navbar ----------------
let open = false;

menu.addEventListener("click", toggleMenu);
xIcon.addEventListener("click", toggleMenu);

function toggleMenu() {
  if (!open) {
    innerNavbar.style.transform = "translateX(0)";
    menu.classList.add("d-none");
    xIcon.classList.remove("d-none");
  } else {
    innerNavbar.style.transform = "translateX(-260px)";
    xIcon.classList.add("d-none");
    menu.classList.remove("d-none");
  }
  open = !open;
}

function closeSideNav() {
  if (open) toggleMenu();
}

// ---------------- Sections ----------------
function hideAllSections(hideMeals = true) {
  if (hideMeals && mealsSection) mealsSection.classList.add('d-none');
  if (searchSection) searchSection.classList.add('d-none');
  if (categorySection) categorySection.classList.add('d-none');
  if (areaSection) areaSection.classList.add('d-none');
  if (ingredientsSection) ingredientsSection.classList.add('d-none');
  if (contactSection) contactSection.classList.add('d-none');
  if (detailsSection) detailsSection.classList.add('d-none');
}

// ---------------- Loading ----------------
function showLoading() {
  loadingScreen.classList.remove('d-none');
}

function hideLoading() {
  loadingScreen.classList.add('d-none');
}

// ---------------- Initial Meals ----------------
async function loadMeals() {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}search.php?s=`); 
  const data = await res.json();
  displayMeals(data.meals);
  hideLoading();
  mealsSection.classList.remove('d-none'); 
}

// ---------------- Search ----------------
function showSearchInputs() {
  hideAllSections();
  searchSection.classList.remove('d-none');
  closeSideNav();
}

document.getElementById('searchByName').addEventListener('input', e => {
  const value = e.target.value.trim();
  if (value) searchMealsByName(value);
});

document.getElementById('searchByLetter').addEventListener('input', e => {
  const value = e.target.value.trim();
  if (value) searchMealsByLetter(value);
});

async function searchMealsByName(name) {
  showLoading();
  const res = await fetch(`${API}search.php?s=${name}`);
  const data = await res.json();
  displayMeals(data.meals);
  hideLoading();
  searchSection.classList.remove('d-none');
  mealsSection.classList.remove('d-none');
}

async function searchMealsByLetter(letter) {
  showLoading();
  const res = await fetch(`${API}search.php?f=${letter}`);
  const data = await res.json();
  displayMeals(data.meals);
  hideLoading();
  searchSection.classList.remove('d-none');
  mealsSection.classList.remove('d-none');
}

// ---------------- Display Meals ----------------
function displayMeals(meals) {
  if (!mealsSection) return;

  if (!meals) {
    mealsSection.innerHTML = `<p class="text-center text-white">No meals found</p>`;
    return;
  }

  let html = `<div class="container"><div class="row gy-4">`;
  meals.forEach(meal => {
    html += `
      <div class="col-md-3">
        <div class="image-container position-relative cursor-pointer" onclick="getMealDetails('${meal.idMeal}')">
          <img src="${meal.strMealThumb}" class="img-fluid" alt="${meal.strMeal}" />
          <div class="overlay">
            <h3>${meal.strMeal}</h3>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div></div>`;
  mealsSection.innerHTML = html;
}

// ---------------- Meal Details ----------------
async function getMealDetails(id) {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}lookup.php?i=${id}`);
  const data = await res.json();
  displayMealDetails(data.meals[0]);
  hideLoading();
  detailsSection.classList.remove('d-none');
}

function displayMealDetails(meal) {
  detailsSection.innerHTML = `
    <div class="container">
      <div class="row py-5 g-4">
        <div class="col-md-4">
          <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <h2>${meal.strMeal}</h2>
        </div>
        <div class="col-md-8">
          <h2>Instructions</h2>
          <p>${meal.strInstructions}</p>
          <h3><span class="fw-bolder">Area: </span>${meal.strArea}</h3>
          <h3><span class="fw-bolder">Category: </span>${meal.strCategory}</h3>
          <h3>Recipes:</h3>
          <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${getIngredients(meal).map(ing => `<li class="alert alert-info m-2 p-1">${ing}</li>`).join('')}
          </ul>
          <h3>Tags:</h3>
          <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${meal.strTags ? meal.strTags.split(',').map(tag => `<li class="alert alert-danger m-2 p-1">${tag}</li>`).join('') : ''}
          </ul>
          <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
          <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
        </div>
      </div>
    </div>
  `;
}

function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
    }
  }
  return ingredients;
}

// ---------------- Categories ----------------
async function getCategories() {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}categories.php`);
  const data = await res.json();

  categorySection.innerHTML = `
    <div class="container"><div class="row gy-4">
      ${data.categories.map(cat => `
        <div class="col-md-3" onclick="getMealsByCategory('${cat.strCategory}')">
          <div class="image-container position-relative">
            <img src="${cat.strCategoryThumb}" class="img-fluid" alt="${cat.strCategory}" />
            <div class="overlay">
              <h3>${cat.strCategory}</h3>
              <p>${cat.strCategoryDescription.slice(0, 100)}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div></div>
  `;

  hideLoading();
  categorySection.classList.remove('d-none');
}

async function getMealsByCategory(category) {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}filter.php?c=${category}`);
  const data = await res.json();
  displayMeals(data.meals);
  hideLoading();
  mealsSection.classList.remove('d-none');
}

// ---------------- Area ----------------
async function getArea() {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}list.php?a=list`);
  const data = await res.json();

  areaSection.innerHTML = `
    <div class="container"><div class="row gy-4">
      ${data.meals.map(area => `
        <div class="col-md-3 text-center" onclick="getMealsByArea('${area.strArea}')">
          <i class="fa-solid fa-house-laptop fa-4x mb-1"></i>
          <h3>${area.strArea}</h3>
        </div>
      `).join('')}
    </div></div>
  `;

  hideLoading();
  areaSection.classList.remove('d-none');
}

async function getMealsByArea(area) {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}filter.php?a=${area}`);
  const data = await res.json();
  displayMeals(data.meals);
  hideLoading();
  mealsSection.classList.remove('d-none');
}

// ---------------- Ingredients ----------------
async function getIngredientsList() {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}list.php?i=list`);
  const data = await res.json();

  ingredientsSection.innerHTML = `
    <div class="container"><div class="row gy-4">
      ${data.meals.slice(0, 20).map(ing => `
        <div class="col-md-3 text-center" onclick="getMealsByIngredient('${ing.strIngredient}')">
          <i class="fa-solid fa-drumstick-bite fa-4x"></i>
          <h3>${ing.strIngredient}</h3>
          <p>${ing.strDescription ? ing.strDescription.slice(0, 50) : ''}</p>
        </div>
      `).join('')}
    </div></div>
  `;

  hideLoading();
  ingredientsSection.classList.remove('d-none');
}

async function getMealsByIngredient(ingredient) {
  showLoading();
  hideAllSections();
  const res = await fetch(`${API}filter.php?i=${ingredient}`);
  const data = await res.json();
  displayMeals(data.meals);
  hideLoading();
  mealsSection.classList.remove('d-none');
}
// ---------------- Contact Section ----------------
function showContacts() {
  hideAllSections();
  contactSection.classList.remove('d-none');
  closeSideNav();
}

// ---------------- Validation Function ----------------
function validateInput(element) {
  const id = element.id;
  let valid = false;

  if (id === "repassword") {
    const password = document.getElementById("password").value;
    valid = element.value === password && element.value !== "";
  } else {
    valid = regex[id].test(element.value.trim());
  }

  element.classList.toggle("is-valid", valid);
  element.classList.toggle("is-invalid", !valid);

// ---------------- alert ----------------
  const alert = element.nextElementSibling;
  if (alert) alert.classList.toggle("d-none", valid);

  // ---------------- status of submitBtn ----------------
  const allValid = Array.from(inputs).every(inp => {
    if (inp.id === "repassword") return inp.value === document.getElementById("password").value && inp.value !== "";
    return regex[inp.id].test(inp.value.trim());
  });
  submitBtn.disabled = !allValid;
}
inputs.forEach(input => input.addEventListener("input", () => validateInput(input)));


// ---------------- To display meals ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadMeals(); 
});
