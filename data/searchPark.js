import axios from "axios";
import validation from '../validation.js';
import { parks } from "../config/mongoCollections.js";

// const apikey = '&api_key=mmtm7icVWdJiWqXvlmWM9iFtZgKItcJrK6RySfgg';
// const apiUrl = 'https://developer.nps.gov/api/v1';

export const searchByState = async (stateCode) => {
    try {
        const parkCollection = await parks();
        const query = { state: { $regex: new RegExp(`\\b${stateCode}\\b`, 'i') }};
        const parkList = await parkCollection.find(query).toArray();
        return parkList;
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

export const searchByName = async (name) => {
    try {
        name = validation.checkString(name);
        const parkCollection = await parks();
        const query = { parkName: { $regex: new RegExp(name, 'i') } };
        const parkList = await parkCollection.find(query).toArray();
        return parkList;
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

export const searchByCode = async (code) => {
    const query = 'parkCode=' + code.toLowerCase();

    try {
        const {data} = await axios.get(`${apiUrl}/parks?${query}&apikey=${apikey}`);
        return data.data;
    } catch(e) {
        console.error(e);
        throw new Error('An error occurred while searching parks.');
    }
}

export const searchByActivity = async (activityNames) => {
    try {
        const parkCollection = await parks();
        if (!Array.isArray(activityNames)) {
            activityNames = [activityNames];
        }

        const query = { "activities.name": { $in: activityNames.map(name => new RegExp(`^${name}$`, 'i')) } };
        const parkList = await parkCollection.find(query).toArray();
        return parkList;
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

// console.log(await searchByActivity(['camping', 'biking', 'hiking']));
// console.log(await searchByName('joshua'));
// console.log(await searchByCode('cuis'));