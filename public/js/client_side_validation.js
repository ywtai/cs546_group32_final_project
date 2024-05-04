var registerForm = document.getElementById('registration-form');
let errorDiv = document.getElementById('error')
let userName = document.getElementById('userName')
let email = document.getElementById('email')
let password = document.getElementById('password')

let confirmPassword = document.getElementById('confirmPassword')
let dateOfBirth = document.getElementById('dateOfBirth')

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

let loginForm = document.getElementById('login-form')
let loginpassword = document.getElementById('loginpassword')
let usernameOrEmail = document.getElementById('usernameOrEmail')
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      console.log(helpers.checkIfValid(
        usernameOrEmail.value,
        loginpassword.value,
      ))
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


// var loginForm = document.getElementById('login-form')
// console.log(loginForm)

// if (loginForm) {

//   loginForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     try {
//       helpers.checkIfValid(
//         usernameOrEmail.value,
//         loginpassword.value,
//       )
//       usernameOrEmail = helpers.checkuserNameorEmail(usernameOrEmail.value);
//       loginpassword = helpers.checkPassword(loginpassword.value);
//       errorDiv.hidden = true;
//       loginForm.submit();
//     } catch (e) {
//       errorDiv.hidden = false;
//       errorDiv.innerHTML = e;
//     }
//   })
// }

//review
const watcher = (elementID, error) => {

  document.getElementById(elementID).addEventListener('focus', (e) => {

    let errors = document.querySelectorAll(`#${error}`);
    errors.forEach((e) => e.remove());
  });
};

const errorTip = (element, text) => {
  let error = document.createElement('div');
  error.id = `error-${element.id}`;
  error.className = 'error';
  error.style.color = '#8B0000';
  error.style.fontSize = '14px';
  element.insertAdjacentElement('afterend', error);
  error.innerHTML = text;

  watcher(element.id, error.id);
};

const checkString = (strVal, varName, conditions) => {
  let str = strVal.value;
  let hasError = false;
  if (!str) {
    let text = `Error: You must provide ${varName}`;
    errorTip(strVal, text);
    hasError = true;
  }

  if (typeof str !== 'string') {
    let text = `Error: ${varName} must be a string!`;
    errorTip(strVal, text);
    hasError = true;
  }

  str = str.trim();
  if (str.length === 0) {
    let text = `Error: ${varName} cannot be an empty string or string with just spaces`;
    errorTip(strVal, text);
    hasError = true;
  }

  if (conditions) {
    let key = Object.keys(conditions);
    let value = Object.values(conditions);
    key.map((item, index) => {
      if (item === 'max') {
        if (str.length > value[index]) {
          text = `Error: ${varName} must be less than ${value[index]} characters`;
          errorTip(strVal, text);
          hasError = true;
        }
      }
      if (item === 'min') {
        if (str.length < value[index]) {
          text = `Error: ${varName} must be more than ${value[index]} characters`;
          errorTip(strVal, text);
          hasError = true;
        }
      }
    });
  }
  if (hasError) {
    return false;
  }
  return true;
};

const checkRating = (element) => {
  const rating = parseInt(element.value, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errorTip(element, "Rating must be a number between 1 and 5.");
    return false;
  }
  if (rating % 1 !== 0) {
      errorTip(element, "Rating must be an integer.");
      return false;
  }
  return true;
}

const checkPhotos = (element) => {
  const photos = element.files;
  const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/JPG', 'image/JPEG', 'image/PNG'];

  if (photos) {
    if (photos.length > 5) {
      errorTip(element, "Please select less than 5 files.");
      return false;
    }
    for (let i = 0; i < photos.length; i++) {
      let photo = photos.item(i);
      if (!allowedTypes.includes(photo.type)) {
        errorTip(element, "Invalid file type. Please upload a JPG, JPEG, PNG");
        return false;
     }

     const photoSize = Math.round((photo.size / 1024));
     if (photoSize > 5120) {
      errorTip(element, "Photo too big, please select photos less than 5MB.");
        return false;
     } else if (photoSize < 1) {
      errorTip(element, "Photo too small, please select photos more than 1KB.");
        return false;
     }
    }
  }
  return true;
}

