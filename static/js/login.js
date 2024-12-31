// This script is used to handle the login form submission and authentication process.
//console.log('Hello from JS');
//sessionStorage.removeItem("utmwebfc_session");

console.log(sessionStorage.getItem("utmwebfc_session"));
var url = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi?entity=authentication";

$('#btnLogin').click(function (event) {
    // Prevent the form from submitting
    event.preventDefault();

    var username = $('#username').val();
    var password = $('#password').val();
    console.log(`Try to login: ${username}, ${password}`);
    var loginURL = `${url}&login=${username}&password=${password}`;
    console.log("Login URL: " + loginURL);



    fetch(loginURL)
    .then(function (res) {
        console.log("Response received, checking status...");
        return res.json();
    })
    .then(jsonInst => {
        console.log("JSON received: ", jsonInst);

        if (jsonInst && jsonInst.length > 0 && jsonInst[0].session_id) {
            const userInfo = {
                login_name: jsonInst[0].login_name,
                full_name: jsonInst[0].full_name,
                email: jsonInst[0].email,
                session_id: jsonInst[0].session_id,
                description: jsonInst[0].description
            };

            console.log("User Info:", userInfo);
            console.log("Session ID:", jsonInst[0].session_id);
            
            // Store session info
            sessionStorage.setItem("utmwebfc_session", JSON.stringify(userInfo));
            

            // Add the user to the database
            fetch('/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userInfo)
            })
            .then(res => res.json())
            .then(data => {
                console.log("User added to database:", data);
                window.location.href = "/dashboard"; // Redirects to a Mojolicious route
            })
            .catch(err => {
                console.error("Failed to add user to database: ", err);
                alert("Login successful but failed to save user data.");
            });

        } else {
            throw new Error("Invalid credentials or empty response.");
        }
    })
    .catch(err => {
        console.error("Error: ", err);
        alert("Login failed. Please check your credentials.");
    });

});