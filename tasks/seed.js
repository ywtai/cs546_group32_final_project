import axios from 'axios';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import parks from '../data/parks.js';
import reviews from '../data/reviews.js';
import comments from '../data/comments.js';
import {registerUser, 
	addToReviews, 
	addToComments,
	addToLiked, 
	addToPassport, 
	addToFavorites
} from '../data/users.js';

const db = await dbConnection();
await db.dropDatabase();

const saveParksFromApi = async () => {
	let apiKey = 'znrDgphe2JpIPLHY3NwCXkgEgFTEKUlUisbBJekb'; //please enter your api key
	let limit = '600';
	let endpoint = 'https://developer.nps.gov/api/v1/parks?';
	let url = endpoint + 'limit=' + limit + '&api_key=' + apiKey;
	let parkIds = [];

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
		parkIds.push([createdPark._id.toString(), createdPark.parkName]);
	}	
	return parkIds;
} 

const findParkIdByName = (parkIds, name) => {
    const park = parkIds.find(p => p[1] === name);
    return park ? park[0] : null;
};

const createUsers = async (parkIds) => {
	const index = [2, 5, 10, 20];

	const adminData = [
		"Admin",
		"admin@aurora.com",
		"01/01/2000",
		"This is the admin account.",
		"Admin123!"
	]

	const user1Data = [
		"Jacky",
		"jacky@gmail.com",
		"10/04/1998",
		"Hi, I'm Jacky",
		"Z697097c!"
	];
	const user2Data = [
		"Johnny",
		"johnny@gmail.com",
		"10/04/1998",
		"Nice to meet you :)",
		"John12345!"
	]
	const user3Data = [
		"Jessica",
		"jessica@gmail.com",
		"10/04/1998",
		"Helloooooooooooo!",
		"Jessica12345!"
	]
	const user4Data = [
		"Morgan",
		"morgan@gmail.com",
		"12/05/1990",
		"Outdoor Lover",
		"Morgan12345!"
	]
	const user5Data = [
		"Annabelle",
		"Annabelle@gmail.com",
		"07/07/1992",
		"Sing sing sing~",
		"Annabelle12345!"
	]
	
	const user1 = await registerUser(...user1Data);
	const user2 = await registerUser(...user2Data);
	const user3 = await registerUser(...user3Data); 
	const user4 = await registerUser(...user4Data);
	const user5 = await registerUser(...user5Data);
	const admin = await registerUser(...adminData);

	const rockyParkId = findParkIdByName(parkIds, "Rocky Mountain National Park");
	const CanyonParkId= findParkIdByName(parkIds, "Canyonlands National Park");
	const RedwoodParkId= findParkIdByName(parkIds, "Redwood National and State Parks");
	const AcadiaParkId= findParkIdByName(parkIds, "Acadia National Park");
	const BostonParkId = findParkIdByName(parkIds, "Boston National Historical Park");
	const CaptainJohnParkId = findParkIdByName(parkIds, "Captain John Smith Chesapeake National Historic Trail");
	
	const user1Review1 = await reviews.createReview(
		rockyParkId,
		user1.userId.toString(),
		"Great Park!",
		user1Data[0],
		"This is a wonderful place to visit.",
		["/uploads/RockyPark1.jpg"],
		4
	);

	const user1Review2 = await reviews.createReview(
		CanyonParkId,
		user1.userId.toString(),
		"Beautiful Park!",
		user1Data[0],
		"Would like to visit there more!",
		["/uploads/CanyonPark1.jpg", "/uploads/CanyonPark2.jpg"],
		5
	);

	const user1Review3 = await reviews.createReview(
		AcadiaParkId,
		user1.userId.toString(),
		"Not Really Recommend",
		user1Data[0],
		"Don't like it, but you can still go if you would like to give it a try.",
		[],
		2
	);

	const user2Review1 = await reviews.createReview(
        CaptainJohnParkId,
        user2.userId.toString(),
        "History Journey",
        user2Data[0],
        "An enlightening trip along the historical waterways. Highly recommended for history enthusiasts!",
        ["/uploads/CaptainJohnPark1.jpg"],
        5
    );

	const user4Review1 = await reviews.createReview(
        CanyonParkId,
        user4.userId.toString(),
        "Spectacular Views!",
        user4Data[0],
        "A must-visit for anyone loving the outdoors.",
        ["/uploads/CanyonPark3.jpg"],
        5
    );

    const user4Review2 = await reviews.createReview(
        RedwoodParkId,
        user4.userId.toString(),
        "Majestic!",
        user4Data[0],
        "The tall trees are breathtaking.",
        ["/uploads/RedwoodPark1.jpg"],
        4
    );

    const user5Review1 = await reviews.createReview(
        AcadiaParkId,
        user5.userId.toString(),
        "Lovely and relaxing",
        user5Data[0],
        "Great spot for a weekend getaway.",
        [],
        4
    );

    const user5Review2 = await reviews.createReview(
        BostonParkId,
        user5.userId.toString(),
        "Rich in history",
        user5Data[0],
        "Educational and enjoyable experience walking the freedom trail.",
        ["/uploads/BostonPark1.jpg"],
        4
    );

	await addToReviews(
		user1.userId.toString(),
		{
			reviewId: user1Review1.reviewId,
			parkId: rockyParkId
		}
	);

	await addToReviews(
		user1.userId.toString(),
		{
			reviewId: user1Review2.reviewId,
			parkId: CanyonParkId
		}
	);

	await addToReviews(
		user1.userId.toString(),
		{
			reviewId: user1Review3.reviewId,
			parkId: AcadiaParkId
		}
	);

	await addToReviews(
        user2.userId.toString(),
        {
            reviewId: user2Review1.reviewId,
            parkId: CaptainJohnParkId
        }
    );

	await addToReviews(
		user4.userId.toString(),
		{
			reviewId: user4Review1.reviewId,
			parkId: CanyonParkId
		}
	);

    await addToReviews(
		user4.userId.toString(),
		{
			reviewId: user4Review2.reviewId,
			parkId: RedwoodParkId
		}
	);

    await addToReviews(
		user5.userId.toString(),
		{
			reviewId: user5Review1.reviewId,
			parkId: AcadiaParkId
		}
	);

    await addToReviews(
		user5.userId.toString(),
		{
			reviewId: user5Review2.reviewId,
			parkId: BostonParkId
		}
	);

	const commentsData = [
        {
            reviewId: user1Review1.reviewId,
            userId: user3.userId.toString(),
            userName: user3Data[0],
            content: "I’ve always wanted to visit. Thanks for the great review!",
        },
        {
            reviewId: user2Review1.reviewId,
            userId: user4.userId.toString(),
            userName: user4Data[0],
            content: "History at its best! I need to check this out soon.",
        },
		{
			reviewId: user1Review2.reviewId,
			userId: user3.userId.toString(),
			userName: user3Data[0],
			content: "This place is overrated. I didn't find it as exciting as others say."
		},
		{
			reviewId: user1Review1.reviewId,
			userId: user5.userId.toString(),
			userName: user5Data[0],
			content: "I had an unforgettable time here. Can't wait to come back!"
		},
		{
			reviewId: user2Review1.reviewId,
			userId: user4.userId.toString(),
			userName: user4Data[0],
			content: "Couldn’t agree more. It’s a historical gem!"
		},
        {
            reviewId: user4Review1.reviewId,
            userId: user5.userId.toString(),
            userName: user5Data[0],
            content: "The views in your photos are stunning!",
        },
        {
            reviewId: user5Review1.reviewId,
            userId: user1.userId.toString(),
            userName: user1Data[0],
            content: "Your review makes me want to visit Acadia next spring!",
        },
        {
            reviewId: user4Review2.reviewId,
            userId: user2.userId.toString(),
            userName: user2Data[0],
            content: "Redwoods are on my bucket list. Glad to hear you enjoyed it!",
        }
    ];

    for (const { reviewId, userId, userName, content } of commentsData) {
		const comment = await comments.createComment(reviewId, userId, userName, content);
		await addToComments(userId, {
			commentId: comment.commentId.toString(),
			content: content
		});    
    }

}

const parkIds = await saveParksFromApi();
await createUsers(parkIds);
console.log('Done seeding database');

await closeConnection();
