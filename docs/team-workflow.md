# ReAhara AI Team Workflow

## Owners
- Kasaniragini: ml/ and data/
- Sharanya: services/api/
- Mamatha: apps/web/
- Pallavi: services/iot/ and services/logistics/

## Git workflow
1. Start from the latest main branch.
2. Create a feature branch for your task.
3. Work only in your assigned module unless coordinating a shared change.
4. Run relevant tests and lint checks.
5. Commit and push your feature branch.
6. Open a pull request into main and request review.

## Shared rules
- Never commit .env, passwords, API keys or private credentials.
- Do not rewrite shared database migrations that have already been applied.
- Coordinate schema changes through new Alembic migrations.
- Agree on API request/response contracts before integrating modules.
- Keep ML training and datasets owned by the ML lead.
- Clearly label simulated data and estimated impact values.