const validateReviewData = (e, submitButton) => {
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  const rating = document.getElementById('rating');
  const photos = document.getElementById('photos');

  checkString(title, 'title', { min: '2', max: '20' });
  checkString(content, 'content', { min: '2', max: '200' });
  checkRating(rating);
  checkPhotos(photos);

  let err = document.querySelectorAll('.error');
  if (!err || err.length === 0) {
    check = true;
  } else {
    check = false;
  }

  if (check) {
    submitButton.setAttribute('type', 'submit');
  } else {
    submitButton.setAttribute('type', 'button');
  }
  return;
}

const validateEditReviewData = (e, submitButton) => {
  const title = document.getElementById('edit-title');
  const content = document.getElementById('edit-content');
  const rating = document.getElementById('edit-rating');

  checkString(title, 'title', { min: '2', max: '20' });
  checkString(content, 'content', { min: '2', max: '200' });
  checkRating(rating);

  let err = document.querySelectorAll('.error');
  if (!err || err.length === 0) {
    check = true;
  } else {
    check = false;
  }

  if (check) {
    submitButton.setAttribute('type', 'submit');
  } else {
    submitButton.setAttribute('type', 'button');
  }
  return;
}

const validateCommentData = (e, submitButton) => {
  const content = document.getElementById('commentContent');

  checkString(content, 'content', { min: '2', max: '200' });

  let err = document.querySelectorAll('.error');
  if (!err || err.length === 0) {
    check = true;
  } else {
    check = false;
  }

  if (check) {
    submitButton.setAttribute('type', 'submit');
  } else {
    submitButton.setAttribute('type', 'button');
  }
  return;
}

const validateEditCommentData = (e, submitButton, commentIndex) => {
  const content = document.getElementById(`editCommentContent_${commentIndex}`);

  checkString(content, 'content', { min: '2', max: '200' });

  let err = document.querySelectorAll('.error');
  if (!err || err.length === 0) {
    check = true;
  } else {
    check = false;
  }

  if (check) {
    submitButton.setAttribute('type', 'submit');
  } else {
    submitButton.setAttribute('type', 'button');
  }
  return;
}

//add review
document.addEventListener('DOMContentLoaded', function() {
  const submitButton = document.getElementById('reviewSubmit');
  const reviewErrorMessage = document.getElementById('addreview_error_message');
  
  if (submitButton) {
    submitButton.addEventListener('click', function(event) {
      let errors = document.querySelectorAll('.error');
			if (errors) {
				errors.forEach((ele) => ele.remove());
			}
			validateReviewData(event, submitButton);
    });
  }
});

