import { parks } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';
import axios from 'axios';

const fetchParksFromApi = async () => {
  const apiKey = 'znrDgphe2JpIPLHY3NwCXkgEgFTEKUlUisbBJekb'; // Your API key
  const limit = '600';
  const endpoint = 'https://developer.nps.gov/api/v1/parks?';
  const url = `${endpoint}limit=${limit}&api_key=${apiKey}`;


  let rawParksData = null;
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
		rawParksData = data.data;
	});

  let parksData = [];
  for (const park of rawParksData) {
    const parkObj = {
      parkId: park.id,
			url: park.url,
			parkName: park.fullName,
			parkCode: park.parkCode,
			state: park.states,
			description: park.description,
			photos: park.images,
			activities: park.activities,
			address: park.addresses,
			operatingTime: park.operatingHours
    }
		
		parksData.push(parkObj);
	}	
	return parksData;
};

function needUpdate(dbPark, apiPark) {
  let update = (dbPark.url !== apiPark.url ||
                dbPark.parkName !== apiPark.parkName ||
                dbPark.parkCode !== apiPark.parkCode ||
                dbPark.state !== apiPark.state ||
                dbPark.description !== apiPark.description ||
                JSON.stringify(dbPark.photos) !== JSON.stringify(apiPark.photos) ||
                JSON.stringify(dbPark.activities) !== JSON.stringify(apiPark.activities) ||
                JSON.stringify(dbPark.address) !== JSON.stringify(apiPark.address) ||
                JSON.stringify(dbPark.operatingTime) !== JSON.stringify(apiPark.operatingTime));
  return update;
}

const exportedMethods = {
  async create (
		parkId,
		url,
    parkName,
		parkCode,
		state,
    description,
    photos,
    activities,
    address,
    operatingTime
  ) {
    let newPark = {
			parkId: parkId,
			url: url,
      parkName: parkName,
			parkCode: parkCode,
			state: state,
			description: description,
			photos: photos,
			activities: activities,
			address: address,
			operatingTime: operatingTime,
			averageRating: 0,
			reviews: []
    };
  
    if (Object.values(newPark).some(item => item === undefined || item === null))
      throw `Error: There are object missing for creating the park.`;
  
		parkId = validation.checkString(parkId, "Park Id");
		parkName = validation.checkString(parkName, "Park Name");
		state = validation.checkString(state, "State");
		description = validation.checkString(description, "Description");
    
    const parkCollection = await parks();
    const insertInfo = await parkCollection.insertOne(newPark);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Error: Could not add park';

		const newId = insertInfo.insertedId.toString()
    
    const park = await this.getParkById(newId);

    return park;
  },

	async getParkById(id) {
    id = validation.checkId(id);
  
    const parkCollection = await parks();
    const parkInfo = await parkCollection.findOne(
      {_id: new ObjectId(id)}
    );
    
    if (parkInfo === null) throw `Error: no park exists with id: "${id}"`;
  
    return parkInfo;
  },

  async updatePark(id, apiPark) {
    id = validation.checkId(id);

    if (Object.values(apiPark).some(item => item === undefined || item === null))
      throw `Error: There are object missing for creating the park.`;
  
    apiPark.parkId = validation.checkString(apiPark.parkId, "Park Id");
		apiPark.parkName = validation.checkString(apiPark.parkName, "Park Name");
		apiPark.state = validation.checkString(apiPark.state, "State");
		apiPark.description = validation.checkString(apiPark.description, "Description");
    
    console.log(`Updating park: ${apiPark.parkName}`);
    const parkCollection = await parks();
    const updateInfo = await parkCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: apiPark},
      {returnDocument: 'after'}
    );

    if (!updateInfo)
      throw 'Error: Could not update park';

    return updateInfo;
  },

  async deletePark(id) {
    id = validation.checkId(id);

    const parkCollection = await parks();
    const deletionInfo = await parkCollection.findOneAndDelete({ _id: new ObjectId(id) });

    if (deletionInfo === null)
      throw `Error: the park cannot be removed (id: "${id}" does not exist)`;

    return deletionInfo;
  },

  async syncParkData() {
    const apiParks = await fetchParksFromApi();
    const dbParksObj = await parks();
    const dbParks = await dbParksObj.find().toArray();
    
    const dbParksMap = new Map(dbParks.map(park => [park.parkId, park]));

    for (let apiPark of apiParks) {
      const dbPark = dbParksMap.get(apiPark.parkId);
      if (dbPark) {
        if (needUpdate(dbPark, apiPark)) {
          await this.updatePark(dbPark._id.toString(), apiPark);
        }
        dbParksMap.delete(apiPark.parkId);
      } else {
        await this.create(
          apiPark.parkId,
          apiPark.url,
          apiPark.parkName,
          apiPark.parkCode,
          apiPark.state,
          apiPark.description,
          apiPark.photos,
          apiPark.activities,
          apiPark.address,
          apiPark.operatingTime
        );
      }
    }
    for (let [parkId, dbPark] of dbParksMap) {
      console.log(`Deleting ${dbPark.parkName}`);
      const deletionInfo = await this.deletePark(dbPark._id.toString());
      if (deletionInfo === null)
        throw `Error: the park cannot be removed (id: "${dbPark._id.toString()}" does not exist)`;
    }
    console.log(`Delete ${dbParksMap.size} parks from DB that were not in the API data.`);
    console.log("Data: finish sync.");
    return true;
  }
}

export default exportedMethods;