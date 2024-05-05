import validation from '../validation.js';
import { parks } from "../config/mongoCollections.js";

const exportedMethods = {
async searchByState(stateCode, pageSize, offset) {
    try {
        const parkCollection = await parks();
        const query = { state: { $regex: new RegExp(`\\b${stateCode}\\b`, 'i') } };

        const totalParks = await parkCollection.countDocuments(query);
        const parkList = await parkCollection.find(query)
            .skip(offset)
            .limit(pageSize)
            .toArray();
        return [parkList, totalParks];
    } catch (e) {
        console.error('Error searching for parks by state code:', e);
        throw e;
    }
},

async searchByName(name, pageSize, offset) {
    try {
        name = validation.checkString(name);
        const parkCollection = await parks();
        const query = { parkName: { $regex: new RegExp(name, 'i') } };
        const totalParks = await parkCollection.countDocuments(query);
        const parkList = await parkCollection.find(query)
            .skip(offset)
            .limit(pageSize)
            .toArray();
        return [parkList, totalParks];
    } catch (e) {
        console.error('Error searching for parks:', e);
        throw e;
    }
},

async searchByActivity(activityIds, pageSize, offset) {
    try {
        const parkCollection = await parks();

        if (!Array.isArray(activityIds)) {
            activityIds = [activityIds];
        }

        const query = { "activities.id": { $in: activityIds } };

        const totalParks = await parkCollection.countDocuments(query);
        const parkList = await parkCollection.find(query)
                                            .skip(offset)
                                            .limit(pageSize)
                                            .toArray();
        return [parkList, totalParks];
    } catch (e) {
        console.error('Error searching for parks by activities:', e);
        throw e;
    }
},

async searchTop5() {
    try {
        const parkCollection = await parks();
        const parkList = await parkCollection.aggregate([{ $sort: { averageRating: -1, parkName: 1} },
                                                        { $limit: 5 }]).toArray();
        return parkList;
    } catch (e) {
        console.error('Error searching for parks by activities:', e);
        throw e;
    }
}
}

export default exportedMethods;