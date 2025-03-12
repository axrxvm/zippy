# Zippy URL Shortening API Documentation

Zippy is a minimalist and efficient URL shortening service designed for simplicity and speed. This documentation provides a comprehensive guide on how to use the API for shortening long URLs into clean and shareable links.

### Production URL

An Instance haven't been made live untill now. You can host it as per your needs!

### Self-Hosting

- **Requirements**:
  - **Node.js**: Version 14 or higher
  - **NPM**: Version 9 or higher

- **Getting latest files**:
  - **Using Git**: Type `git clone https://github.com/AaravMehta59/zippy.git` in your terminal.
  - **Mannual Labour**: Download the latest zip, and upzip it in your desired location.

- **How to start on your machine**
  - **Windows**: Open `start.bat` on your computer and let the magic happen! The server will start on port 3000
  - **Other OS**: Open your terminal and type `npm install && node index.js` and run it! The server will start on port 3000

### API Endpoints

#### Endpoint: POST /shorten

- **Description**: Shorten a long URL into a compact, shareable link.

- **Request**:
  - **Method**: POST
  - **Endpoint**: `/shorten`
  - **Request Body**:
    - `url` (string, required): The original URL to be shortened.
    - `shorturl` (string, optional): A custom short URL, if desired.
    - `randomUrl` (string: `true` or `false`, optional): Generates a random short URL, if specified true.

- **Response**:
  - **Success (HTTP 200 OK)**:
    - JSON response with the shortened URL information.
  - **Error (HTTP 400 Bad Request or 500 Internal Server Error)**:
    - JSON response with an error message.

- **Example 1: For Custom ShortURL**:
  - **Request**:

    ```json
    {
      "url": "https://example.com",
      "shorturl": "mycustomshorturl"
    }
    ```

  - **Response**:

    ```json
    {
      "message": "Short URL created successfully",
      "original_url": "https://example.com",
      "short_url": "https://localhost:3000/mycustomshorturl"
    }
    ```

- **Example 2: For Random Short URL**:
  - **Request**:

    ```json
    {
      "url": "https://example.com",
      "randomUrl":"true"
    }
    ```

  - **Response**:

    ```json
    {
      "info": "Short Url created successfully",
      "original_url": "https://example.com",
      "short_url": "https://localhost:3000/8ae6de"
    }
    ```

#### Endpoint: GET /:url

- **Description**: Redirect to the original URL associated with the provided short URL.

- **Request**:
  - **Method**: GET
  - **Endpoint**: `/:url`
  - **URL Parameter**:
    - `url` (string, required): The short URL to redirect.

- **Response**:
  - **Success (HTTP 302 Found)**:
    - Redirects to the original URL associated with the short URL.
  - **Error (HTTP 404 Not Found)**:
    - JSON response with an error message if the short URL is not found.

- **Example**:
  - **Request**:
    - Accessing `https://localhost:3000/mycustomshorturl` will redirect to the original URL associated with the short URL.

#### Endpoint: GET /

- **Description**: A simple welcome message for the LinkZip service.

- **Request**:
  - **Method**: GET
  - **Endpoint**: `/`

- **Response**:
  - **Success (HTTP 200 OK)**:
    - A plain text response containing the welcome message.
