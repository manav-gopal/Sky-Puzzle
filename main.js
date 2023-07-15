const DAYS_OF_THE_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
let selectedCityText;
let selectedCity;

//API_KEY from open weather website..
const API_KEY = "2885a2c4947ec0377208bcc84e238d2d";

const getCitiesGeoLocation = async (searchText) => {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`);
    return response.json();
}

//get data from the API....
const getCurrentWeatherData = async ({lat,lon,name: city}) => {
    const url = lat && lon ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric` : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    return response.json();
}

const getHourlyForecast = async ({ name: city }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    console.log(data);
    return data.list.map(forecast => {
        const { main: { temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return { temp, temp_max, temp_min, dt, dt_txt, description, icon }
    })
}

//to formate the temprature and get URL

const formatTemprature = (temp) => `${temp?.toFixed(0)}°`;
// const createIconUrl = (icon) => {return `https://openweathermap.org/img/wn/${icon}@2x.png`}; // its for openweather api's png
const createIconUrl = (icon) => {
    switch (icon) {
        case '01d':
            return './icons/static/sun.png';
        case '01n':
            return './icons/static/night.png';
        case '02d':
            return './icons/static/cloudy.png';
        case '02n':
            return './icons/static/cloudy-night.png';
        case '03d':
            return './icons/static/clouds.png';
        case '03n':
            return './icons/static/clouds.png';
        case '04d':
            return './icons/static/clouds.png';
        case '04n':
            return './icons/static/clouds.png';
        case '09d':
            return './icons/static/rain.png';
        case '09n':
            return './icons/static/rain.png';
        case '10d':
            return './icons/static/rain (2).png';
        case '10n':
            return './icons/static/rain.png';
        case '11d':
            return './icons/static/storm.png';
        case '11n':
            return './icons/static/storm.png';
        case '13d':
            return './icons/static/snow.png';
        case '13n':
            return './icons/static/snow.png';
        case '50d':
            return './icons/static/foggy.png';
        case '50n':
            return './icons/static/foggy.png';
    
        default:
            return './icons/static/clouds.png'
    }
}
function pngtogif(test){
    switch (test) {
        case "./icons/static/sun.png":
             return './icons/sun.gif';
        case "./icons/static/sun.png":
             return './icons/night.gif';
        case './icons/static/cloudy.png':
             return './icons/cloudy.gif';
        case './icons/static/cloudy-night.png':
             return './icons/cloudy-night.gif';
        case './icons/static/clouds.png':
             return './icons/clouds.gif';
        case './icons/static/rain.png':
             return './icons/rain.gif';
        case './icons/static/rain (2).png':
             return './icons/rain (2).gif';
        case './icons/static/storm.png':
             return './icons/storm.gif';
        case './icons/static/snow.png':
             return './icons/snow.gif';
        case './icons/static/foggy.png':
             return './icons/foggy.gif';
        default:
            return test;
    }
}
function giftopng(test){
    switch (test) {
        case './icons/sun.gif':
             return './icons/static/sun.png';
        case './icons/night.gif':
             return './icons/static/night.png';
        case './icons/cloudy.gif':
             return './icons/static/cloudy.png';
        case './icons/cloudy-night.gif':
             return './icons/static/cloudy-night.png';
        case './icons/clouds.gif':
             return './icons/static/clouds.png';
        case './icons/rain.gif':
             return './icons/static/rain.png';
        case './icons/rain (2).gif':
             return './icons/static/rain (2).png';
        case './icons/storm.gif':
             return './icons/static/storm.png';
        case './icons/snow.gif':
             return './icons/static/snow.png';
        case './icons/foggy.gif':
             return './icons/static/foggy.png';
        default:
            return test;
    }
}
document.body.addEventListener("mouseover", function(e) {
    if (e.target.classList.contains("icon")) {
        var t = e.target.getAttribute("src");
        console.log(t);
        path = pngtogif(t);
        e.target.src = path;
    }
  },false)
document.body.addEventListener("mouseout", function(e) {
    if (e.target.classList.contains("icon")) {
        var t = e.target.getAttribute("src");
        console.log(t);
        path = giftopng(t);
        e.target.src = path;
    }
  },false)

// To load the data

const loadCurrentForecast = ({ name, main: { temp }, weather: [{ description, icon }], rain }) => {
    console.log("currrrrent icon: ", rain['1h']);
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".icon").src = `${createIconUrl(icon)}`;
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemprature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    
    var rainPer = rain['1h']*100;
    var rainRoundedPer = Math.round(rainPer/3);

    currentForecastElement.querySelector(".rainChanse").textContent = `Rain - ${rainRoundedPer}%`;
}

//Loading the hourly forecast

const loadHourlyForecast = ({ main: { temp: tempNow }, weather: [{ icon: iconNow }] }, hourlyForecast) => {
    const timeFormatter = Intl.DateTimeFormat("en", {
        hour12: true, hour: "numeric"
    });
    let dataFor12Hours = hourlyForecast.slice(2, 9); // 8 entries
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString =
        `<article>
        <h3 class="time">Now</h3>
        <img class="icon" src="${createIconUrl(iconNow)}" alt="Not found" />
        <p class="hourly-temp">${formatTemprature(tempNow)}</p>
        </article>`;


    for (let { temp, icon, dt_txt } of dataFor12Hours) {
        innerHTMLString += `<article>
        <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
        <img class="icon" src="${createIconUrl(icon)}" alt="Not found" />
        <p class="hourly-temp">${formatTemprature(temp)}</p>
        </article>`
        // <h3 class="time">${dt_txt.split(" ")[1]}</h3>  << we could also use this 
        // to get data without formatted.... 
    }
    hourlyContainer.innerHTML = innerHTMLString;
}

// five day forecast

const calculateDayWiseForecast = (hourlyForecast) => {
    let dayWiseForecast = new Map();
    console.log("this is dayWiseForecast : ",hourlyForecast);
    for (let forecast of hourlyForecast) {
        const [date] = forecast.dt_txt.split(" ");
        const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
        // console.log(dayOfTheWeek);
        if (dayWiseForecast.has(dayOfTheWeek)) {
            let forecastForDay = dayWiseForecast.get(dayOfTheWeek);
            forecastForDay.push(forecast);
            dayWiseForecast.set(dayOfTheWeek, forecastForDay);
        } else {
            dayWiseForecast.set(dayOfTheWeek, [forecast])
        }
    }
    // console.log(dayWiseForecast);
    for (let [key, value] of dayWiseForecast) {
        let temp_min = Math.min(...Array.from(value, val => val.temp_min));
        let temp_max = Math.max(...Array.from(value, val => val.temp_max));

        dayWiseForecast.set(key, { temp_min, temp_max, icon: value.find(v => v.icon).icon });
    }
    console.log(dayWiseForecast);
    return dayWiseForecast;
}
const loadFiveDayForecast = (hourlyForecast) => {
    console.log(hourlyForecast);
    const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
    const container = document.querySelector('.five-day-forecast-container');
    let dayWiseInfo = "";
    Array.from(dayWiseForecast).map(([day, { temp_max, temp_min, icon }], index) => {

        if (index < 5) {
            dayWiseInfo += `<article class="day-wise-forecast">
                        <h3 class="day">${index === 0 ? "Today" : day}</h3>
                        <img class="icon" src="${createIconUrl(icon)}" alt="Not Found" />
                        <p class="min-temp">${formatTemprature(temp_min)}</p>
                        <p class="max-temp">${formatTemprature(temp_max)}</p>
                        </article>`;
        }
    });
    container.innerHTML = dayWiseInfo;
}

const loadFeelsLike = ({ main: { feels_like } }) => {
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemprature(feels_like);
}

const loadHumidity = ({ main: { humidity } }) => {
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent = `${humidity} %`;
}
const loadWind = ({ wind: { speed } }) => {
    let container = document.querySelector("#wind");
    container.querySelector(".wind").textContent = `${speed.toFixed(1)}m/s`;
}

const loadData = async () => {
    const currentWeather = await getCurrentWeatherData(selectedCity);
    console.log("it is CW: ", currentWeather)
    loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast)
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    loadWind(currentWeather);
}

