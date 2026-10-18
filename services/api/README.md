# Backend API — Owner: Sharanya

Stack: FastAPI, SQLAlchemy, Alembic and Supabase PostgreSQL.

## Responsibilities
- REST endpoints and request/response validation
- Database queries and transaction handling
- Authentication and role-based authorization
- Inventory, production, surplus, recipients, deliveries, waste and impact
- Integration with documented ML inference interfaces

## Local setup
1. Create a local services/api/.env using .env.example.
2. Use a private database connection string.
3. Install requirements in the API virtual environment.
4. Start with: uvicorn main:app --reload --port 8000

API documentation is available at /docs while the server is running.
Never commit .env or credentials.
