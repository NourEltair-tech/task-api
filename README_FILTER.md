# Task API — completed query filter

## What changed

- `GET /api/tasks` returns all tasks owned by the logged-in user.
- `GET /api/tasks?completed=true` returns only that user's completed tasks.
- `GET /api/tasks?completed=false` returns only that user's incomplete tasks.
- `GET /api/tasks?completed=invalid` returns HTTP 400 and `{"errors":["completed must be true or false"]}`.
- Invalid query values such as `yes`, `1`, empty string, repeated parameters, or arrays are also rejected.
- OpenAPI is served at `/openapi.yaml` and Swagger UI at `/api-docs`.

## Local setup

1. `npm install` (this runs `prisma generate` automatically).
2. Set `DATABASE_URL` and `JWT_SECRET` in a local `.env` (never commit `.env`).
3. Run `npx prisma migrate deploy` if database migrations have not yet been applied.
4. `npm run dev` to listen on `PORT` (defaults to 3000).
5. `npm test` runs dependency-free layer tests of the filter behavior. For Postman and Swagger UI, first log in via `POST /api/auth/login` and add the resulting JWT to `Authorization: Bearer <token>`.

## Deployment notes

Commit the code on the GitHub branch configured for Render Auto-Deploy. Render build command should install dependencies and generate Prisma (e.g., `npm install`; postinstall does the generate). Start with `npm start`. Ensure `DATABASE_URL` and `JWT_SECRET` are set in Render environment. Do not change the existing production migrations unless you have reviewed the database's migration history.

## Exact smoke tests (Postman or Swagger UI)

Use a test account with at least one completed and one incomplete task:

- `GET /api/tasks` -> 200 with both statuses
- `GET /api/tasks?completed=true` -> 200, each returned task has `completed: true`
- `GET /api/tasks?completed=false` -> 200, each returned task has `completed: false`
- `GET /api/tasks?completed=invalid` -> 400
- `GET /api/tasks?completed=` -> 400
- Request without a bearer token -> 401

For submission, create `submission.txt` with only the actual verified deployed base URL, without a trailing `/`. This project package intentionally does not invent or supply a fake production URL.
