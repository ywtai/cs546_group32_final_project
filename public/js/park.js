// Simulate a user login state
let isLoggedIn = false;
// import parks from "../data/parks.js";
// const park = await parks.get()

function userLogin() {
    isLoggedIn = true;
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('userGreeting').style.display = 'block';
    document.getElementById('userName').textContent = 'Alice'; // Replace with logged in user's name
    document.getElementById('addPostButton').style.display = 'inline-block'; // Show the Add Post button when logged in

}

function userLogout() {
    isLoggedIn = false;
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('userGreeting').style.display = 'none';
    document.getElementById('addPostButton').style.display = 'none'; // Hide the Add Post button when not logged in

}


function openPostForm() {
    document.getElementById('addPostModal').style.display = 'block';
}

document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('addPostModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('addPostModal')) {
        document.getElementById('addPostModal').style.display = 'none';
    }
}

document.querySelectorAll('.rating .star').forEach(function(star, idx) {
    star.addEventListener('click', function() {
        document.querySelectorAll('.rating .star').forEach(function(otherStar, j) {
            if (j <= idx) {
                otherStar.classList.add('selected');
            } else {
                otherStar.classList.remove('selected');
            }
        });
    });
});

function resetStars() {
    document.querySelectorAll('.rating .star').forEach(function(star) {
        star.classList.remove('selected');
    });
}

document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const postTitle = document.getElementById('title').value;
    const postContent = document.getElementById('content').value;
    const postImage = document.getElementById('photos').files[0];  // Assuming the first file selected
    const postRating = document.getElementById('ratingValue').value
    let errorMessageDiv = document.getElementById('error_message');
    let error = []
    if (!postTitle || postTitle === '') {
        error.push('Please enter your title')
    }

    if (!postContent || postContent === '') {
        error.push('Please enter your Content')
    }

    if (!postImage || postImage === '') {
        error.push('Please select one image')
    }
    if (!postRating || postRating === '0') {
        error.push('Please select your rating')
    }
    if(error.length !== 0) {
        let errorMessage = ''
        for (const errorElement of error) {
            errorMessage += errorElement + '\n';
        }
        errorMessageDiv.textContent = errorMessage;
            errorMessageDiv.style.display = 'block';
        return;
    } else {
        errorMessageDiv.style.display = 'none';
    }

    // let formData = new FormData(this);
    // fetch('reviews/addReview/{{this.parkId}}', {
    //     method: 'POST',
    //     body: formData
    // }).then(response => response.json()).then(data => {
    //     const table = document.querySelector('.my_coolratings_table');
    //     const row = table.insertRow(-1);
    //     const cell = row.insertCell(0);
    //     cell.innerHTML = `<a class='post-link' href='/review/${data.reviewId}'>${data.title} ${data.userName} ${data.rating} ${data.reviewDate}</a>`;
    //     document.querySelector('.no-reviews').style.display = 'none';
    // }).catch(error => console.error('Error:', error));

    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('postForm').reset();
    resetStars();
});

function toggleFavorite(button) {
    const icon = button.querySelector('i');

    if (icon.classList.contains('far')) { // Not favorited
        icon.classList.remove('far'); // 'far' is the regular heart
        icon.classList.add('fas'); // 'fas' is the solid heart
        button.classList.add('favorited');
        document.getElementById("far_btn").value = 0;
    } else {
        icon.classList.add('far');
        icon.classList.remove('fas');
        button.classList.remove('favorited');
        document.getElementById("far_btn").value = 1;
    }
}

function setRating(rating) {
    document.getElementById('ratingValue').value = rating;
}

// document.getElementById('postForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//     let formData = new FormData(this);
//     fetch('/addReview/{{this.parkId}}', {
//         method: 'POST',
//         body: formData
//     }).then(response => response.json()).then(data => {
//         const table = document.querySelector('.my_coolratings_table');
//         const row = table.insertRow(-1);
//         const cell = row.insertCell(0);
//         cell.innerHTML = `<a class='post-link' href='/review/${data.reviewId}'>${data.title} ${data.userName} ${data.rating} ${data.reviewDate}</a>`;
//         document.querySelector('.no-reviews').style.display = 'none';
//     }).catch(error => console.error('Error:', error));
// });




