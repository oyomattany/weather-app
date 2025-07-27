const API_KEY = "2347d5f04eae27e30935ed71b0b17f32";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherBox = document.getElementById("weatherResult");

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    const query = `${city},NG`;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`;

    showSpinner();
    fetchWeatherByUrl(url);
});

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    showSpinner();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
            fetchWeatherByUrl(url);
        },
        (error) => {
            alert("Location access denied. Showing Lagos instead.");
            const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?q=Lagos,NG&appid=${API_KEY}&units=metric`;
            fetchWeatherByUrl(fallbackUrl);
        }
    );
});

function fetchWeatherByUrl(url) {
    showSpinner();
    fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error("City not found or invalid request");
            return res.json();
        })
        .then((data) => {
            updateWeatherUI(data);
        })
        .catch((err) => {
            alert("Error: " + err.message);
            weatherBox.classList.add("hidden");
        })
        .finally(() => {
            hideSpinner();
        });
}

function updateWeatherUI(data) {
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("description").textContent = capitalize(data.weather[0].description);
    document.getElementById("temp").textContent = data.main.temp;
    document.getElementById("humidity").textContent = data.main.humidity;
    document.getElementById("wind").textContent = data.wind.speed;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherBox.classList.remove("hidden");
    getFiveDayForecast(data.name);
}

function getFiveDayForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(forecastUrl)
        .then(res => res.json())
        .then(data => {
            const forecastContainer = document.getElementById("forecastContainer");
            forecastContainer.innerHTML = "";

            const dailyForecast = {};
            data.list.forEach(entry => {
                const date = entry.dt_txt.split(" ")[0];
                if (!dailyForecast[date] && entry.dt_txt.includes("12:00:00")) {
                    dailyForecast[date] = entry;
                }
            });

            Object.keys(dailyForecast).slice(0, 5).forEach(date => {
                const entry = dailyForecast[date];
                const icon = entry.weather[0].icon;
                const temp = entry.main.temp.toFixed(1);
                const desc = capitalize(entry.weather[0].description);

                const item = document.createElement("div");
                item.className = "forecast-item";
                item.innerHTML = `
          <p><strong>${new Date(date).toDateString().slice(0, 10)}</strong></p>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
          <p>${temp}°C</p>
          <p>${desc}</p>
        `;
                forecastContainer.appendChild(item);
            });

            document.getElementById("forecastSection").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Forecast error:", err);
            document.getElementById("forecastSection").classList.add("hidden");
        });
}

function showSpinner() {
    document.getElementById("loadingSpinner").classList.remove("hidden");
}

function hideSpinner() {
    document.getElementById("loadingSpinner").classList.add("hidden");
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("clock").textContent = "🕒 " + time;
}
setInterval(updateClock, 1000);
updateClock();

window.addEventListener("load", () => {
    const defaultUrl = `https://api.openweathermap.org/data/2.5/weather?q=Lagos,NG&appid=${API_KEY}&units=metric`;
    fetchWeatherByUrl(defaultUrl);
});