loadForecastUsingGeoLocation = () => {
    navigator.geolocation.getCurrentPosition(({coords}) =>{
        const {latitude: lat, longitude: lon} = coords;
        selectedCity = {lat,lon};
        loadData();
    }, error => console.log(error))
}
//Search input debouncing to get delay in fetching

function debounce(func) {
    let timer;
    return (...args) => {
        clearTimeout(timer); // It clears existing timout
        // Create a new time till the user typing....
        timer = setTimeout(() => {
            console.log("debounce");
            func.apply(this, args);
        }, 500);
    }
}

//display the options on the screen
const onSearchChange = async (event) => {
    let { value } = event.target;
    if (!value) {
        selectedCity = null;
        selectedCityText = ""; 
    }
    if (value && (selectedCityText !== value)) {
        const listOfCities = await getCitiesGeoLocation(value);
        let option = "";
        for (let { lat, lon, name, state, country } of listOfCities) {
            let cityDetails = JSON.stringify({ lat, lon, name });
            option += `<option data-city-details='${cityDetails}' value="${name}, ${state}, ${country}"></option>`;
        }
        document.querySelector("#cities").innerHTML = option;
        console.log(listOfCities);
    }
    
}

//selection of the option
const handleCitySelection = (event) => {
    console.log("Selection done");
    selectedCityText = event.target.value;
    console.log(selectedCity);
    let options = document.querySelectorAll("#cities > option");
    console.log(options);
    if (options?.length) {
        let selectedOption = Array.from(options).find(opt => opt.value === selectedCityText);
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
        console.log({ selectedCity });
        loadData();

        // Clear the search input value
        document.querySelector("#search").value = "";
    }
}

const debounceSearch = debounce((event) => onSearchChange(event));

document.addEventListener("DOMContentLoaded", async () => {
    loadForecastUsingGeoLocation();
    const searchInput = document.querySelector("#search");
    searchInput.addEventListener("input", debounceSearch);
    searchInput.addEventListener("change", handleCitySelection);

    
})