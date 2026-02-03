const apiKey = '7b1a76fa60c14ddeb0551357260302';
const cityInput = document.getElementById('citySearch');
const searchBtn = document.getElementById('searchBtn');

async function updateWeather(city) {
    try {
        // Using forecast endpoint to get 3-day data and AQI
        const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=yes`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        populateUI(data);
    } catch (err) {
        alert("City not found. Please try again!");
    }
}

function populateUI(data) {
    const cur = data.current;
    const today = data.forecast.forecastday[0];

    // 1. Hero Info
    document.getElementById('cityName').innerText = data.location.name;
    document.getElementById('tempMain').innerText = Math.round(cur.temp_c) + '°';
    document.getElementById('conditionText').innerText = cur.condition.text;
    document.getElementById('mainIcon').src = "https:" + cur.condition.icon.replace('64x64', '128x128');
    document.getElementById('highTemp').innerText = Math.round(today.day.maxtemp_c) + '°';
    document.getElementById('lowTemp').innerText = Math.round(today.day.mintemp_c) + '°';

    // Date Formatting
    const dateOptions = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    document.getElementById('dateTag').innerText = new Date().toLocaleDateString('en-GB', dateOptions);

    // 2. 3-Day Forecast
    const forecastRow = document.getElementById('forecastRow');
    forecastRow.innerHTML = '';
    data.forecast.forecastday.forEach(day => {
        const dateLabel = new Date(day.date).toLocaleDateString('en-GB', { month: 'short', day: '2-digit' });
        forecastRow.innerHTML += `
                    <div class="forecast-card">
                        <div class="date">${dateLabel}</div>
                        <img src="https:${day.day.condition.icon}">
                        <div class="f-temp">${Math.round(day.day.avgtemp_c)}°C</div>
                    </div>`;
    });

    // 3. UV Gauge (180deg semi-circle logic)
    const uv = cur.uv;
    document.getElementById('uvVal').innerText = uv;
    // Max UV is approx 12 for the gauge scale
    const fillDegrees = (Math.min(uv, 12) / 12) * 180;
    document.documentElement.style.setProperty('--gauge-fill', `${fillDegrees}deg`);

    const uvLevels = ["Low", "Low", "Low", "Moderate", "Moderate", "Moderate", "High", "High", "Very High", "Very High", "Extreme"];
    document.getElementById('uvStatus').innerText = uvLevels[Math.floor(uv)] || "Extreme";

    // 4. AQI & Wind
    const aqi = cur.air_quality["us-epa-index"];
    const aqiLabels = ["Good", "Moderate", "Unhealthy (S)", "Unhealthy", "Very Unhealthy", "Hazardous"];
    document.getElementById('aqiText').innerText = `${aqi}-${aqiLabels[aqi - 1] || 'N/A'}`;
    document.getElementById('aqiBar').style.width = (aqi * 16.6) + '%';

    document.getElementById('humVal').innerText = cur.humidity + '%';

    const wind = cur.wind_kph;
    document.getElementById('windVal').innerText = wind + ' kph';
    document.getElementById('windBar').style.width = Math.min(wind * 2, 100) + '%';
}

// Event Listeners
searchBtn.addEventListener('click', () => updateWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') updateWeather(cityInput.value);
});

// Initialize with default city
updateWeather('London');