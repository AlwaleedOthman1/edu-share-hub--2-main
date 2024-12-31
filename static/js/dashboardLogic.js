// Get all sidebar menu items
const sidebarItems = document.querySelectorAll('.menu li');
const selectedSidebarItem = document.getElementById('selectedSidebarItem');


// Get the Add Resource button
const addResourceButton = document.getElementById('addResourceBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');

// Add click event to sidebar items
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update the selected item in the main content area
        selectedSidebarItem.textContent = item.textContent;

        // Highlight the selected item in the sidebar
        sidebarItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // Redirect if "Add Resource" in sidebar
        if (item.textContent.trim() === "Add Resource") {
            window.location.href = "/addResource";
        }
    });
});

 //Add click event to the Add Resource button
if (addResourceButton) {
    addResourceButton.addEventListener('click', () => {
        console.log("Add Resource button clicked"); // Debugging
        window.location.href = "/addResource";
    });
} else {
    console.error("Add Resource button not found!");
}

if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
        console.log("Add Category button clicked"); // Debugging
        window.location.href = "/addCategory";
    });
} else {
    console.error("Add Category button not found!");
}


document.addEventListener('DOMContentLoaded', () => {
    // Retrieve user info from sessionStorage
    const userInfo = sessionStorage.getItem("utmwebfc_session")
        ? JSON.parse(sessionStorage.getItem("utmwebfc_session"))
        : null; // Handle null gracefully


    if (userInfo) {
        // Extract role based on 'description'
        const role = userInfo.description.toLowerCase(); // Convert to lowercase for consistency
        let userRole = "User"; // Default role

        // Map roles
        if (role.includes("pelajar")) {
            userRole = "Student"; // Pelajar -> Student
        } else if (role.includes("pensyarah")) {
            userRole = "Lecturer"; // Pensyarah -> Lecturer
        }

        // Replace static text with dynamic role
        const roleElement = document.querySelector('.top-bar .user-info .role');
        if (roleElement) {
            roleElement.textContent = userRole; // Replace content dynamically
        }
    } else {
        // Redirect to login if no session info is available
        window.location.href = "/login";
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const categoryItems = document.querySelectorAll('.menu li'); // Sidebar categories
    const resourceItems = document.querySelectorAll('.file-item'); // Resource items
    const sessionFilter = document.querySelector('#sessionFilter'); // Session dropdown

    sessionFilter.addEventListener('change', () => {
        const selectedSession = sessionFilter.value;

        // Filter resources by selected session
        resourceItems.forEach(resource => {
            const session = resource.querySelector('.file-semester').textContent.split(': ')[1]; // Get session
            if (session === selectedSession || selectedSession === 'All') {
                resource.style.display = 'flex'; // Show
            } else {
                resource.style.display = 'none'; // Hide
            }
        });
    });

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const selectedCategory = item.textContent.trim();

            // Filter resources based on the selected category
            resourceItems.forEach(resource => {
                const category = resource.querySelector('.file-owner').textContent.split(': ')[1]; // Extract category
                if (category === selectedCategory || selectedCategory === "All") {
                    resource.style.display = 'flex'; // Show matching resources
                } else {
                    resource.style.display = 'none'; // Hide non-matching resources
                }
            });

            // Highlight selected category
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resourceForm');
    const cancelButton = document.querySelector('.cancel-btn');

    // Form Validation before submission
    form.addEventListener('submit', function (event) {
        const name = document.getElementById('name').value.trim();
        const resourceLink = document.getElementById('resource-link').value.trim();
        const description = document.getElementById('description').value.trim();
        const category = document.getElementById('category').value.trim();

        if (!name || !resourceLink || !description || !category) {
            alert('All fields are required!');
            event.preventDefault(); // Prevent form submission
            return;
        }

        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
        if (!urlPattern.test(resourceLink)) {
            alert('Invalid URL format!');
            event.preventDefault();
        }
    });

    // Cancel button functionality
    cancelButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel?')) {
            window.location.href = '/dashboard'; // Redirect to dashboard
        }
    });
});


