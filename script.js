const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key

async function getWeather(city = null, coords = null) {
  let currentWeatherUrl;
  let forecastUrl;

  if (city) {
    currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  } else if (coords) {
    const { lat, lon } = coords;
    currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayCurrentWeather(currentData);
    displayForecast(forecastData);

  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<p>Error fetching data.</p>`;
    console.error(error);
  }
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        getWeather(null, coords);
      },
      error => {
        alert("Location access denied.");
      }
    );
  } else {
    alert("Geolocation not supported by this browser.");
  }
}

function displayCurrentWeather(data) {
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById("weatherResult").innerHTML = `
    <h3>${data.name}, ${data.sys.country}</h3>
    <img src="${icon}" alt="Weather icon" />
    <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
  `;
}

function displayForecast(data) {
  const forecastEl = document.getElementById("forecastContainer");
  forecastEl.innerHTML = "";

  const forecastMap = new Map();

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!forecastMap.has(date) && item.dt_txt.includes("12:00:00")) {
      forecastMap.set(date, item);
    }
  });

  forecastMap.forEach(item => {
    const date = new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    forecastEl.innerHTML += `
      <div class="forecast-day">
        <h4>${date}</h4>
        <img src="${icon}" alt="icon" />
        <p>${item.main.temp}°C</p>
      </div>
    `;
  });
}

  