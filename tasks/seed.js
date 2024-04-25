import axios from 'axios';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import parks from '../data/parks.js';

const db = await dbConnection();
await db.dropDatabase();

const saveParksFromApi = async () => {
	let apiKey = 'mmtm7icVWdJiWqXvlmWM9iFtZgKItcJrK6RySfgg'; //please enter your api key
	let limit = '600';
	let endpoint = 'https://developer.nps.gov/api/v1/parks?';
	let url = endpoint + 'limit=' + limit + '&api_key=' + apiKey;

	console.log(url);

	let allParksData = null;
	const getAllParks = await axios.get(url).then(async ({ data }) => {
		if (data.Response === 'False') {
			const error = data.Error;
			if (error === 'Parks not found!') {
				throw [404, `We're sorry, but no results were found.`];
			}
			if (error === 'Too many results.') {
				throw [404, `Error: Response false.`];
			}
			else {
				throw [404, `Error: Response false.`]
			}
		}
		console.log(data.total);
		allParksData = data.data;
	});

	for (const park of allParksData) {
		const createdPark = await parks.create(
			park.id,
			park.url,
			park.fullName,
			park.parkCode,
			park.states,
			park.description,
			park.images,
			park.activities,
			park.addresses,
			park.operatingHours
		);
		// console.log(createdPark);
	}	
	return;
}

await saveParksFromApi();
console.log('Done seeding database');

await closeConnection();
