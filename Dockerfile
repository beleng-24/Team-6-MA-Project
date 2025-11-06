# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY "Final Project Files/package*.json" ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY "Final Project Files/" ./

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]