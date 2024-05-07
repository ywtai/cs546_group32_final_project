//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import { ObjectId } from 'mongodb';
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const exportedMethods = {
    checkId(id) {
      if (!id) throw 'Error: You must provide an id to search for';
      if (typeof id !== 'string') throw 'Error: id must be a string';
      id = id.trim();
      if (id.length === 0)
        throw 'Error: id cannot be an empty string or just spaces';
      if (!ObjectId.isValid(id)) throw `Error: invalid object ID`;
      return id;
    },
  
    checkString(strVal, varName, conditions) {
      if (!strVal) throw `Error: You must supply a ${varName}!`;
      if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
      strVal = strVal.trim();
      if (strVal.length === 0)
        throw `Error: ${varName} cannot be an empty string or string with just spaces`;

      if (conditions) {
        let key = Object.keys(conditions);
        let value = Object.values(conditions);
        key.map((item, index) => {
          if (item === 'max') {
            if (strVal.length > value[index]) {
              throw `Error: ${varName} must be less than ${value[index]} characters`;
            }
          }
          if (item === 'min') {
            if (strVal.length < value[index]) {
              throw `Error: ${varName} must be more than ${value[index]} characters`;
            }
          }
        });
      }
      
      return strVal;
    },

    checkRating(ratingString) {
      let rating = Number(ratingString);
      if (isNaN(rating)) throw `Error: rating is not a number`;
      if (rating < 1 || rating > 5) throw `Error: rating should be between 1 to 5`;
      if (rating % 1 !== 0) {
        throw `Error: rating should be integer`;
      }
      
      return rating;
    },
    
    checkArray(array, key) {
      if (!Array.isArray(array)) throw `Error: ${key} is not array`;
    
      if (array.length === 0) throw `Error: ${key} array is empty`;

      return array;
    },

    getFormatedDate(date) {
      let year = date.getFullYear();
      let month = (1 + date.getMonth()).toString().padStart(2, '0');
      let day = date.getDate().toString().padStart(2, '0');

      let newDate = month + '/' + day + '/' + year;

      return newDate
    },

    calculateAverageRating(reviews) {
      if (reviews.length === 0) return 0;
      const totalRating = reviews.reduce((acc, cur) => acc + cur.rating, 0);
      let averageRating = totalRating / reviews.length;
      return averageRating;
    },

    checkPhotosPath(photos) {
      if (!Array.isArray(photos)) {
        throw 'Error: photos must be an array';
      }

      photos.forEach(photo => {
        let lowerCasePhoto = photo.toLowerCase();
        if (typeof lowerCasePhoto !== 'string' || !/^\/uploads\/[\w-]+\.(jpg|jpeg|png)$/.test(lowerCasePhoto)) {
          throw 'Error: Invalid photo path or format. Must be a valid path with jpg, jpeg, or png extension';
        }
      });

      return photos;
    },

    checkPhotoExist(photos) {
      if (photos) {
        for (let i = 0; i < photos.length; i++) {
          const fullPath = path.join(__dirname, 'public', photos[i]);

          fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
              console.error('File does not exist:', fullPath);
              console.error(err);
            } else {
              fs.chmod(fullPath, 0o644, (err) => {
                if (err) {
                  console.error('Error setting permissions:', err);
                }
              });
            }
          });

          if (!fs.existsSync(fullPath)) {
            console.log("No Image!");
            photos[i] = '/icon/no-image.png';
          }
        }
      }
      
      return photos;
    }
  };
  
  export default exportedMethods;