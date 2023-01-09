//API_KEY from open weather website..
const API_KEY = "2885a2c4947ec0377208bcc84e238d2d"

const getCurrentWeatherData = async () => {
    const city = "bilaspur";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const getHourlyForecast = async ({ name: city }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    // console.log(data);
    return data.list.map(forecast => {
        const { main: { temp, temp_max, temp_min}, dt, dt_txt, weather: [{description, icon}] } = forecast;
        return {temp, temp_max, temp_min, dt, dt_txt, description, icon}
    })
}

//to formate the temprature and get URL

const formatTemprature = (temp) => `${temp?.toFixed(1)}°`;
const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`;

// To load the data

const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemprature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemprature(temp_max)} L: ${formatTemprature(temp_min)}`;

}
const loadHourlyForecast = (hourlyForecast) => {
    console.log(hourlyForecast);
    let dataFor12Hours = hourlyForecast.slice(1,13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = ``;


    for(let {temp, icon, dt_txt} of dataFor12Hours){
        innerHTMLString += `<article>
        <h3 class="time">${dt_txt.split(" ")[1]}</h3>
        <img class="icon" src="${createIconUrl(icon)}" alt="Not found" />
        <p class="hourly-temp">${formatTemprature(temp)}</p>
    </article>`
    }
    hourlyContainer.innerHTML = innerHTMLString;
}

const loadFeelsLike = ({main:{feels_like}}) => {
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemprature(feels_like);
}

const loadHumidity = ({main:{humidity}}) => {
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent = `${humidity} %`;
}

document.addEventListener("DOMContentLoaded", async () => {
    const currentWeather = await getCurrentWeatherData();
    loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
})