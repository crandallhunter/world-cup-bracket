<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Role

You are an AI software engineer building this application.
All decisions must ensure the application can run on AWS without needing major changes later.
Follow these rules strictly.

## Core Rule
Only use tools and technologies that work well within AWS.
Do not introduce tools that depend on external platforms unless explicitly told to do so.

## 1. Database
Use a relational database.

### Allowed:

Primary database:

* PostgreSQL

AWS production target:

* Amazon RDS PostgreSQL
* or Aurora PostgreSQL

Development option:

* Supabase (PostgreSQL)

### Supabase Rules (Strict)

If you use Supabase:

* use it for database only
* do NOT use Supabase Auth
* do NOT use Supabase storage
* do NOT use Supabase functions or other services

You must:

* use **Drizzle ORM (drizzle-kit)** for all database access
* manage schema using migrations
* keep schema clean and structured

Goal:

* seamless migration from Supabase to AWS RDS PostgreSQL

---

### Not allowed:

* MongoDB
* DynamoDB
* Firebase
* Supabase as a full backend platform
* Any NoSQL database as the main database

---

### Requirements:

* Use structured tables
* Use primary keys and foreign keys
* Use migrations
* Add indexes where needed

---

## 2. Frontend

Use:

* Next.js

The frontend must:

* call backend APIs or Next.js backend functions
* handle UI only
* not contain secrets
* not contain core business logic

Make sure it can run on:

* AWS Amplify
* or S3 with CloudFront

Do not rely on platform specific features outside AWS.

---

## 3. Backend

You must design the backend to be AWS compatible.

### Allowed backend options:

Option A:
* Next.js backend using API routes or server actions

Option B:
* Node.js with Express or NestJS

Option C:
* Laravel

Option D:
* Python using Flask or FastAPI

All options must be deployable on:
* AWS Lambda
* or EC2 or ECS

The backend must:
* expose REST APIs (even if using Next.js backend)
* contain business logic
* be deployable in AWS without changes

---

## 4. API

Use REST.

Use standard HTTP methods and proper status codes.

Do not use:

* GraphQL
* gRPC

---

## 5. File Storage
Use S3 compatible storage.
Store files in storage and store file references in the database.
Do not store large files in the database.

---

## 6. Authentication

Allowed:

* Custom auth using JWT or sessions
* AWS Cognito if needed or specified

Not allowed:

* Supabase Auth
* Firebase Auth
* Auth0
* Clerk

---

## 7. Background Tasks

Design async work using:

* Lambda async execution
* simple queue patterns

Avoid complex systems like Kafka or RabbitMQ.

---

## 8. Caching

Allowed:

* CDN caching
* simple app level caching

Optional:

* Redis only if needed

Do not use caching as the main data source.

---

## 9. Architecture

Build a modular monolith.

Keep:

* one application codebase
* one database

Do not:

* create microservices
* split into many services

---

## 10. Dependencies

Only add a dependency if:

* it is necessary
* it works well in AWS
* it does not add complexity

If unsure:

* choose the simpler option

---

## 11. Before Coding

Before writing code, state:

* which backend option is used:

    * Next.js backend
    * Node backend
    * Laravel backend
    * Python backend (Flask or FastAPI)
* database choice:

    * PostgreSQL
    * or Supabase (PostgreSQL dev)
* API type
* confirmation everything is AWS compatible

Example:

This feature will use Next.js API routes, Supabase PostgreSQL for development, and REST APIs. It will remain compatible with AWS RDS PostgreSQL in production.

---

## 12. Never Do This

Do not:

* use Supabase as a full backend platform
* use Supabase Auth
* use Firebase
* use MongoDB
* use DynamoDB
* use GraphQL
* create microservices
* store secrets in code

---

## 13. If There Is a Conflict

If a feature seems to require tools outside these rules:

* stop
* explain the issue
* suggest an AWS compatible solution
* wait for instruction

---

## 14. Priority

Always prioritize:

1. AWS compatibility
2. PostgreSQL relational design
3. simplicity
4. maintainability

---

## 15. Short Version

Use AWS compatible tools only. Use Next.js for frontend and optionally backend. Backend can also use Node, Laravel, or Python. Use PostgreSQL for both development and production. Supabase is allowed for database only. Do not use Supabase Auth or other Supabase services. Keep everything deployable on AWS.
