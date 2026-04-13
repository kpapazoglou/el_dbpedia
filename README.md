# Semantic Web Application for Greek DBpedia

This project is a sophisticated **Semantic Web Application** designed to explore, query, and visualize the **Greek DBpedia Knowledge Graph**.

It implements a robust **3-tier architecture** (Frontend, Middleware, Database) to solve common Linked Data challenges, such as data inconsistency and visualization. The application features a **High-Performance Dashboard** powered by Golang concurrency, and an intelligent **SPARQL Editor** that provides compiler-like feedback.

## 🚀 Key Features

### 1. 🗺️ Rich Visualization & Maps
- **Google Maps Integration:** Automatically generates map links (Pins 📍) for entities with geospatial coordinates (`geo:lat`, `geo:long`).
- **Image Thumbnails:** Renders `dbo:thumbnail` images directly within the results table with hover zoom effects.
- **Smart Text Handling:** Long abstracts/descriptions are truncated with a "Read More/Less" toggle for better UX.

### 2. 🔍 Resilient Query Strategy (Semantic Filtering)
- Implements **Semantic Text Filtering**: Instead of relying solely on rigid RDF relationships, the system searches for keywords (e.g., "Greece", "Athens") within the `dbo:abstract` to ensure accurate retrieval of Greek entities.

### 3. 🛠️ Intelligent SPARQL Editor
- Provides a "Compiler-like" experience.
- Catches raw errors from the Virtuoso Server (e.g., Syntax Errors) and displays them in a dedicated **Error Console** inside the UI, helping users debug their queries effectively.

### 4⚡ High-Performance SPARQL Execution (Scatter-Gather Pattern)
- **Dynamic Parallelism**: Whenever a user executes a SELECT query in the editor, the system fetches the requested data while simultaneously calculating the total dataset size (Total in DB) without adding any latency.
- **Real-Time Telemetry**: The React frontend instantly displays execution time, returned rows, and parallel background stats via a live UI badge.
- **Technical Highlight**: Implements the Scatter-Gather pattern utilizing Golang Goroutines and sync.WaitGroup. A custom query parser dynamically intercepts the SPARQL syntax, extracts prefixes, removes LIMIT/ORDER BY clauses, and executes  - secondary parallel COUNT query against the Virtuoso DB. This completely eliminates sequential round-trip delays, cutting user wait time by ~50%.
---

## 🏗️ Tech Stack

### Frontend (Presentation Layer)
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Features:** Dynamic Results Table, Predefined Queries, History Management.

### Backend (Application Layer)
- **Language:** Golang
- **Networking:** Native `net/http` (Standard Library)
- **Key Features:**
  - **Concurrency:** Goroutines for parallel data fetching.
  - **Proxy:** Handles CORS and forwards requests to the Triple Store.
  - **Error Parsing:** Standardizes Virtuoso error messages for the frontend.

### Database (Data Layer)
- **System:** Virtuoso Universal Server (Open Source)
- **Data:** Greek DBpedia Dumps (RDF/NTriples).

## 🛠️ Installation & Setup

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Golang](https://go.dev/) (Optional, for local dev)
- [Node.js](https://nodejs.org/) (Optional, for local dev)

### Quick Start (Docker)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/kpapazoglou/el_dbpedia

2. **Start the application:**
   docker-compose up --build

3. **Access the App:** 
  - Frontend: http://localhost:5173 (or port defined in docker-compose)
  - Backend API: http://localhost:8080
  - Virtuoso: http://localhost:8890


This project is part of a Thesis submission.
