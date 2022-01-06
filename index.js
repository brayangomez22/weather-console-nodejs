require('dotenv').config();

const { readInput, inquirerMenu, pause, listPlaces } = require('./helpers/inquirer');
const Searches = require('./models/searches');

const main = async () => {
	const searches = new Searches();
	let opt;

	do {
		opt = await inquirerMenu();

		switch (opt) {
			case 1:
				// SHOW MESSAGE
				const cityName = await readInput('Enter the name of the city:');

				// SEARCH THE PLACES
				const places = await searches.city(cityName);

				// SELECT THE PLACE
				const id = await listPlaces(places);

				if (id === 0) continue;

				const selectedPlace = places.find((place) => place.id === id);
				const { name, lat, lng } = selectedPlace;

				// SAVE DB
				searches.saveHistory(name);

				// WEATHER
				const weather = await searches.getWeatherData(lat, lng);
				const { description, min, max, temp } = weather;

				//SHOW RESULTS
				console.clear();
				console.log('\nCity information\n'.green);
				console.log('City:', name.green);
				console.log('Lat:', lat);
				console.log('Lng:', lng);
				console.log('Temperature: ', temp);
				console.log('Minimum: ', min);
				console.log('Maximum: ', max);
				console.log("what's the weather like: ", description.green);
				break;
			case 2:
				searches.capitalizedHistory.forEach((place, i) => {
					const idx = `${i + 1}`.green;
					console.log(`${idx} ${place}`);
				});
				break;
		}

		if (opt !== 0) await pause();
	} while (opt !== 0);
};

main();
