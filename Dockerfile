# Use official Node.js image as base
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy all project files
COPY . .

# EXPOSE 3000

# Command to run migrations and seeders
CMD ["npm", "run", "migrate"]