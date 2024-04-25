// Simulate a user login state
let isLoggedIn = false;
// import parks from "../data/parks.js";
// const park = await parks.get()

let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    setTimeout(showSlides, 4000); // Change image every 4 seconds
}

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

function toggleComments(button) {
    const commentsContainer = button.nextElementSibling;
    if (commentsContainer.style.display === 'none') {
        commentsContainer.style.display = 'block';
        button.textContent = 'Hide Comments';
    } else {
        commentsContainer.style.display = 'none';
        button.textContent = 'Comment';
    }
}

function loadMoreComments(button) {
    // This would load more comments dynamically; for now, we simulate this
    alert('More comments loaded!');
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

document.getElementById('postForm').onsubmit = function(event) {
    event.preventDefault();
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const postImage = document.getElementById('postImage').files[0];  // Assuming the first file selected
    const postRating = document.querySelectorAll('.rating .star.selected').length;

    const postsSection = document.getElementById('postsList');
    const postLink = document.createElement('a');
    postLink.href = 'postPage.html';  // Assuming 'postPage.html' is a placeholder for dynamic post pages
    postLink.className = 'post-link';
    postLink.innerText = postTitle + ' - Click to read more';
    postsSection.appendChild(postLink);

    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('postForm').reset();
    resetStars();
};

function toggleFavorite(button) {
    const postId = button.getAttribute('data-postid');
    const isFavorited = button.classList.contains('favorited');

    if (!isLoggedIn) { // Assume isLoggedIn is a global variable that tracks login status
        alert("Please log in to use this feature.");
        return;
    }

    // Toggle favorited class for visual feedback
    if (isFavorited) {
        button.classList.remove('favorited');
        // Optionally, send a request to the server to remove from favorites
    } else {
        button.classList.add('favorited');
        // Optionally, send a request to the server to add to favorites
    }
}

document.getElementById('postForm').onsubmit = async function(event) {
    event.preventDefault();

    // Retrieve form data
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const postRating = document.querySelectorAll('.rating .star.selected').length;
    const imageFile = document.getElementById('postImage').files[0];

    // Form data needs to be sent as FormData since we're including a file
    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('content', postContent);
    formData.append('rating', postRating);
    formData.append('image', imageFile);

    // Send data to server
    try {
        const response = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            body: formData // Note: When using FormData, the 'Content-Type' header is automatically set to 'multipart/form-data', which includes the boundary parameter.
        });
        const responseData = await response.json();

        if (response.ok) {
            // Assuming the server responds with the created post object including a new ID
            displayPostPage(responseData); // Function to handle displaying the post
        } else {
            throw new Error('Failed to create post');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    // Hide the modal and reset the form
    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('postForm').reset();
    resetStars();
};

function displayPostPage(postData) {
    // Here you would dynamically create the content for your post page
    // For this example, let's assume you're dynamically creating it on the same page or redirecting
    window.location.href = `postPage.html?postId=${postData.id}`; // Redirect to a dynamically created post page
}

