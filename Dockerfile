# Use Node.js 18 LTS 
FROM node:18 

# Set working directory 
WORKDIR /app 

# Copy package.json first (better caching) 
COPY package*.json ./ 

# Install all dependencies 
RUN npm install 

# Copy entire project to container 
COPY . . 

# HuggingFace exposes PORT via environment variable 
ENV PORT=7860 

# Build command (you have pure HTML/CSS/JS, so skip) 
# If your front-end needed build, do it here 

# Expose port 
EXPOSE 7860 

# Start server 
CMD ["node", "server/app.js"]