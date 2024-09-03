const API_KEY = 'dd231d491e144fe784362349240309';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentWeatherContent = document.getElementById('current-weather-content');
const weeklyForecast = document.getElementById('weekly-forecast');
const uvIndex = document.getElementById('uv-index');
const airQuality = document.getElementById('air-quality');
let map;
let hourlyChart; 

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
        }
    }
});

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=yes`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        updateCurrentWeather(data.current, data.location);
        updateHourlyForecast(data.forecast.forecastday[0].hour);
        updateWeeklyForecast(data.forecast.forecastday);
        updateWeatherMap(data.location.lat, data.location.lon);
        updateUVIndex(data.current.uv);
        updateAirQuality(data.current.air_quality);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        currentWeatherContent.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function updateCurrentWeather(current, location) {
    const iconClass = getWeatherIcon(current.condition.code);
    currentWeatherContent.innerHTML = `
        <h3>${location.name}, ${location.country}</h3>
        <div class="current-weather-icon">
            <i class="wi ${iconClass}"></i>
        </div>
        <p>Temperature: ${current.temp_c}°C</p>
        <p>Condition: ${current.condition.text}</p>
        <p>Humidity: ${current.humidity}%</p>
        <p>Wind: ${current.wind_kph} km/h</p>
    `;
}

function updateHourlyForecast(hourlyData) {
    const ctx = document.getElementById('hourly-chart').getContext('2d');
    const labels = hourlyData.map(hour => new Date(hour.time).getHours() + ':00');
    const temperatures = hourlyData.map(hour => hour.temp_c);
    const icons = hourlyData.map(hour => getWeatherIcon(hour.condition.code));

    if (hourlyChart) {
        hourlyChart.destroy();
    }

    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `Temperature: ${context.parsed.y}°C`;
                        },
                        afterLabel: (context) => {
                            const iconClass = icons[context.dataIndex];
                            return `Condition: ${iconClass.replace('wi-', '').replace(/-/g, ' ')}`;
                        }
                    }
                }
            }
        }
    });
}

function updateWeeklyForecast(forecastData) {
    weeklyForecast.innerHTML = forecastData.map(day => {
        const iconClass = getWeatherIcon(day.day.condition.code);
        return `
            <div class="forecast-day">
                <p>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <div class="forecast-icon">
                    <i class="wi ${iconClass}"></i>
                </div>
                <p>${day.day.avgtemp_c}°C</p>
                <p>${day.day.condition.text}</p>
            </div>
        `;
    }).join('');
}

function updateWeatherMap(lat, lon) {
    if (!map) {
        map = L.map('weather-map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10);
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }

    L.marker([lat, lon]).addTo(map);
}

function updateUVIndex(uv) {
    uvIndex.textContent = uv;
}

function updateAirQuality(airQualityData) {
    const usEpaIndex = airQualityData["us-epa-index"];
    let aqiCategory;

    switch(usEpaIndex) {
        case 1: aqiCategory = 'Good'; break;
        case 2: aqiCategory = 'Moderate'; break;
        case 3: aqiCategory = 'Unhealthy for Sensitive Groups'; break;
        case 4: aqiCategory = 'Unhealthy'; break;
        case 5: aqiCategory = 'Very Unhealthy'; break;
        case 6: aqiCategory = 'Hazardous'; break;
        default: aqiCategory = 'Unknown';
    }

    airQuality.textContent = aqiCategory;
}
function getWeatherIcon(code) {
    const codeMap = {
        1000: 'wi-day-sunny',
        1003: 'wi-day-cloudy',
        1006: 'wi-cloudy',
        1009: 'wi-cloudy',
        1030: 'wi-fog',
        1063: 'wi-day-rain',
        1066: 'wi-day-snow',
        1069: 'wi-day-sleet',
        1072: 'wi-day-sleet',
        1087: 'wi-day-thunderstorm',
        1114: 'wi-snow',
        1117: 'wi-snow-wind',
        1135: 'wi-fog',
        1147: 'wi-fog',
        1150: 'wi-day-showers',
        1153: 'wi-day-showers',
        1168: 'wi-day-sleet',
        1171: 'wi-day-sleet',
        1180: 'wi-day-rain',
        1183: 'wi-day-rain',
        1186: 'wi-day-rain',
        1189: 'wi-day-rain',
        1192: 'wi-day-rain',
        1195: 'wi-day-rain',
        1198: 'wi-day-sleet',
        1201: 'wi-day-sleet',
        1204: 'wi-day-sleet',
        1207: 'wi-day-sleet',
        1210: 'wi-day-snow',
        1213: 'wi-day-snow',
        1216: 'wi-day-snow',
        1219: 'wi-day-snow',
        1222: 'wi-day-snow',
        1225: 'wi-day-snow',
        1237: 'wi-day-hail',
        1240: 'wi-day-showers',
        1243: 'wi-day-rain',
        1246: 'wi-day-rain',
        1249: 'wi-day-sleet',
        1252: 'wi-day-sleet',
        1255: 'wi-day-snow',
        1258: 'wi-day-snow',
        1261: 'wi-day-hail',
        1264: 'wi-day-hail',
        1273: 'wi-day-thunderstorm',
        1276: 'wi-day-thunderstorm',
        1279: 'wi-day-snow-thunderstorm',
        1282: 'wi-day-snow-thunderstorm'
    };
    return codeMap[code] || 'wi-day-sunny';  
}