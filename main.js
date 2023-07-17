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
const getCurrentWeatherData = async ({ lat, lon, name: city }) => {
    const url = lat && lon ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric` : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    return response.json();
}

const getHourlyForecast = async ({ name: city }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    console.log(data);
    return data.list.map(forecast => {
        const { main: { temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }], rain } = forecast;
        return { temp, temp_max, temp_min, dt, dt_txt, description, icon, rain }
    })
}

//to formate the temprature and get URL

const formatTemprature = (temp) => `${temp?.toFixed(0)}°`;
// const createIconUrl = (icon) => {return `https://openweathermap.org/img/wn/${icon}@2x.png`}; // its for openweather api's png

const iconUrls = {
    '01d': {
        static: './icons/static/sun.png',
        animated: './icons/animated/sun.gif'
    },
    '01n': {
        static: './icons/static/night.png',
        animated: './icons/animated/night.gif'
    },
    '02d': {
        static: './icons/static/cloudy.png',
        animated: './icons/animated/cloudy.gif'
    },
    '02n': {
        static: './icons/static/cloudy-night.png',
        animated: './icons/animated/cloudy-night.gif'
    },
    '03d': {
        static: './icons/static/clouds.png',
        animated: './icons/animated/clouds.gif'
    },
    '03n': {
        static: './icons/static/clouds.png',
        animated: './icons/animated/clouds.gif'
    },
    '04d': {
        static: './icons/static/clouds.png',
        animated: './icons/animated/clouds.gif'
    },
    '04n': {
        static: './icons/static/clouds.png',
        animated: './icons/animated/clouds.gif'
    },
    '09d': {
        static: './icons/static/rain.png',
        animated: './icons/animated/rain.gif'
    },
    '09n': {
        static: './icons/static/rain.png',
        animated: './icons/animated/rain.gif'
    },
    '10d': {
        static: './icons/static/rain (2).png',
        animated: './icons/animated/rain (2).gif'
    },
    '10n': {
        static: './icons/static/rain.png',
        animated: './icons/animated/rain.gif'
    },
    '11d': {
        static: './icons/static/storm.png',
        animated: './icons/animated/storm.gif'
    },
    '11n': {
        static: './icons/static/storm.png',
        animated: './icons/animated/storm.gif'
    },
    '13d': {
        static: './icons/static/snow.png',
        animated: './icons/animated/snow.gif'
    },
    '13n': {
        static: './icons/static/snow.png',
        animated: './icons/animated/snow.gif'
    },
    '50d': {
        static: './icons/static/foggy.png',
        animated: './icons/animated/foggy.gif'
    },
    '50n': {
        static: './icons/static/foggy.png',
        animated: './icons/animated/foggy.gif'
    }
};

const createIconUrl = (icon) => {
    const iconUrl = iconUrls[icon];
    if (iconUrl) {
        return iconUrl.static;
    } else {
        return './icons/static/clouds.png'; // Default icon URL
    }
};

const toggleIconAnimation = (iconElement) => {
    const currentUrl = iconElement.getAttribute('src');
    const staticIconPath = './icons/static/';
    const animatedIconPath = './icons/animated/';

    if (currentUrl.includes(staticIconPath)) {
        const iconName = currentUrl.replace(staticIconPath, '');
        const animatedUrl = animatedIconPath + iconName.replace('.png', '.gif');
        iconElement.setAttribute('src', animatedUrl);
    } else if (currentUrl.includes(animatedIconPath)) {
        const iconName = currentUrl.replace(animatedIconPath, '');
        const staticUrl = staticIconPath + iconName.replace('.gif', '.png');
        iconElement.setAttribute('src', staticUrl);
    }
};

document.body.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('icon')) {
        toggleIconAnimation(e.target);
    }
}, false);

document.body.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('icon')) {
        toggleIconAnimation(e.target);
    }
}, false);


// To load the data

const loadCurrentForecast = ({ name, main: { temp }, weather: [{ description, icon }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".icon").src = `${createIconUrl(icon)}`;
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemprature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
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

    let todayRain = hourlyForecast.slice(2, 3);
    var temp = todayRain[0].rain['3h'];
    console.log("kill the bill: ",temp);
    var rainPer = temp * 20;
    var rainRoundedPer = Math.round(rainPer * 100) / 100;
    var loadRainChanse = document.querySelector(".rainChanse") ;
    rainRoundedPer < 100 ? loadRainChanse.textContent = `Rain - ${rainRoundedPer.toFixed(0)}%`: loadRainChanse.textContent = `Rain - 100%`;
}

// five day forecast

const calculateDayWiseForecast = (hourlyForecast) => {
    let dayWiseForecast = new Map();
    console.log("this is dayWiseForecast : ", hourlyForecast);
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
    let kmPerHour = (speed * 60 * 60 / 1000).toFixed(0);
    container.querySelector(".wind").textContent = `${kmPerHour}Km/h`;
}

const loadData = async () => {
    const currentWeather = await getCurrentWeatherData(selectedCity);
    loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    console.log("it is HW: ", hourlyForecast)
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast)
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    loadWind(currentWeather);
}

loadForecastUsingGeoLocation = () => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        selectedCity = { lat, lon };
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