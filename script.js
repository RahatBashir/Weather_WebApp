const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weather_img = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');
const location_not_found = document.querySelector('.location-not-found');
const weather_body = document.querySelector('.weather-body');
const hourlyForecastContainer = document.querySelector('.hourly-forecast');
const dailyForecastContainer = document.querySelector('.daily-forecast');

const api_key = "79bb95074479d818e0e8553281e51392";
const baseUrl = "https://api.openweathermap.org/data/2.5";

async function checkWeather(city) {
    const currentWeatherUrl = `${baseUrl}/weather?q=${city}&appid=${api_key}`;
    const forecastUrl = `${baseUrl}/forecast?q=${city}&appid=${api_key}`;

    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl).then(response => response.json()),
            fetch(forecastUrl).then(response => response.json())
        ]);

        if (currentWeatherResponse.cod === `404`) {
            location_not_found.style.display = "flex";
            weather_body.style.display = "none";
            return;
        }

        location_not_found.style.display = "none";
        weather_body.style.display = "flex";

        // Display current weather data
        temperature.innerHTML = `${Math.round(currentWeatherResponse.main.temp - 273.15)}°C`;
        description.innerHTML = `${currentWeatherResponse.weather[0].description}`;
        humidity.innerHTML = `${currentWeatherResponse.main.humidity}%`;
        wind_speed.innerHTML = `${currentWeatherResponse.wind.speed}Km/H`;

        switch (currentWeatherResponse.weather[0].main) {
            case 'Clouds':
                weather_img.src = "/assets/cloud.png";
                break;
            case 'Clear':
                weather_img.src = "/assets/clear.png";
                break;
            case 'Rain':
                weather_img.src = "/assets/rain.png";
                break;
            case 'Mist':
                weather_img.src = "/assets/mist.png";
                break;
            case 'Snow':
                weather_img.src = "/assets/snow.png";
                break;
            default:
                weather_img.src = ""; // Default image if no match
                break;
        }

        // Display hourly forecast
        hourlyForecastContainer.innerHTML = ""; // Clear previous forecast data
        forecastResponse.list.slice(0, 5).forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000); // Convert timestamp to date
            const hours = forecastDate.getHours();
            const formattedTime = `${hours % 12 || 12} ${hours >= 12 ? 'PM' : 'AM'}`;
            const tempCelsius = Math.round(forecast.main.temp - 273.15);
            const weatherIcon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

            hourlyForecastContainer.innerHTML += `
                <div class="forecast-item">
                    <div>${formattedTime}</div>
                    <img src="${weatherIcon}" alt="Weather icon">
                    <div>${tempCelsius}°C</div>
                </div>
            `;
        });

        // Display daily forecast
        dailyForecastContainer.innerHTML = ""; // Clear previous forecast data
        const dailyData = {};

        // Group data by day
        forecastResponse.list.forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000);
            const day = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });

            if (!dailyData[day]) {
                dailyData[day] = [];
            }
            dailyData[day].push(forecast);
        });

        // Process grouped data
        Object.keys(dailyData).slice(0, 5).forEach(day => {
            const dayForecasts = dailyData[day];
            const dayTempCelsius = Math.round(
                dayForecasts.reduce((sum, forecast) => sum + forecast.main.temp, 0) / dayForecasts.length - 273.15
            );
            const weatherIcon = `https://openweathermap.org/img/wn/${dayForecasts[0].weather[0].icon}@2x.png`;

            dailyForecastContainer.innerHTML += `
                <div class="forecast-item">
                    <div>${day}</div>
                    <img src="${weatherIcon}" alt="Weather icon">
                    <div>${dayTempCelsius}°C</div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

searchBtn.addEventListener('click', () => {
    checkWeather(inputBox.value);
});
