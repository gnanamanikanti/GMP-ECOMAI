# Spring E-Commerce AI (Vector Store & RAG)

Full-stack demo: a Spring Boot e-commerce API with **Spring AI**, **OpenAI** (chat + embeddings), and **PostgreSQL + pgvector** for retrieval-augmented generation (RAG). A **React (Vite)** storefront talks to the backend for products, orders, and an AI shopping assistant.

## Features

- **Catalog** — CRUD for products, keyword search, image upload and serving.
- **AI helpers** — Generate product descriptions and images via OpenAI (see `ProductController` `/api/product/generate-description` and `/api/product/generate-image`).
- **Orders** — Place orders and list orders; stock updates sync back into the vector index for accurate RAG context.
- **RAG chat** — `GET /api/chat/ask` uses pgvector similarity search over embedded product and order text, then answers with the configured chat model (`ChatBotService`).

## Tech stack

| Layer | Technology |
|--------|------------|
| Backend | Spring Boot 3.3.x, Java 21, Spring Data JPA |
| AI | Spring AI 1.1.x, OpenAI (e.g. `gpt-4o`, `text-embedding-3-small`) |
| Vector DB | PostgreSQL with [pgvector](https://github.com/pgvector/pgvector), `spring-ai-starter-vector-store-pgvector` |
| Frontend | React 18, Vite 5, Bootstrap 5, Axios |

## Repository layout

```
SpringEcomAI/     # Spring Boot application (Maven)
t-ecom/           # React + Vite UI
```

## Prerequisites

- **JDK 21**
- **Maven 3.9+**
- **Node.js 18+** (for the frontend)
- **Docker** (recommended) or a local PostgreSQL instance with the **pgvector** extension
- An **OpenAI API key** with access to the chat and embedding models you configure

## Configuration

### Environment

Set your API key before starting the backend:

```bash
export OPENAI_API_KEY=sk-...
```

The backend reads `spring.ai.openai.api-key` from `SpringEcomAI/src/main/resources/application.properties` (via `${OPENAI_API_KEY}`).

### Database

`application.properties` expects JDBC settings for database `gpmecomai` (adjust host, port, user, and password to match your environment).

A `docker-compose.yml` in `SpringEcomAI/` starts **pgvector/pgvector:pg16** with database `gpmecomai`. Map the container port to the host port your JDBC URL uses (for example `5432:5432` or `5438:5432` if your URL uses `localhost:5438`).

On startup, `classpath:init/schema.sql` ensures the `vector` extension and `vector_store` table exist (including an HNSW index for embeddings).

### Frontend API base URL

The React app defaults to `http://localhost:8080`. Override with a Vite env variable if needed:

```bash
# in t-ecom/
echo 'VITE_BASE_URL=http://localhost:8080' > .env.local
```

## Run locally

### 1. Start PostgreSQL (pgvector)

From `SpringEcomAI/`:

```bash
docker compose up -d
```

Align JDBC `spring.datasource.url`, username, and password with your container or local instance.

### 2. Backend

From `SpringEcomAI/`:

```bash
mvn spring-boot:run
```

Or run `com.gpmecomai.SpringEcom.SpringEcomApplication` from your IDE.

Default API base: `http://localhost:8080` (unless you change the server port).

### 3. Frontend

From `t-ecom/`:

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## How RAG is populated

- **Products** — On create/update, product details are embedded and stored in the shared `VectorStore` (`ProductService`).
- **Orders** — Placing an order updates product documents (e.g. stock), adds an order-summary document, and keeps the index consistent with catalog state (`OrderService`).
- **Chat** — User questions trigger similarity search (`topK`, similarity threshold in `ChatBotService`); retrieved text is injected into the RAG prompt template at `SpringEcomAI/src/main/resources/prompts/chatbot-rag-prompt.st`.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/product/{id}` | Product by ID |
| GET | `/api/product/{productId}/image` | Product image bytes |
| GET | `/api/products/search?keyword=` | Keyword search |
| POST | `/api/product` | Create product (multipart: product + image) |
| PUT | `/api/product/{id}` | Update product |
| DELETE | `/api/product/{id}` | Delete product |
| POST | `/api/product/generate-description` | AI-generated description |
| POST | `/api/product/generate-image` | AI-generated image |
| POST | `/api/orders/place` | Place order (JSON body) |
| GET | `/api/orders` | List orders |
| GET | `/api/chat/ask?message=` | RAG chat reply |

CORS is enabled on controllers for browser access from the Vite dev server.

## Optional: Spring Boot Docker Compose integration

The project includes `spring-boot-docker-compose` as an optional runtime dependency. `spring.docker.compose.enabled` is set to `false` in `application.properties`; set it to `true` if you want Boot to manage Compose lifecycle instead of running `docker compose` manually.

## License

No license is specified in this repository; add a `LICENSE` file if you plan to publish or redistribute the code.
