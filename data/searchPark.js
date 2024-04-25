import axios from "axios";
import validation from '../validation.js';
import { parks } from "../config/mongoCollections.js";


export const searchByState = async (stateCode, pageSize, offset) => {
    try {
        const parkCollection = await parks();
        const query = { state: { $regex: new RegExp(`\\b${stateCode}\\b`, 'i') }};
        
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
    // try {
    //     const {data} = await axios.get(`${apiUrl}/parks?stateCode=${stateCode}&apikey=${apikey}`);
    
    //     return data.data;
    // } catch (e) {
    //     console.error(e);
    //     throw new Error('An error occurred while searching parks.');
    // }
}

export const searchByName = async (name, pageSize, offset) => {
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

    // const query = 'q=' + name.trim().toLowerCase();

    // try {
    //     const {data} = await axios.get(`${apiUrl}/parks?${query}&apikey=${apikey}`);
    //     return data.data;
    // } catch(e) {
    //     console.error(e);
    //     throw new Error('An error occurred while searching parks.');
    // }
}

// export const searchByCode = async (code) => {
//     const query = 'parkCode=' + code.toLowerCase();

//     try {
//         const {data} = await axios.get(`${apiUrl}/parks?${query}&apikey=${apikey}`);
//         return data.data;
//     } catch(e) {
//         console.error(e);
//         throw new Error('An error occurred while searching parks.');
//     }
// }

export const searchByActivity = async (activityIds, pageSize, offset) => {
    try {
        const parkCollection = await parks();
        activityIds = activityIds.split(',');

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
    // let queries = '';
    
    // if (Array.isArray(activityList)) {
    //     queries = 'q=' + activityList.join(',');
    // } else {
    //     queries = 'q=' + activityList;
    // }

    // try {
    //     const url = `${apiUrl}/parks?${queries}&apikey=${apikey}`;

    //     const response = await axios.get(url);
    //     const data = response.data.data;
        
    //     return data;
    // } catch (e) {
    //     console.error(e);
    //     throw new Error('An error occurred while searching parks.');
    // }
}

export const searchTop5 = async () => {
    try {
        const parkCollection = await parks();
        const parkList = await parkCollection.aggregate([{$sort: {averageRating: 1}},
                                                        {$limit: 5}]).toArray();
        return parkList;
    } catch (e) {
        console.error('Error searching for parks by activities:', e);
        throw e;
    }
}
// console.log(await searchByActivity(['camping', 'biking', 'hiking']));
// console.log(await searchByName('joshua'));
// console.log(await searchByCode('cuis'));
// console.log(await searchTop5());