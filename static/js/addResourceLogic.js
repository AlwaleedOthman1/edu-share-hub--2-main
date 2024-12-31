// Listen for form submission
document.getElementById('resourceForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const owner = document.getElementById('owner').value; // Dynamically fetched owner email
    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const sharedWith = document.getElementById('shared-with').value;
    const session = document.getElementById('session').value;
    const resourceLink = document.getElementById('resource-link').value.trim();

    // Validation
    if (!name || !description || !category || !resourceLink) {
        alert('All fields are required.');
        return; // Stop form submission
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    if (!urlPattern.test(resourceLink)) {
        alert('Invalid URL format!');
        return; // Stop form submission
    }

    // Prepare data
    const data = {
        owner: owner, // Include owner email
        name: name,
        description: description,
        category: category,
        shared_with: sharedWith,
        session: session,
        resource_link: resourceLink // Fix naming consistency with backend
    };

    // Send data to backend
    fetch('/addResource', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data) // Encode data for form submission
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error!'); // Handle HTTP errors
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                window.location.href = '/dashboard'; // Redirect to dashboard
            } else {
                alert('Failed to add resource.'); // Show error from backend
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the resource.'); // Handle network errors
        });
});

// Cancel Button Logic
document.querySelector('.cancel-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = '/dashboard'; // Redirect to dashboard
    }
});

// Populate Owner Field Dynamically
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve user info from sessionStorage
    const userInfo = sessionStorage.getItem("utmwebfc_session")
        ? JSON.parse(sessionStorage.getItem("utmwebfc_session"))
        : null;

    if (userInfo && userInfo.email) {
        document.getElementById('owner').value = userInfo.email; // Set owner email dynamically
    } else {
        alert('Session expired. Please log in again.');
        window.location.href = '/login'; // Redirect to login if session is missing
    }
});
