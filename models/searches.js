const fs = require('fs');
const axios = require('axios');

class Searches {
	history = [];
	dbPath = './db/database.json';

	constructor() {
		this.readDB();
	}

	get capitalizedHistory() {
		return this.history.map((place) => {
			let words = place.split(' ');
			words = words.map((p) => p[0].toUpperCase() + p.substring(1));

			return words.join(' ');
		});
	}

	async city(cityName = '') {
		try {
			const baseParams = {
				access_token: process.env.MAPBOX_KEY,
				proximity: '-3.6915631279774175%2C40.43031665158193',
				language: 'en',
			};

			const baseURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${cityName}.json`;
			const url = `${baseURL}?proximity=${baseParams.proximity}&language=${baseParams.language}&access_token=${baseParams.access_token}`;

			const config = {
				method: 'get',
				url,
				headers: {},
			};

			const { data } = await axios(config);

			return data.features.map((place) => ({
				id: place.id,
				name: place.place_name,
				lng: place.center[0],
				lat: place.center[1],
			}));
		} catch (error) {
			console.log(error);
		}
	}

	async getWeatherData(lat, lon) {
		try {
			const baseParams = {
				appid: process.env.OPENWEATHER_KEY,
				units: 'metric',
			};

			const baseURL = `https://api.openweathermap.org/data/2.5/weather`;
			const url = `${baseURL}?lat=${lat}&lon=${lon}&appid=${baseParams.appid}&units=${baseParams.units}`;

			const config = {
				method: 'get',
				url,
				headers: {},
			};

			const { data } = await axios(config);
			const { weather, main } = data;

			return {
				description: weather[0].description,
				min: main.temp_min,
				max: main.temp_max,
				temp: main.temp,
			};
		} catch (error) {
			console.log(error);
		}
	}

	saveHistory(place = '') {
		if (this.history.includes(place.toLocaleLowerCase())) {
			return;
		}

		this.history = this.history.splice(0, 5);
		this.history.unshift(place.toLocaleLowerCase());
		this.saveDB();
	}

	saveDB() {
		const payload = {
			history: this.history,
		};

		fs.writeFileSync(this.dbPath, JSON.stringify(payload));
	}

	readDB() {
		if (!fs.existsSync(this.dbPath)) return;

		const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
		const { history } = JSON.parse(info);

		this.history = history;
	}
}

module.exports = Searches;
