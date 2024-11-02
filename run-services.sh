#!/bin/bash

# List of service directories
services=("services/auth" "services/cart" "services/email" "services/inventory" "services/order" "services/product" "services/user")

# Loop through each service directory and run the app
for service in "${services[@]}"
do
  echo "Starting $service ..."
  (cd "$service" && bun run dev) &
done

# Wait for all background processes to finish
wait

echo "All services are running."
