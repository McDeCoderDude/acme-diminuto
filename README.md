# acme-diminuto

acme-diminuto is a simple URL shortener API built with Node.js, TypeScript, Express, and MongoDB.
It creates short links from long URLs and redirects users when a short code is visited.

## What This Application Does

- Creates a short URL for a valid long URL.
- Stores URL mappings in MongoDB.
- Redirects from `/:code` to the original long URL.
- Applies HTTP security headers with Helmet.
- Applies basic request rate limiting on create and redirect endpoints.
- Runs a background cleanup job (Agenda) to remove links older than 60 days.

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Agenda (scheduled jobs)
- Nginx + Docker Compose (containerized local runtime)

## Project Structure

- [src/server.ts](src/server.ts): App bootstrap, middleware, routing, Agenda startup
- [src/routes/diminuto.ts](src/routes/diminuto.ts): Create short URL endpoint
- [src/routes/redirect.ts](src/routes/redirect.ts): Redirect endpoint
- [src/models/DiminutoUrlModel.ts](src/models/DiminutoUrlModel.ts): URL model schema
- [src/config/db.config.ts](src/config/db.config.ts): MongoDB and Agenda connections
- [docker-compose.yml](docker-compose.yml): Local multi-container setup
- [nginx/config/diminuto.conf.template](nginx/config/diminuto.conf.template): Reverse proxy config template

## API Endpoints

### Create Short URL

- Method: `POST`
- Path: `/api/diminuto`
- Body:

```json
{
	"longUrl": "https://example.com/some/very/long/path"
}
```

- Success response: URL document containing `longUrl`, `shortUrl`, and `urlCode`

### Redirect

- Method: `GET`
- Path: `/:code`
- Behavior: Redirects to the saved long URL for that code, or returns `404` if not found

## Environment Variables

Create a `.env` file in the project root and define values similar to:

```env
# App
NODE_ENV=development
NODE_PORT=3000
DNS_URI=http://localhost:3000

# MongoDB
MONGODB_HOST=localhost:27017
MONGODB_DATABASE=diminuto
MONGODB_AGENDA_DATABASE=diminuto_agenda
MONGODB_USER=app_user
MONGODB_PASSWORD=app_password

# Mongo init/root (used by docker-compose)
MONGODB_ROOT_USER=root
MONGODB_ROOT_PASSWORD=root_password

# Docker + Nginx
MONGODB_LOCAL_PORT=27017
MONGODB_PORT=27017
NGINX_HOST=localhost
NGINX_PORT=80
NGINX_LOCAL_PORT=8080
NODE_HOST=webapi
```

## Running Locally

### Option 1: Node.js Runtime

1. Install dependencies:

```bash
npm install
```

2. Start the API:

```bash
npm start
```

3. Build TypeScript output:

```bash
npm run build
```

### Option 2: Docker Compose

```bash
docker compose up --build
```

With the sample values above:

- Nginx entrypoint: `http://localhost:8080`
- API create endpoint: `http://localhost:8080/api/diminuto`

## Example Usage

Create a short URL:

```bash
curl -X POST http://localhost:8080/api/diminuto \
	-H "Content-Type: application/json" \
	-d "{\"longUrl\":\"https://github.com\"}"
```

Then open the returned short URL in your browser, for example:

```text
http://localhost:8080/abc123
```

## Notes

- The app includes basic security middleware and rate limiting, but it is best treated as a starter implementation.
- Before production use, review hardening items such as stricter CORS policy, dependency updates, and validation/abuse controls.
