FROM nginx:mainline

# Add nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Copy build artifacts
COPY build /usr/share/nginx/html
