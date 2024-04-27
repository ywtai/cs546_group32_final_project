function openEditModal() {
    document.getElementById('editModal').style.display = 'block';  // Show the modal
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';  // Hide the modal
}

function saveDescription() {
    const newDesc = document.getElementById('newDescription').value;
    document.getElementById('postDescription').textContent = newDesc;  // Update the description on the page
    closeEditModal();  // Close the modal after saving

    // Optionally, send the new description to the server via AJAX
    fetch('/update-description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: newDesc })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function submitComment() {
    const commentText = document.getElementById('commentText').value;
    const commentData = JSON.stringify({ comment: commentText });

    try {
        const response = await fetch('/add-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: commentData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        updateCommentsDisplay(data);
        document.getElementById('commentText').value = '';  // Clear the comment input field
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateCommentsDisplay(data) {
    const commentsContainer = document.querySelector('.comments');
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `<p><strong>${data.author}:</strong> ${data.text}                           ${data.timestamp}</p>`;
    commentsContainer.appendChild(newComment);
}
