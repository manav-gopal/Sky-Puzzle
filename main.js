const DAYS_OF_THE_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
//API_KEY from open weather website..
const API_KEY = "2885a2c4947ec0377208bcc84e238d2d";

//get data from the API....
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
        const { main: { temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return { temp, temp_max, temp_min, dt, dt_txt, description, icon }
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

//Loading the hourly forecast

const loadHourlyForecast = ({main:{temp: tempNow},weather:[{icon: iconNow}]}, hourlyForecast) => {
    const timeFormatter = Intl.DateTimeFormat("en",{
        hour12:true, hour:"numeric"
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
    Array.from(dayWiseForecast).map(([day, { temp_max, temp_min, icon }], index)=>{

        if(index < 5){
            dayWiseInfo += `<article class="day-wise-forecast">
                        <h3 class="day">${index === 0? "Today": day}</h3>
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

document.addEventListener("DOMContentLoaded", async () => {
    const currentWeather = await getCurrentWeatherData();
    loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast)
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
})