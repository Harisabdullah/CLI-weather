const axios = require('axios');
const readlineSync = require('readline-sync');
const colors = require('colors');
const fs = require('fs');

const cli = require('./suggestionCLI');

const api = '597abb7d2ced7b969059775d88e1801e';

const saveCities = (cities) => {
  fs.writeFileSync('cities.json', JSON.stringify(cities));
}

const getCity = async () => {
  let city = await cli('Please enter a city name: ');
  while (!city) {
    console.log('Please enter a city name: '.yellow);
    city = await cli('Enter a city name: ');
  }
}


const processNewCity = async () => {
  let city = await getCity();
  const weather = await getWeather(city);
  displayWeather(weather);
  return city.toLowerCase();
}

const getCitiesFromFile = () => {
  let cities = [];
  try {
    cities = JSON.parse(fs.readFileSync('cities.json', 'utf8'));
  } catch (error) {
    fs.writeFileSync('cities.json', JSON.stringify([]));
  }
  return cities;
}

const getWeather = async (city) => {
  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}&units=metric`);
    return response.data;
  } catch (error) {
    console.log(error.response.data.message.red);
    process.exit(1);
  }
}


const displayWeather = (weather) => {
  console.log(`\nWeather in ${weather.name}!`.green);
  console.log(`Temperature: ${weather.main.temp > 28 ? weather.main.temp.toString().red : weather.main.temp.toString().blue}°C`);
  console.log(`Feels like: ${weather.main.feels_like > 28 ? weather.main.feels_like.toString().red : weather.main.feels_like.toString().blue}°C`);
  console.log(`Humidity: ${weather.main.humidity}%`);
  console.log(`Wind: ${weather.wind.speed} km/h\n`);
};



const processSavedCities = async (cities) => {
  if (cities.length) {
    for (city of cities) {
      // 2) Fetch weather
      const weather = await getWeather(city);
      // 2) Display weather
      displayWeather(weather);
    }
  }
}

const getChoice = () => {
  return readlineSync.keyIn('========== Cities Manager ==========\n' +
      `1) Press a to Add new City\n` +
      `2) Press d to Delete City\n` +
      `3) Press w to see weather of saved cities\n` +
      `4) Press q to exit the app\n` +
      `> `.blue, {hideEchoBack: true});
}


const main = async () => {
  console.log('Welcome to the Weather App!'.green);

  let choice = getChoice();
  while(choice !== 'q') {

    const cities = getCitiesFromFile();

    if (!cities.length) {
      console.log('No cities found. Please enter a city name:'.yellow);
      const newCity = await processNewCity();
      cities.push(newCity);
      saveCities(cities);
    }

    switch (choice) {
      case 'a':
        const newCity = await processNewCity();
        if (!cities.includes(newCity)) {
          cities.push(newCity);
          saveCities(cities);
        }
        break;
      case 'd':
        let cityToBeDeleted = readlineSync.question('Enter name of city: ').toLowerCase();
        while (!cities.includes(cityToBeDeleted)) {
          console.log('City not found. Try again.'.red);
          cityToBeDeleted = readlineSync.question('Enter name of city: ').toLowerCase();
        }
        const updatedCities = cities.filter(city => city !== cityToBeDeleted);
        saveCities(updatedCities);
        console.log('City deleted successfully!'.green);
        break;
      case 'w':
        await processSavedCities(cities);
        break;
      default:
        console.log('Invalid choice!'.red);
    }
    choice = getChoice();
    if(choice === 'q') {
      console.log('Goodbye!'.green);
    }
  }
}

(async ()=> await main())();








