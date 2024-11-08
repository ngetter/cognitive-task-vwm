# Use an official Python base image
FROM python:3.9-slim

# Install git to clone the repository
# RUN apt-get update && apt-get install -y git

# Set the working directory
WORKDIR /app

# Clone the repository
# RUN git clone https://github.com/ngetter/cognitive-task-vwm.git /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 80
EXPOSE 80

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