//edit or delete review
document.addEventListener('DOMContentLoaded', function () {
  const editFormButton = document.getElementById('editForm');
  const editForm = document.getElementById('editReviewForm');
  const reviewErrorMessage = document.getElementById('review_error_message');
  if (editFormButton && editForm) {
    editFormButton.addEventListener('click', function () {
      editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  const editSubmitButton = document.getElementById('editReviewSubmit');
  if (editSubmitButton) {
    editSubmitButton.addEventListener('click', function(event) {
      let errors = document.querySelectorAll('.error');
			if (errors) {
				errors.forEach((ele) => ele.remove());
			}
			validateEditReviewData(event, editSubmitButton);
    });
  }

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

  //add comment
  const commentSubmitButton = document.getElementById('commentSubmit');

  if (commentSubmitButton) {
    commentSubmitButton.addEventListener('click', function(event) {
      let errors = document.querySelectorAll('.error');
			if (errors) {
				errors.forEach((ele) => ele.remove());
			}
			validateCommentData(event, commentSubmitButton);
    });
  }

  //edit/delete comment
  const editCommentButtons = document.querySelectorAll('.editComment')

  editCommentButtons.forEach((item) => { 
    item.addEventListener('click', function(event) {
      event.preventDefault();
      const commentIndex = item.getAttribute("data-index-id");
      const editCommentForm = document.getElementById(`editCommentForm_${commentIndex}`);

      if (editCommentForm) {
        editCommentForm.style.display = editCommentForm.style.display === 'none' ? 'block' : 'none';
      }
    });
  })

  const editCommentSubmitButtons = document.querySelectorAll('[name="editCommentSubmit"]');
  editCommentSubmitButtons.forEach((item) => { 
    item.addEventListener('click', function(event) {
      const commentIndex = item.getAttribute("data-index-id");
      let errors = document.querySelectorAll('.error');
			if (errors) {
				errors.forEach((ele) => ele.remove());
			}
			validateEditCommentData(event, item, commentIndex);
    });
  })

  const deleteCommentButtons = document.querySelectorAll('.deleteComment')

  deleteCommentButtons.forEach((item) => { 
    item.addEventListener('click', function(event) {
      event.preventDefault();
      const reviewId = item.getAttribute('data-review-id');
      const commentId = item.getAttribute('data-comment-id');
      if (confirm('Confirm to Delete?')) {
        fetch(`/review/${reviewId}/comment/${commentId}`, { method: 'DELETE' })
          .then(response => response.json())
          .then(data => {
            alert('Comment deleted successfully');
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            } else {
              alert('Comment deleted, but no redirect information received.');
            }
          })
          .catch(error => console.error('Error:', error));
      }
    });
  })
});

//review photo slides
let hasSlides = document.getElementById("hasSlides");
if (hasSlides) {
  let slideIndex = 1;
  showSlides(slideIndex);

  function plusSlides(n) {
    showSlides(slideIndex += n);
  }

  function currentSlide(n) {
    showSlides(slideIndex = n);
  }

  function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    slides[slideIndex-1].style.display = "block";
  }
}


// favorite-btn AJAX
document.addEventListener('DOMContentLoaded', function () {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        const passportButtons = document.querySelectorAll('.addpassport');

        favoriteButtons.forEach(button => {
            button.addEventListener('click', function () {
                toggleFavorite(this);
            });
        });

        passportButtons.forEach(button => {
            button.addEventListener('click', function () {
                addToPassport(this);
            });
        });
    });

    function toggleFavorite(button) {
        const parkId = button.dataset.postid;
        const isFavorited = button.dataset.favorited === "1";
        const parkName = button.dataset.parkname;

        fetch(`/favorite/${parkId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: !isFavorited, parkId: parkId, parkName: parkName })
        })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                }
                return response.json()
            })
            .then(data => {
                if (data.favorited) {
                    button.innerHTML = '<img class="heart" src="/public/icon/redheart.png" alt="favorite">';
                    button.dataset.favorited = "1";
                } else {
                    button.innerHTML = '<img class="heart" src="/public/icon/heart.png" alt="favorite">';
                    button.dataset.favorited = "0";
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function addToPassport(button) {
        const parkName = button.dataset.parkname;
        const parkId = button.dataset.postid;
        fetch(`/passport/add/${parkId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parkName: parkName, parkId: parkId })
        })
            .then(response => {
                console.log(response, "passport")
                if (response.redirected) {
                    window.location.href = response.url;
                }
                return response.json()
            })
            .then(data => {
                if (data.added) {
                    alert('Added to passport successfully!');
                } else {
                    alert('Park already exists!')
                }

            })
            .catch(error => console.error('Error:', error));
    }

// review like-btn
document.addEventListener('DOMContentLoaded', function () {
    const favoriteButtons = document.querySelectorAll('.like-btn');

    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleLike(this);
        });
    });
});

function toggleLike(button) {
    const reviewId = button.dataset.postid;
    const islike = button.dataset.liked === "1";

    fetch(`/like/${reviewId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ islike: !islike})
    })
    .then(response => {
      if(response.redirected){
        window.location.href=response.url;
      }
      return response.json()
      })
    .then(data => {
        if (data.islike) {
          button.innerHTML = `
            <img class="heart" src="/public/icon/redheart.png" alt="favorite"> 
            <label>${data.likes}</label>
            `; // Filled heart
            button.dataset.liked = "1";
        } else {
          button.innerHTML = `
            <img class="heart" src="/public/icon/heart.png" alt="favorite"> 
            <label>${data.likes}</label>
            `; // Empty heart
            button.dataset.liked = "0";
        }
    })
    .catch(error => console.error('Error:', error));
}

