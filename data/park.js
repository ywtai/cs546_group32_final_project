import axios from "axios";

const apikey = '&api_key=mmtm7icVWdJiWqXvlmWM9iFtZgKItcJrK6RySfgg';
const apiUrl = 'https://developer.nps.gov/api/v1';

export const searchByState = async (stateName) => {
    const stateCodes = {
        alabama: "AL",
        alaska: "AK",
        arizona: "AZ",
        arkansas: "AR",
        california: "CA",
        colorado: "CO",
        connecticut: "CT",
        delaware: "DE",
        "district of columbia": "DC",
        florida: "FL",
        georgia: "GA",
        hawaii: "HI",
        idaho: "ID",
        illinois: "IL",
        indiana: "IN",
        iowa: "IA",
        kansas: "KS",
        kentucky: "KY",
        louisiana: "LA",
        maine: "ME",
        maryland: "MD",
        massachusetts: "MA",
        michigan: "MI",
        minnesota: "MN",
        mississippi: "MS",
        missouri: "MO",
        montana: "MT",
        nebraska: "NE",
        nevada: "NV",
        "new hampshire": "NH",
        "new jersey": "NJ",
        "new mexico": "NM",
        "new york": "NY",
        "north carolina": "NC",
        "north dakota": "ND",
        ohio: "OH",
        oklahoma: "OK",
        oregon: "OR",
        pennsylvania: "PA",
        "puerto rico": "PR",
        "rhode island": "RI",
        "south carolina": "SC",
        "south dakota": "SD",
        tennessee: "TN",
        texas: "TX",
        utah: "UT",
        vermont: "VT",
        virginia: "VA",
        "virgin islands": "VI",
        washington: "WA",
        "west virginia": "WV",
        wisconsin: "WI",
        wyoming: "WY"
    };
    
    const stateCode = stateCodes[stateName.toLowerCase()];
    if (stateCode === undefined) {
        throw new Error('Please Enter Valid State Name!');
    }

    try {
        const {data} = await axios.get(`${apiUrl}/parks?stateCode=${stateCode}&apikey=${apikey}`);
    
        return data.data;
    } catch (e) {
        console.error(e);
        throw new Error('An error occurred while searching parks.');
    }
}

export const searchByName = async (name) => {
    const query = 'q=' + name.trim().toLowerCase();

    try {
        const {data} = await axios.get(`${apiUrl}/parks?${query}&apikey=${apikey}`);
        return data.data;
    } catch(e) {
        console.error(e);
        throw new Error('An error occurred while searching parks.');
    }
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

export const searchByActivity = async (activityList) => {
    let queries = '';
    
    if (Array.isArray(activityList)) {
        queries = 'q=' + activityList.join(',');
    } else {
        queries = 'q=' + activityList;
    }

    try {
        const url = `${apiUrl}/parks?${queries}&apikey=${apikey}`;

        const response = await axios.get(url);
        const data = response.data.data;
        
        return data;
    } catch (e) {
        console.error(e);
        throw new Error('An error occurred while searching parks.');
    }
}

// console.log(await searchByActivity(['camping', 'biking', 'hiking']));
// console.log(await searchByName('joshua'));
// console.log(await searchByCode('cuis'));