# Assignment 8 — Task API: local setup and verification

This is the **development** project. The separate `Assignment8_SUBMISSION.zip` contains **only** `prisma/` and `src/` at its root, as required for the upload.

## Get the project running

1. Open the extracted `task-api` directory in VS Code.
2. Open a terminal in `task-api` and run `npm install`.
3. Run `cp .env.example .env` and edit `.env` with your real PostgreSQL `DATABASE_URL` and a long random `JWT_SECRET`. Do not submit `.env`.
4. Start PostgreSQL and ensure the database in your connection string exists.
5. Run `npx prisma migrate dev --name add_task_model` if creating a new migration locally. Since the supplied package already includes the `add_task_model` migration, **`npx prisma migrate dev`** will simply apply existing migrations. Avoid creating a duplicate migration.
6. Run `npx prisma generate`.
7. Run `npm run dev`. The server defaults to port 8080 when using `.env.example`.

The generated Prisma client is written to `src/generated/prisma`, inside the existing `src` structure. If you repackage your local submission, use only the `prisma` and `src` folders.

## Postman testing

- `POST http://localhost:8080/api/auth/signup` body `{"email":"alice@example.com","password":"password123"}`.
- `POST http://localhost:8080/api/auth/login` body `{"email":"alice@example.com","password":"password123"}`. Copy `accessToken` from the response.
- Send task requests with header `Authorization: Bearer <accessToken>` and `Content-Type: application/json`.
- `GET /api/tasks` -> 200, initially `[]` for a new account.
- `POST /api/tasks` body `{"title":"Finish Module 8"}` -> 201, `completed` defaults to false.
- `GET /api/tasks/1` -> 200 if task 1 belongs to the user.
- `PUT /api/tasks/1` body `{"completed":true}` -> 200.
- `DELETE /api/tasks/1` -> 204 and empty response.
- Repeat with a second user: their task list must not include the first user's tasks; access to another user's task ID must give 403.
- A nonexistent task ID must return 404 and a nonnumeric ID must return 400.
- Missing, malformed, invalid, or expired Authorization tokens must return 401.
- An ordinary user's `/api/admin/tasks` request must return 403.
- To test admin routes, change a test user's database role to `ADMIN` using Prisma Studio (`npx prisma studio`) and **log in again** so the new JWT contains the ADMIN role; then test GET, PUT, DELETE on `/api/admin/tasks`.

## Important starter mismatch

The starter's existing `User.id` field is `Int` (and the initial migration defines `users.id` as `SERIAL`). Although the assignment text describes `Task.userId` as `String`, Prisma requires both sides of the relation to have the same type. Therefore `Task.userId` is `Int` in this implementation, consistent with the supplied starter and existing database migration.

## Verification performed

- Syntax: Node `--check` on each JavaScript source file.
- 22 isolated Node layer checks passed against mocked Prisma/JWT dependencies.
- PostgreSQL-backed migrations, Prisma client generation, Postman endpoint tests and your instructor's autograder have **not** been run in this environment. Run the commands above locally before submission.
