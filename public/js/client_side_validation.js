let registerForm = document.getElementById('registration-form');
let errorDiv = document.getElementById('error')
let userName = document.getElementById('userName')
let email = document.getElementById('email')
let password = document.getElementById('password')
let loginpassword = document.getElementById('loginpassword')
let confirmPassword = document.getElementById('confirmPassword')
let dateOfBirth = document.getElementById('dateOfBirth')
let usernameOrEmail = document.getElementById('usernameOrEmail')
let bio = document.getElementById('bio')
if (registerForm) {

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    errorDiv.hidden = true
    try {
      console.log(helpers.checkIfValid(
        userName.value,
        email.value,
        password.value,
        confirmPassword.value,
        dateOfBirth.value,
        bio.value
      ))
      let validuserName = helpers.checkuserName(userName.value);
      let validemail = helpers.checkEmail(email.value);
      let validpassword = helpers.checkPassword(password.value);
      let validconfirmPassword = helpers.checkPassword(confirmPassword.value)
      let validdateOfBirth = helpers.checkDateOfBirth(dateOfBirth.value)
      let validbio = helpers.checkbio(bio.value);
      if (validpassword != validconfirmPassword) throw 'Password does not match!'
      errorDiv.hidden = true;
      registerForm.submit();
    } catch (e) {
      errorDiv.hidden = false;
      errorDiv.innerHTML = e;
    }
  })
}

var loginForm = document.getElementById('login-form')
console.log(loginForm)

if (loginForm) {

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      helpers.checkIfValid(
        usernameOrEmail.value,
        loginpassword.value,
      )
      let validusernameOrEmail = helpers.checkuserNameorEmail(usernameOrEmail.value);
      let validloginpassword = helpers.checkPassword(loginpassword.value);
      errorDiv.hidden = true;
      loginForm.submit();
    } catch (e) {
      errorDiv.hidden = false;
      errorDiv.innerHTML = e;
    }
  })
}




const helpers = {
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

  checkPassword(password) {
    password = password.trim()
    if (typeof password !== "string") throw `Error: Password must be string! `;

    if (password.length < 8)
      throw `Error: Password at least 8 characters!`;

    if (/\s/.test(password)) throw `Error: Password cannnot contain space!`;

    if (!/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password))
      throw ` Error: Password needs to be at least one uppercase character, there has to be at least one number and there has to be at
              least one special character !`;
    return password
  },
  checkbio(bio) {
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

    if (typeof dobString !== 'string' || dobString.trim().length === 0) {
      throw 'Date of Birth must be a non-empty string.';
    }
    dobString = dobString.trim()
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dobString)) {
      throw new Error('Date of birth must be in the format MM/DD/YYYY.');
    }


    const parts = dobString.split('/');
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);


    const dob = new Date(year, month, day);


    if (dob.getFullYear() !== year || dob.getMonth() !== month || dob.getDate() !== day) {
      throw new Error('Invalid date of birth.');
    }


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

  checkuserNameorEmail(usernameOrEmail) {
    if (usernameOrEmail.includes('@')) {
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
    else {
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

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchForm');

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const searchQuery = document.getElementById('searchQuery').value.trim();
      const searchType = document.getElementById('searchType').value.trim();

      if (!searchQuery) {
        alert(`Please provide a ${searchType} to search.`);
      } else {
        searchForm.submit();
      }
    });
  }
})


var loginForm = document.getElementById('login-form')
console.log(loginForm)

if (loginForm) {

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      helpers.checkIfValid(
        usernameOrEmail.value,
        loginpassword.value,
      )
      usernameOrEmail = helpers.checkuserNameorEmail(usernameOrEmail.value);
      loginpassword = helpers.checkPassword(loginpassword.value);
      errorDiv.hidden = true;
      loginForm.submit();
    } catch (e) {
      errorDiv.hidden = false;
      errorDiv.innerHTML = e;
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('addReviewForm');
  form.addEventListener('submit', function(event) {
      event.preventDefault();
      let title = document.getElementById('title').value.trim().toLowerCase();
      let content = document.getElementById('content').value.trim().toLowerCase();
      let photos = document.getElementById('photos').value.trim().toLowerCase();
      let rating = document.getElementById('rating').value.trim().toLowerCase();
      let errorMessageDiv = document.getElementById('review_error_message');
      let error = []
      if(!title || title === '') {
          error.push('Please input a title')
      }
      if (!content || content === '') {
          error.push('Please input review content')
      }
      // if(!photos || photos === '') {
      //     error.push('Please select one photo')
      // }
      if(!rating) {
          error.push('Please give a rating')
      }
      if (error.length !== 0) {
          let errorMessage = ''
          for (const errorElement of error) {
              errorMessage += errorElement+"\n";
          }
          errorMessageDiv.textContent = errorMessage;
          errorMessageDiv.style.display = 'block';

      } else {
          errorMessageDiv.style.display = 'none';
          form.submit()
      }
  });
});

//add review
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded event triggered");
  const reviewForm = document.getElementById('addReviewForm');
  const submitButton = document.getElementById('reviewSubmit');

  
  submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    if (this.disabled) return;

    this.disabled = true;

    const formData = new FormData(reviewForm);
    fetch(reviewForm.action, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting the review.');
      this.disabled = false;
    });
  });
  
});

//edit or delete review
document.addEventListener('DOMContentLoaded', function () {
  const editFormButton = document.getElementById('editForm');
  const editForm = document.getElementById('editReviewForm');
  if (editFormButton && editForm) {
    editFormButton.addEventListener('click', function () {
      editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  const editSubmitButton = document.getElementById('editReviewSubmit');
  editSubmitButton.addEventListener('click', function(event) {
    event.preventDefault();
    if (this.disabled) return;

    this.disabled = true;

    const formData = {
      title: document.getElementById('edit-title').value,
      rating: document.getElementById('edit-rating').value,
      content: document.getElementById('edit-content').value
    };
    fetch(editForm.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting the review.');
      this.disabled = false;
    });
  });

  const deleteButton = document.getElementById('Delete');
  if (deleteButton) {
    deleteButton.addEventListener('click', function () {
      const reviewId = this.getAttribute('data-review-id');
      if (confirm('Confirm to Delete?')) {
        fetch(`/review/${reviewId}`, { method: 'DELETE' })
          .then(response => response.json())
          .then(data => {
            alert('Review deleted successfully');
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            } else {
              alert('Review deleted, but no redirect information received.');
            }
          })
          .catch(error => console.error('Error:', error));
    }
    });
  }

  

  const commentForm = document.getElementById('addCommentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', function (event) {
      event.preventDefault();
      submitComment();
    });
  }

  

  function submitComment() {
    const reviewId = deleteButton.getAttribute('data-review-id');
    const content = document.getElementById('content').value;

    fetch(`/review/${reviewId}/addcomment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
      alert('Comment added successfully');
      location.reload(); 
    })
    .catch(error => console.error('Error:', error));
  }
});
