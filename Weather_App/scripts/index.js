document.addEventListener("DOMContentLoaded", (_event) => {
  localStorage.removeItem("favorites");

  alert("After DOM has loaded");

  // todo: Add code here that updates the HTML, registers event listeners, calls HTTP endpoints, etc.

  const ulElement = document.querySelector(".class");

  document.getElementById("autocomplete").addEventListener("input", function (e) {
    var input = this.value;
    var list = document.getElementById("autocomplete-list");
    if (list) list.parentNode.removeChild(list);
    if (!input) return false;
    var div = document.createElement("DIV");
    div.setAttribute("id", "autocomplete-list");
    this.parentNode.appendChild(div);
    fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&apiKey=c33d44a5150e412483f77a6ffff36462`
    )
      .then((response) => response.json())
      .then((data) => {
        data.features.forEach((feature) => {
          var div2 = document.createElement("DIV");
          div2.innerHTML = feature.properties.formatted;
          div2.addEventListener("click", function (e) {
            document.getElementById("autocomplete").value = this.innerText;
            document
              .getElementById("autocomplete-list")
              .parentNode.removeChild(
                document.getElementById("autocomplete-list")
              );
            // Fetch weather for selected city
            weather.fetchWeather(this.innerText);
          });
          div.appendChild(div2);
        });
      });
  });

  let weather = {
    apiKey: "647aca55df95cf120e9b44872b27a64f",
    fetchWeather:async function (city) {
      
      ulElement.classList.add("loader");

      try {
      const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
          city +
          "&units=metric&appid=" +
          this.apiKey
      );

      const tasksOfOwner = await response.json();

      ulElement.classList.remove("loader");
      fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
          city +
          "&units=metric&appid=" +
          this.apiKey
      )
        .then((response) => {
          if (!response.ok) {
            alert("No weather found.");
            throw new Error("No weather found.");
          }
          return response.json();
        })
        .then((data) => {
          this.displayWeather(data);
        })
        .catch((error) => console.error("Error fetching weather:", error));
    } catch (error) {
      console.error("Error in try block:", error);
      // Handle the error as needed
    }},
    displayWeather: function (data) {
      const { name } = data;
      const { icon, description } = data.weather[0];
      const { temp, humidity } = data.main;
      const { speed } = data.wind;
      document.querySelector(".city").innerText = "Weather in " + name;
      document.querySelector(".icon").src =
        "https://openweathermap.org/img/wn/" + icon + ".png";
      document.querySelector(".description").innerText = description;
      document.querySelector(".temp").innerText = temp + "°C";
      document.querySelector(".humidity").innerText =
        "Humidity: " + humidity + "%";
      document.querySelector(".wind").innerText =
        "Wind speed: " + speed + " km/h";
      document.querySelector(".weather").classList.remove("loading");
      document.body.style.backgroundImage =
        "url('https://source.unsplash.com/1600x900/?" + name + "')";
      this.fetchForecast(name);
    },
    search: function () {
      const selectedCity = document.getElementById("autocomplete").value;
      this.fetchWeather(selectedCity);
      this.fetchForecast(selectedCity);
    },
    fetchForecast: function (city) {
      fetch(
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
          city +
          "&units=metric&appid=" +
          this.apiKey
      )
        .then((response) => {
          if (!response.ok) {
            alert("No forecast found.");
            throw new Error("No forecast found.");
          }
          return response.json();
        })
        .then((data) => {
          this.displayForecast(data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    displayForecast: function (data) {
      const forecastContainer = document.querySelector(".forecast");
      forecastContainer.innerHTML = "";
      for (let i = 0; i < data.list.length; i += 8) {
        const forecastItem = data.list[i];
        const date = new Date(forecastItem.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const temp = forecastItem.main.temp;
        const icon = forecastItem.weather[0].icon;

        const forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-card");
        forecastCard.innerHTML = `
                  <div class="forecast-date">${day}</div>
                  <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" class="forecast-icon">
                  <div class="forecast-temp">${temp}°C</div>
              `;

        forecastContainer.appendChild(forecastCard);
      }
    },
  };

  document.getElementById("autocomplete-button").addEventListener("click", function () {
    weather.search();
  });

  document.getElementById("autocomplete").addEventListener("input", function (e) {
    const input = this.value;
    const list = document.getElementById("autocomplete-list");
    if (list) list.parentNode.removeChild(list);
    if (!input) return false;
    const div = document.createElement("DIV");
    div.setAttribute("id", "autocomplete-list");
    this.parentNode.appendChild(div);
    fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&apiKey=c33d44a5150e412483f77a6ffff36462`
    )
      .then((response) => response.json())
      .then((data) => {
        data.features.forEach((feature) => {
          const div2 = document.createElement("DIV");
          div2.innerHTML = feature.properties.formatted;
          div2.addEventListener("click", function (e) {
            document.getElementById("autocomplete").value = this.innerText;
            document
              .getElementById("autocomplete-list")
              .parentNode.removeChild(
                document.getElementById("autocomplete-list")
              );
            // Fetch weather for selected city
            weather.fetchWeather(this.innerText);
          });
          div.appendChild(div2);
        });
      });
  });

  document.getElementById("autocomplete").addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      weather.search();
    }
  });

  // New code for favorites button
  const heartButton = document.getElementById("heart");
  heartButton.addEventListener("click", () => {
    const searchInput = document.querySelector("#autocomplete");
    const favoritesList = document.querySelector("#favorites-list");

    let favoriteCities = JSON.parse(localStorage.getItem("favorites")) || [];
    const city = searchInput.value;

    if (!favoriteCities.includes(city)) {
      favoriteCities.push(city);
      localStorage.setItem("favorites", JSON.stringify(favoriteCities));
      displayFavorites();
    }
  });

  function displayFavorites() {
    const favoritesList = document.querySelector("#favorites-list");
    favoritesList.innerHTML = "";
    const cities = JSON.parse(localStorage.getItem("favorites")) || [];

    cities.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = city;

      li.addEventListener("click", () => {
        document.getElementById("autocomplete").value = city;
        weather.search();
      });

      const heart = document.createElement("i");
      heart.classList.add("far", "fa-heart");
      heart.addEventListener("click", () => {
        heart.classList.toggle("fas");
        heart.classList.toggle("far");
      });

      li.appendChild(heart);
      favoritesList.appendChild(li);
    });
  }

  // Display favorites on page load
  displayFavorites();

  // Initial weather fetch for a default city (e.g., Bucharest)
  weather.fetchWeather("Bucharest");
});
