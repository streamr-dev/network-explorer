FROM nginx:mainline

# Install curl for running healthcheck
RUN apt-get update && apt-get install -y curl

# Add nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Copy build artifacts
COPY build /usr/share/nginx/html
