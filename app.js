const userInput = document.querySelector(".userInput");
const searchBtn = document.querySelector(".search-btn");
const errorText = document.querySelector(".error-text");
const weatherCardsContainer = document.querySelector(".weather-cards");
const currentWeatherCard = document.querySelector(".current-weather");
const currentLocationBtn = document.querySelector(".btn-current-location");

const api_key = "4ae159cc8ffb524ac9c89a21134557b3";
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
// create weather cards
function createCard(name, weatherItem, index) {
  if (index == 0) {
    const dayInWeek = new Date(weatherItem.dt_txt);
    // console.log(dayInWeek.getDay());
    return `
    <div class="weather-details">
    <h2>${name} ${weatherItem.dt_txt.split(" ")[0]}</h2>
    <h3>${daysOfWeek[dayInWeek.getDay()]}</h3>
    <h3>Temperature: ${Math.floor(weatherItem.main.temp - 273.15)}°C</h3>
    <h3>Wind: ${weatherItem.wind.speed} M/S</h3>
    <h3>Pop: ${Math.floor(weatherItem.pop * 100)}%</h3>
  </div>
  <div class="weather-icon">
  <img
  src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"
  alt="weather-icon"
/>
    <h3>${weatherItem.weather[0].description}</h3>
  </div>
  </div>
    `;
  } else {
    //   console.log("weatherItems", weatherItem);
    const dayInWeek = new Date(weatherItem.dt_txt);
    // console.log(dayInWeek.getDay());
    return ` <li class="card">
    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
    <h3>${daysOfWeek[dayInWeek.getDay()]}</h3>
    <img
      src="https://openweathermap.org/img/wn/${
        weatherItem.weather[0].icon
      }@4x.png"
      alt="weather-icon"
    />
    <h3>Temp: ${Math.floor(weatherItem.main.temp - 273.15)}°C</h3>
    <h3>Wind:${weatherItem.wind.speed} M/S</h3>
    <h3>Pop: ${Math.floor(weatherItem.pop * 100)}%</h3>
  </li>`;
  }
}

async function getCityDetails(name, lat, lon) {
  const API = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${api_key}`;
  try {
    const response = await fetch(API);
    const data = await response.json();
    // console.log(data.list);
    const date = new Date();
    const currentDay = date.getDate();
    const timeLabels = [];
    const dataSet = [];
    // create rain chart
    for (let i = 0; i < data.list.length; i++) {
      const forecastDate = new Date(data.list[i].dt_txt).getDate();
      if (currentDay === forecastDate) {
        timeLabels.push(data.list[i].dt_txt.split(" ")[1].substring(0, 5));
        dataSet.push(data.list[i].pop);
      }
    }
    // console.log("timeLabels", timeLabels);
    // console.log("pop", dataSet);
    createRainChart(timeLabels, dataSet);
    // console.log(data.list);
    const forecastDays = [];
    const fiveDaysForeCast = data.list.filter((forecast) => {
      // filter out the date and push it into the array
      const forecastDate = new Date(forecast.dt_txt).getDate();
      // only take 1 forecast per day
      // this is the condition of the filter
      if (forecastDays.includes(forecastDate) == false) {
        return forecastDays.push(forecastDate);
      }
    });
    // console.log(fiveDaysForeCast);
    userInput.value = "";
    weatherCardsContainer.innerHTML = "";
    currentWeatherCard.innerHTML = "";
    fiveDaysForeCast.forEach((weatherItem, index) => {
      if (index === 0) {
        currentWeatherCard.insertAdjacentHTML(
          "beforeend",
          createCard(name, weatherItem, index)
        );
      } else {
        weatherCardsContainer.insertAdjacentHTML(
          "beforeend",
          createCard(name, weatherItem, index)
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// user input string validation
function validateCityInput(city) {
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(city);
}

// get serched city weather
async function getCityWeather() {
  let city = userInput.value.trim();
  if (city === "" || !validateCityInput(city)) {
    errorText.classList.remove("-hide");
  } else {
    errorText.classList.add("-hide");
    // city = userInput.value.trim();
    const API = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}`;
    try {
      const response = await fetch(API);
      const data = await response.json();
      // set multiple variables at once
      const { name, lat, lon } = data[0];
      // execute getCityDetails and pass details as arguments
      getCityDetails(name, lat, lon);
      localStorage.setItem("city", name);
    } catch (error) {
      // console.log(error);
      errorText.classList.remove("-hide");
    }
  }
}

// get weather of current location
function getCurrentLocationWeather() {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      // console.log("success", position);
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const api = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api_key}`;
      try {
        const res = await fetch(api);
        const data = await res.json();
        // console.log("reverse", data);
        const name = data[0].name;
        // execute getCityDetails and pass details as arguments
        getCityDetails(name, lat, lon);
        localStorage.setItem("city", name);
      } catch (error) {
        console.log(error);
      }
    },
    (err) => {
      if ((err.message = "error User denied Geolocation")) {
        alert("Please allow geo location");
      }
    }
  );
}

// get city weather if there's one in localstorage
async function getPreviousCity() {
  const previousCity = localStorage.getItem("city");
  let city;
  if (previousCity) {
    city = previousCity;
  }
  const API = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}`;
  try {
    const response = await fetch(API);
    const data = await response.json();
    // set multiple variables at once
    const { name, lat, lon } = data[0];
    getCityDetails(name, lat, lon);
  } catch (error) {
    console.log(error);
  }
}

searchBtn.addEventListener("click", getCityWeather);
currentLocationBtn.addEventListener("click", getCurrentLocationWeather);
userInput.addEventListener("keyup", (e) => {
  e.keyCode == 13 && getCityWeather();
});
getPreviousCity();
createPlaceHolderChart();

// Chart.js
function createRainChart(timeLabels, dataSet) {
  const oldCanvas = document.querySelector("#myCanvas");
  const oldChart = Chart.getChart(oldCanvas);
  if (oldChart) {
    oldChart.destroy();
  }

  const ctx = document.querySelector("#myCanvas");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "Chance of Rain Today",
          data: dataSet,
          borderWidth: 0.5,
          borderRadius: 5,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return Math.floor(value * 100) + "%";
            },
          },
        },
      },
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem) {
          return tooltipItem.value + "%";
        },
      },
    },
  });
}

// create fake placeholder chart
function createPlaceHolderChart() {
  const oldCanvas = document.querySelector("#myCanvas");
  const oldChart = Chart.getChart(oldCanvas);
  const previousCity = localStorage.getItem("city");
  if (oldChart) {
    oldChart.destroy();
  }
  if (!previousCity) {
    const ctx = document.querySelector("#myCanvas");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
        datasets: [
          {
            label: "Chance of Rain Today",
            data: [1, 1, 1, 1, 1, 1],
            borderWidth: 0.5,
            borderRadius: 5,
          },
        ],
      },
      options: {
        scales: {
          y: {
            gridLines: {
              display: false,
            },
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return Math.floor(value * 100) + "%";
              },
            },
          },
          x: {
            gridLines: {
              display: false,
            },
          },
        },
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.value + "%";
          },
        },
      },
    });
  }
}
