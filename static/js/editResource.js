// Handle Save (Update) button click
document.querySelector('.save-btn').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get the form and prepare data
    const form = document.getElementById('editResourceForm');
    const formData = new FormData(form); // Collect form data
    const resourceId = window.location.pathname.split('/').pop(); // Extract resource ID from the URL

    // Send a POST request to update the resource
    fetch(`/updateResource/${resourceId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json()) // Parse JSON response
    .then(data => {
        if (data.status === 'success') {
            alert('Resource updated successfully!');
            window.location.href = '/dashboard'; // Redirect to dashboard
        } else {
            alert('Failed to update resource. Please try again.');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('An error occurred while updating the resource.');
    });
});

// Handle Delete button click
function deleteResource(resourceId) {
    if (confirm("Are you sure you want to delete this resource?")) {
        fetch(`/deleteResource/${resourceId}`, {
            method: 'POST', // Send a POST request for deletion
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json()) // Parse JSON response
        .then(data => {
            if (data.status === 'success') {
                alert('Resource deleted successfully!');
                window.location.href = '/dashboard'; // Redirect to dashboard
            } else {
                alert('Failed to delete resource. Please try again.');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('An error occurred while deleting the resource.');
        });
    }
}

// Attach delete function to the button
document.querySelector('.delete-btn').addEventListener('click', function () {
    const resourceId = window.location.pathname.split('/').pop(); // Get resource ID from URL
    deleteResource(resourceId); // Call delete function
});
