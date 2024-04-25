//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
const exportedMethods = {
    checkIfValid(...parVal) {
        for (let val of parVal) {
          if (!val || val === undefined || val === null) throw `You must supply a valid input`;
        }
      },
    checkuserName(username) {
        
        if (typeof username !== 'string' || username.trim().length === 0) {
            throw new Error('Username must be a non-empty string.');
          }
        
          username = username.trim();
        
          if (username.length < 5 || username.length > 10) {
            throw new Error('Username must be between 5 and 10 characters long.');
          }
        
          if (/^\d+$/.test(username)) {
            throw new Error('Username cannot contain only numbers.');
          }
        
          if (!/^[a-zA-Z0-9]+$/.test(username)) {
            throw new Error('Username must contain only alphanumeric characters and cannot be only numbers.');
          }
        
          return username.toLowerCase();

      },

      checkEmail(email) {
        const emailRegex =
          /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
    
        if (email.length > 253) {
          throw `Error: emailaddress is too long! `;
        }
    
        if (!emailRegex.test(email)) {
          throw `Error: emailaddress format is invalid! `
        }
    
        for (let i = 0; i < email.length; i++) {
          if (email[i] === "." || email[i] === "-") {
            if (
              i === 0 ||
              i === email.length - 1 ||
              (email[i] === email[i - 1] && email[i] === email[i + 1])
            ) {
              throw `Error: emailaddress format is invalid!`;
            }
          }
        }
    
        email = email.toLowerCase();
        return email;
      },

    checkPassword(password){
        password = password.trim()
        if(typeof password !== "string") throw `Error: Password must be string! `;
        
        if (password.length < 8)
          throw `Error: Password at least 8 characters!`;

        if(/\s/.test(password)) throw `Error: Password cannnot contain space!`;

        if (!/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password))
            throw ` Error: Password needs to be at least one uppercase character, there has to be at least one number and there has to be at
            least one special character !`;
        return password
    },
    checkbio(bio){
        if (typeof bio !== 'string' || bio.trim().length === 0) {
            throw 'Bio must be a non-empty string.';
          }
        bio = bio.trim();

        if (bio.length > 250) {
            throw new Error('Bio must be between 1 and 250 characters long.');
          }
        return bio
    },

    checkDateOfBirth(dobString) {
        // Check if the date format is correct (MM/DD/YYYY)
        if (typeof dobString !== 'string' || dobString.trim().length === 0) {
            throw 'Date of Birth must be a non-empty string.';
          }
        dobString = dobString.trim()
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dobString)) {
            throw new Error('Date of birth must be in the format MM/DD/YYYY.');
        }
    
        // Parse the date parts from the input string
        const parts = dobString.split('/');
        const month = parseInt(parts[0], 10) - 1; 
        const day = parseInt(parts[1],10);
        const year = parseInt(parts[2], 10);
    
        // Create a date object from the parts
        const dob = new Date(year, month, day);
    
        // Check the validity of the date
        if (dob.getFullYear() !== year || dob.getMonth() !== month || dob.getDate() !== day) {
            throw new Error('Invalid date of birth.');
        }
    
        // Calculate the age to check if the user is at least 13 years old
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
    
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
    
        if (age < 13) {
            throw new Error('User must be at least 13 years old.');
        }
    
        return dobString;
    },

    checkuserNameorEmail(usernameOrEmail){
        if (usernameOrEmail.includes('@')){
            const emailRegex =
            /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;      
          if (usernameOrEmail.length > 253) {
            throw `Error: emailaddress is too long! `;
          }      
          if (!emailRegex.test(usernameOrEmail)) {
            throw `Error: emailaddress format is invalid! `
          }      
          for (let i = 0; i < usernameOrEmail.length; i++) {
            if (usernameOrEmail[i] === "." || usernameOrEmail[i] === "-") {
              if (
                i === 0 ||
                i === usernameOrEmail.length - 1 ||
                (usernameOrEmail[i] === usernameOrEmail[i - 1] && usernameOrEmail[i] === usernameOrEmail[i + 1])
              ) {
                throw `Error: emailaddress format is invalid!`;
              }
            }
          }      
          usernameOrEmail = usernameOrEmail.toLowerCase();
          return usernameOrEmail;

        }
        else{
            if (typeof usernameOrEmail !== 'string' || usernameOrEmail.trim().length === 0) {
                throw new Error('Username must be a non-empty string.');
              }
            
              usernameOrEmail = usernameOrEmail.trim();
            
              if (usernameOrEmail.length < 5 || usernameOrEmail.length > 10) {
                throw new Error('Username must be between 5 and 10 characters long.');
              }
            
              if (/^\d+$/.test(usernameOrEmail)) {
                throw new Error('Username cannot contain only numbers.');
              }
            
              if (!/^[a-zA-Z0-9]+$/.test(usernameOrEmail)) {
                throw new Error('Username must contain only alphanumeric characters and cannot be only numbers.');
              }
            
              return usernameOrEmail;
    
          

        }
    }

};
  
export default exportedMethods;
