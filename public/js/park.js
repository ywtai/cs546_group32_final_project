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
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const postImage = document.getElementById('postImage').files[0];  // Assuming the first file selected
    const postRating = document.getElementById('ratingValue').value

    // const postsSection = document.getElementById('postsList');
    // const postLink = document.createElement('a')
    const postLinkDiv = document.createElement('div');
    postLinkDiv.className = 'post-link';

    const linkText = `${postTitle} - ${postRating} Stars`;
    const newLink = document.createElement('a');
    newLink.href = "/post/" + encodeURIComponent(postTitle); // Assuming title is unique identifier for post
    newLink.textContent = linkText;

    postLinkDiv.appendChild(newLink);
    document.getElementById('userPosts').appendChild(postLinkDiv);

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
    } else {
        icon.classList.add('far');
        icon.classList.remove('fas');
        button.classList.remove('favorited');
    }
}


function setRating(rating) {
    document.getElementById('ratingValue').value = rating;
}





