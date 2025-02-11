# Greek DBpedia Knowledge Graph Update

This project aims to update and enhance the Knowledge Graph of the Greek DBpedia by providing an interactive web interface where users can explore its content and visualize SPARQL query results. The project consists of a **React** front-end, a **Golang** back-end, and a **Virtuoso SPARQL endpoint**, all deployed using **Docker**.

## Features
- **SPARQL Query Execution**: Query the Greek DBpedia Knowledge Graph via a Virtuoso endpoint.
- **Interactive Front-end**: Built with React to allow users to explore data and visualize results.
- **Robust Back-end**: Developed in Golang to handle API requests efficiently.
- **SPARQL Autocomplete**: Assists users in writing queries more efficiently.
- **Query History**: Allows users to view and rerun previous queries.
- **Docker Deployment**: Deploy all components in a containerized environment.
- **Concurrency Support** (Planned): Enhancing performance for handling multiple queries simultaneously.

## Tech Stack
- **Front-end**: React
- **Back-end**: Golang
- **Database**: Virtuoso SPARQL Endpoint
- **Deployment**: Docker & Docker Compose

## Installation
### Prerequisites
Ensure you have the following installed on your system:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Golang](https://go.dev/)
- [Node.js & npm](https://nodejs.org/)

### Steps
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/greek-dbpedia-kg.git
   cd greek-dbpedia-kg
   ```
2. **Start the application using Docker Compose:**
   ```sh
   docker-compose up --build
   ```
3. **Access the application:**
   - Front-end: `http://localhost:3000`
   - API (Back-end): `http://localhost:8080`
   - Virtuoso SPARQL Endpoint: `http://localhost:8890/sparql`

## Usage
- Enter a SPARQL query in the provided input field.
- Use the autocomplete feature for easier query construction.
- View query results in a structured and visual format.
- Access past queries in the query history section.

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/queries` | Fetch saved queries |
| POST | `/api/query` | Execute a SPARQL query |
| GET | `/api/status` | Check service status |

## Deployment
For production deployment, modify the `.env` file and use:
```sh
docker-compose -f docker-compose.prod.yml up --build -d
```

## Contact
For questions or collaborations, reach out to `kopapazoglou95@gmail.com` or open an issue on GitHub.

