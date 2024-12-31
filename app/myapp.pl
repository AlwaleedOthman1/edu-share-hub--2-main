#!/usr/bin/env perl
use Mojolicious::Lite;
use DBI;
use Mojo::JSON qw(decode_json);

# Database configuration
my $dsn = "DBI:MariaDB:database=testdb;host=mariadb;port=3306";
my $username = "root";
my $password = "rootpassword";

# DB connection
helper db => sub {
    DBI->connect($dsn, $username, $password, { RaiseError => 1, AutoCommit => 1 });
};

# Route: Display form and messages
get '/' => sub {
    my $c = shift;
    $c->redirect_to('/login');
};

get '/login' => sub {
    my $c = shift;
    $c->render(template => 'login');
};


get '/dashboard' => sub {
    my $c = shift;

    # Retrieve user info from session
    my $user_info = $c->session('user_info');
    unless ($user_info) {
        return $c->redirect_to('/login'); # Redirect to login if no session found
    }

     # Convert name to Title Case (First letter capitalized)
    my $name = $user_info->{full_name};
    $name =~ s/(\w)(\w*)/\u$1\L$2/g; # Capitalize first letter of each word

    # Determine Role and Faculty Code
    my $description = lc($user_info->{description}); # Convert to lowercase
    my $role = "Unknown";  # Default role
    my $faculty = "";      # Faculty code

    if ($description =~ /pelajar\s*(\w+)/) {
        $role = "Student";
        $faculty = uc($1); # Extract faculty code and convert to uppercase
    } elsif ($description =~ /pensyarah\s*(\w+)/) {
        $role = "Lecturer";
        $faculty = uc($1); # Extract faculty code and convert to uppercase
    }

    # Fetch resource details
    my $sth = $c->db->prepare("SELECT id, name, description, category, shared_with, session, resource_link FROM resources");
    $sth->execute;

    my @resources;
    while (my $row = $sth->fetchrow_hashref) {
        push @resources, $row;
    }

    # Fetch distinct categories for the sidebar
    my $sth_categories = $c->db->prepare("SELECT DISTINCT category FROM resources");
    $sth_categories->execute;

    # Fetch distinct sessions for the dropdown
    my $sth_sessions = $c->db->prepare("SELECT DISTINCT session FROM resources ORDER BY session ASC");
    $sth_sessions->execute;

    my @sessions;
    while (my $row = $sth_sessions->fetchrow_hashref) {
        push @sessions, $row->{session};
    }

    my @categories;
    while (my $row = $sth_categories->fetchrow_hashref) {
        push @categories, $row->{category};
    }

    # Pass user info, resources, and categories to the template
    $c->stash(
        resources  => \@resources,
        sessions   => \@sessions,  # Add distinct sessions
        categories => \@categories,  # Add categories to stash
        user_name  => $name,
        user_role   => $role,  # Student or Lecturer
        faculty     => $faculty 
    );
    $c->render(template => 'dashboard');
};



# Route: Add a user to the database
post '/addUser' => sub {
    my $c = shift;

    # Get JSON data from request
    my $json = decode_json($c->req->body);

    my $login_name  = $json->{login_name};
    my $full_name   = $json->{full_name};
    my $email       = $json->{email};
    my $session_id  = $json->{session_id};
    my $description = $json->{description};

    $c->session(user_info => {
    login_name  => $login_name,
    full_name   => $full_name,
    email       => $email,
    session_id  => $session_id,
    description => $description
});

    # Check if the user already exists
    my $sth = $c->db->prepare("SELECT id FROM users WHERE email = ?");
    $sth->execute($email);
    my $existing_user = $sth->fetchrow_array;

    if ($existing_user) {
        # User already exists, return success without adding
        return $c->render(json => { status => 'success', message => 'User already exists' });
    }

    # Insert new user
    $sth = $c->db->prepare("INSERT INTO users (login_name, full_name, email, session_id, description)
                            VALUES (?, ?, ?, ?, ?)");
    $sth->execute($login_name, $full_name, $email, $session_id, $description);

    $c->render(json => { status => 'success', message => 'User added successfully!' });
};

# Route: Update an existing resource
post '/updateResource/:id' => sub {
    my $c = shift;
    my $id = $c->param('id');

    # Get form parameters
    my $name        = $c->param('name');
    my $description = $c->param('description');
    my $category    = $c->param('category');
    my $shared_with = $c->param('shared-with');
    my $session     = $c->param('session');

    # Update the resource in the database
    my $sth = $c->db->prepare("UPDATE resources SET name = ?, description = ?, category = ?, shared_with = ?, session = ? WHERE id = ?");
    $sth->execute($name, $description, $category, $shared_with, $session, $id);

    # Redirect back to the dashboard
    $c->redirect_to('/dashboard');
};


# Route: Delete a resource
post '/deleteResource/:id' => sub {
    my $c = shift;
    my $id = $c->param('id');

    # Delete the resource from the database
    my $sth = $c->db->prepare("DELETE FROM resources WHERE id = ?");
    $sth->execute($id);

    # Send a success response
    $c->render(json => { status => 'success', message => 'Resource deleted successfully!' });
};





# Route: Display the Add Resource page
get '/addResource' => sub {
    my $c = shift;

    # Get current user info from session
    my $user_info = $c->session('user_info');
    unless ($user_info) {
        return $c->redirect_to('/login'); # Redirect to login if no session
    }

    # Fetch distinct sessions
    my $sth_sessions = $c->db->prepare("SELECT DISTINCT session FROM resources ORDER BY session ASC");
    $sth_sessions->execute;
    my @sessions;
    while (my $row = $sth_sessions->fetchrow_hashref) {
        push @sessions, $row->{session};
    }

    # Fetch distinct categories
    my $sth_categories = $c->db->prepare("SELECT DISTINCT category FROM resources ORDER BY category ASC");
    $sth_categories->execute;
    my @categories;
    while (my $row = $sth_categories->fetchrow_hashref) {
        push @categories, $row->{category};
    }

    # Pass data to the template
    $c->stash(
        sessions   => \@sessions,
        categories => \@categories,
        user_email => $user_info->{email} # Pass user email
    );

    $c->render(template => 'addResource');
};


# Route: Add a new resource to the database
post '/addResource' => sub {
    my $c = shift;

    # Get form parameters
    my $name        = $c->param('name');
    my $description = $c->param('description');
    my $category    = $c->param('category');
    my $shared_with = $c->param('shared-with');
    my $session     = $c->param('session');
    my $resource_link = $c->param('resource-link');

    # Insert into database
    my $sth = $c->db->prepare("INSERT INTO resources (name, description, category, shared_with, session, resource_link)
                               VALUES (?, ?, ?, ?, ?, ?)");
    $sth->execute($name, $description, $category, $shared_with, $session, $resource_link);

    # Send a success response
    $c->render(json => { status => 'success', message => 'Resource added successfully!' });
};

# Route: Edit a specific resource
get '/editResource/:id' => sub {
    my $c = shift;
    my $id = $c->param('id');

    # Fetch the specific resource by ID
    my $sth = $c->db->prepare("SELECT * FROM resources WHERE id = ?");
    $sth->execute($id);
    my $resource = $sth->fetchrow_hashref;

    # Render the edit resource template
    if ($resource) {
        $c->stash(resource => $resource);
        $c->render(template => 'editResource');
    } else {
        $c->reply->not_found;
    }
};

get '/addCategory' => sub {
    my $c = shift;


    $c->render(template => 'addCategory');
};

app->static->paths->[0] = app->home->rel_file('public');

# Start the Mojolicious app
app->start;
