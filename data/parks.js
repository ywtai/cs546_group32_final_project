import { parks } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

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
		// photos = validation.checkArray(photos, "Photos");
		// activities = validation.checkArray(activities, "Activities");
		// address = validation.checkArray(address, "Address");
    
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

}


export default exportedMethods;