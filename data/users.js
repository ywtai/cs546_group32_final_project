import helpers from '../helpers.js';
import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';

export const registerUser = async (
  userName,
  email,
  dateOfBirth,
  bio,
  password,
) => {

  helpers.checkIfValid(userName, email, dateOfBirth, bio, password)
  userName = helpers.checkuserName(userName);
  email = helpers.checkEmail(email);
  dateOfBirth = helpers.checkDateOfBirth(dateOfBirth);
  bio = helpers.checkbio(bio);
  password = helpers.checkPassword(password);

  const userCollection = await users(); 
  const checkEmailExisted = await userCollection.findOne({ email: email });
  if (checkEmailExisted) throw 'Error: A user with this email already exists!';
  const checkUserExisted = await userCollection.findOne({ userName: userName });
  if (checkUserExisted) throw 'Error: A user with this userName already exists!';

  const newUser = {
    userName,
    email,
    dateOfBirth,
    bio,
    password: await bcrypt.hash(password, 10), 
    personalParkPassport: [],
    favorite: [],
    reviews: [],
    comments: []
  };

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw 'Could not add this user';

  return { insertedUser: true, userId: insertInfo.insertedId };
};


export const loginUser = async (usernameOrEmail, password) => {

  usernameOrEmail = helpers.checkuserNameorEmail(usernameOrEmail);
  password = helpers.checkPassword(password);
  

  usernameOrEmail = usernameOrEmail.trim().toLowerCase();
  password = password.trim();

 
  const userCollection = await users();


  const userInfo = await userCollection.findOne({
    $or: [
      { userName: usernameOrEmail },
      { email: usernameOrEmail }
    ]
  });

  if (!userInfo) throw 'The username or email did not exist!';

  const comparePassword = await bcrypt.compare(password, userInfo.password);
  if (!comparePassword) throw 'The password is incorrect!';

  return {
    userName: userInfo.userName,
    email: userInfo.email,
    dateOfBirth: userInfo.dateOfBirth,
    bio: userInfo.bio,
    personalParkPassport: userInfo.personalParkPassport,
    favorite: userInfo.favorite,
    reviews: userInfo.reviews,
    comments: userInfo.comments
  };
};

