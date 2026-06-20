# Running with Docker

1. Copy the env file:
   ```bash
   cp .env.example .env
   ```
2. Fill in the real values in `.env`.
3. Start everything:
   ```bash
   docker compose up --build
   ```

## URLs

- Backend API: http://localhost:10001
- Admin frontend: http://localhost:3000
- Customer frontend: http://localhost:3001
- Provider frontend: http://localhost:3002

## Other commands

```bash
docker compose up -d        # run in background
docker compose down         # stop everything
docker compose logs -f      # view logs
```
