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
    // console.log(data);
    return data.list.map(forecast => {
        const { main: { temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return { temp, temp_max, temp_min, dt, dt_txt, description, icon }
    })
}

//to formate the temprature and get URL

// console.log("this is icon : ",icon);
const formatTemprature = (temp) => `${temp?.toFixed(1)}°`;
const createIconUrl = (icon) => {console.log("this is icon : ",icon);return `http://openweathermap.org/img/wn/${icon}@2x.png`};

// To load the data

const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemprature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemprature(temp_max)} L: ${formatTemprature(temp_min)}`;

}

//Loading the hourly forecast

const loadHourlyForecast = ({ main: { temp: tempNow }, weather: [{ icon: iconNow }] }, hourlyForecast) => {
    const timeFormatter = Intl.DateTimeFormat("en", {
        hour12: true, hour: "numeric"
    });
    let dataFor12Hours = hourlyForecast.slice(2, 14); // 12 entries
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
    for (let forecast of hourlyForecast) {
        const [date] = forecast.dt_txt.split(" ");
        const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
        console.log(dayOfTheWeek);
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

const loadData = async () => {
    const currentWeather = await getCurrentWeatherData(selectedCity);
    console.log(currentWeather);
    loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast)
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
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
    let options = document.querySelectorAll("#cities > option");
    console.log(options);
    if (options?.length) {
        let selectedOption = Array.from(options).find(opt => opt.value === selectedCityText);
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
        console.log({ selectedCity });
        loadData();
    }
}

const debounceSearch = debounce((event) => onSearchChange(event));

document.addEventListener("DOMContentLoaded", async () => {
    loadForecastUsingGeoLocation();
    const searchInput = document.querySelector("#search");
    searchInput.addEventListener("input", debounceSearch);
    searchInput.addEventListener("change", handleCitySelection);

    
})