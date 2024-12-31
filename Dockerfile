FROM perl:5.32

# Install dependencies
RUN cpanm Mojolicious DBD::MariaDB DBI

# Set up the working directory
WORKDIR /app

# Copy the app files
COPY app/ /app

# Expose port 3000 for Mojolicious
EXPOSE 3000

# Start the application
CMD ["perl", "myapp.pl", "daemon", "-l", "http://*:3000"]
