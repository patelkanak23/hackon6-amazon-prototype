# HackOn 6.0 Amazon Prototype

A scalable AWS-first hackathon prototype built for Amazon HackOn 6.0.

This repository is our prepared base stack for the 48-hour virtual hackathon. It currently includes a polished Next.js frontend, a deployed AWS Lambda backend, API Gateway routing, DynamoDB persistence, and readiness for Amazon Bedrock AI integration.

---

## Current Live Backend

API Base URL:

```txt
https://np1mz79jr2.execute-api.ap-south-1.amazonaws.com
```

Available endpoints:

```txt
GET  /health
POST /items
GET  /items
```

---

## Tech Stack

### Frontend

```txt
Next.js
TypeScript
Tailwind CSS
App Router
Responsive Amazon-like light UI
```

### Backend

```txt
AWS Lambda
Amazon API Gateway HTTP API
Serverless Framework v3
Node.js 20.x
```

### Database

```txt
Amazon DynamoDB
Table: hackon6-items-dev
Partition Key: id
Billing Mode: On-demand
```

### AI / GenAI Ready

```txt
Amazon Bedrock
Amazon Nova Micro
Amazon Nova Pro
Titan Text
Titan Embeddings
```

AI is not hardcoded yet. It will be added only if it clearly improves the final solution after the problem statement is released.

---

## Repository Structure

```txt
hackon6-amazon-prototype/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── .env.example
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── src/
│   │   └── handler.js
│   ├── .env.example
│   ├── serverless.yml
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Frontend Environment Variables

File:

```txt
frontend/.env.local
```

Content:

```env
NEXT_PUBLIC_API_BASE_URL=https://np1mz79jr2.execute-api.ap-south-1.amazonaws.com
```

Example file:

```txt
frontend/.env.example
```

Content:

```env
NEXT_PUBLIC_API_BASE_URL=https://np1mz79jr2.execute-api.ap-south-1.amazonaws.com
```

---

## Backend Environment Variables

Backend Lambda environment variables are currently configured inside `backend/serverless.yml`.

Reference file:

```txt
backend/.env.example
```

Content:

```env
AWS_REGION=ap-south-1
STAGE=dev
ITEMS_TABLE=hackon6-items-dev
```

Do not put AWS access keys or secret keys inside project files.

Never commit:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

AWS credentials should remain in local AWS CLI configuration.

---

## Local Development

### 1. Clone repository

```bash
git clone https://github.com/nilaysrivastava/hackon6-amazon-prototype.git
cd hackon6-amazon-prototype
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Start frontend

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:3000
```

### 4. Install backend dependencies

```bash
cd ../backend
npm install
```

### 5. Run backend locally

```bash
npx serverless offline
```

Local backend runs at:

```txt
http://localhost:3000
```

Local endpoints:

```txt
GET  http://localhost:3000/health
POST http://localhost:3000/items
GET  http://localhost:3000/items
```

---

## API Testing

### Health Check

```bash
curl https://np1mz79jr2.execute-api.ap-south-1.amazonaws.com/health
```

Expected response:

```json
{
  "success": true,
  "message": "HackOn 6.0 backend is healthy",
  "service": "hackon6-api",
  "timestamp": "..."
}
```

### Create Item

```bash
curl -X POST https://np1mz79jr2.execute-api.ap-south-1.amazonaws.com/items   -H "Content-Type: application/json"   -d '{
    "title": "Live DynamoDB Test",
    "description": "This item was created through deployed API Gateway and Lambda.",
    "status": "active"
  }'
```

### List Items

```bash
curl https://np1mz79jr2.execute-api.ap-south-1.amazonaws.com/items
```

---

## Deployment

### Deploy Backend

```bash
cd backend
npx serverless deploy
```

Expected deployed resources:

```txt
AWS Lambda functions
API Gateway HTTP API
IAM role permissions
CloudWatch logs
```

### Remove Backend Stack

Only use this if you intentionally want to delete deployed resources:

```bash
cd backend
npx serverless remove
```

---

## Current Backend Functions

### health

Purpose:

```txt
Confirms that the backend is reachable and healthy.
```

Route:

```txt
GET /health
```

### createItem

Purpose:

```txt
Creates a new item and stores it in DynamoDB.
```

Route:

```txt
POST /items
```

Expected body:

```json
{
  "title": "string",
  "description": "string",
  "status": "active"
}
```

### listItems

Purpose:

```txt
Reads all items from DynamoDB and returns them sorted by latest creation time.
```

Route:

```txt
GET /items
```

---

## AWS Architecture

```txt
User Browser
    ↓
Next.js Frontend
    ↓
Amazon API Gateway HTTP API
    ↓
AWS Lambda Functions
    ↓
Amazon DynamoDB
```

Optional AI extension:

```txt
AWS Lambda
    ↓
Amazon Bedrock
    ↓
Nova / Titan model response
```

Optional file extension:

```txt
Frontend
    ↓
Presigned Upload URL
    ↓
Amazon S3
    ↓
Lambda / Bedrock document processing
```

---

## Security Notes

Current hackathon prototype security:

```txt
No hardcoded AWS credentials
IAM user used for local deployment
Lambda has DynamoDB permissions through IAM role
Frontend only stores public API Gateway base URL
DynamoDB table uses on-demand billing
```

To improve later:

```txt
Add Amazon Cognito for authentication
Restrict CORS allowed origins
Add request validation
Add API throttling
Add structured logging
Add CloudWatch alarms
Use least-privilege IAM policies
```

---

## Working Backwards Template

When the problem statement arrives, fill this:

```txt
Today, we are launching [Solution Name], a [one-line product category] that helps [target user] solve [pain point].

Unlike existing approaches, [Solution Name] combines [core capability 1], [core capability 2], and [core capability 3] to deliver a faster, simpler, and more reliable experience.

With [Solution Name], users can [measurable outcome], while organizations gain [business/customer impact] at cloud scale.
```

---

## Problem Analysis Template

```txt
1. Who is the customer?
2. What is the core customer pain?
3. What is the current broken/inefficient workflow?
4. Why does this problem matter at Amazon scale?
5. What is the smallest working demo that proves value?
6. What features should we avoid because they waste time?
7. What is the strongest judge-facing wow factor?
8. What data should be stored?
9. What APIs are needed?
10. Does AI genuinely improve the workflow?
```

---

## Feature Roadmap Template

### Must-Haves

```txt
1. Core user workflow
2. Create/read/update required data
3. Clean dashboard or main UI
4. Deployed backend APIs
5. Persistent database
6. Clear demo path
7. README and architecture explanation
```

### Delight Features

```txt
1. Bedrock-powered assistant/recommendation/summarization
2. Analytics dashboard
3. Smart prioritization/scoring
4. Search/filtering
5. Export/report generation
6. Role-based experience
7. Clean architecture diagram
```

### Avoid

```txt
1. Building too many screens
2. Adding AI without clear value
3. Overengineering authentication too early
4. Complex microservices
5. Spending too long on animations
6. Features that cannot be demoed reliably
```

---

## 48-Hour Execution Plan

### Milestone 1: Setup and Scope

Target duration:

```txt
0-4 hours
```

Tasks:

```txt
Read problem statement deeply
Identify user persona
Decide MVP
Write Working Backwards summary
Finalize tech stack
Create issue/task board
Assign roles
Update README with final problem context
```

Output:

```txt
Locked scope
Clear architecture
Task ownership
Demo workflow defined
```

---

### Milestone 2: Core Backend and Database

Target duration:

```txt
4-16 hours
```

Tasks:

```txt
Finalize DynamoDB schema
Update backend routes
Add validation
Add core business logic
Deploy Lambda APIs
Test all endpoints with curl/Thunder Client
Add sample data
```

Output:

```txt
Working backend
Persistent storage
Stable API contract
```

---

### Milestone 3: AI / Intelligence Layer

Target duration:

```txt
16-28 hours
```

Tasks:

```txt
Decide whether AI is needed
Add Bedrock client if useful
Create prompt templates
Add AI endpoint
Store AI outputs in DynamoDB if needed
Add fallback logic
Test latency and errors
```

Output:

```txt
One meaningful AI-powered feature
Not a gimmick
Clearly useful in demo
```

---

### Milestone 4: Frontend UI, Deployment, and Pitch

Target duration:

```txt
28-48 hours
```

Tasks:

```txt
Build final user journey
Connect UI to APIs
Add loading and error states
Make design responsive
Deploy frontend
Prepare demo script
Prepare architecture diagram
Prepare final pitch
Record fallback demo video
Final testing
```

Output:

```txt
Deployed product
Working demo
Strong pitch
Submission-ready repository
```

---

## Amazon Leadership Principles Alignment

### Customer Obsession

```txt
We start from the user pain point and build the smallest useful workflow that solves it clearly.
```

### Ownership

```txt
The prototype is deployed, documented, testable, and built with real cloud components rather than only mock data.
```

### Invent and Simplify

```txt
We use a simple serverless architecture and avoid unnecessary complexity.
```

### Bias for Action

```txt
The project prioritizes a working end-to-end demo early, then improves quality and intelligence.
```

### Are Right, A Lot

```txt
Architecture and feature choices are based on problem fit, not hype.
```

### Deliver Results

```txt
The final goal is a reliable demo that judges can understand, evaluate, and remember.
```

---

## Demo Script Template

```txt
1. Start with the customer problem.
2. Show the current pain or inefficiency.
3. Introduce the solution in one sentence.
4. Demonstrate the main workflow.
5. Show live data persistence.
6. Show the intelligence/AI layer if included.
7. Explain AWS architecture.
8. Explain scalability and security.
9. End with business/customer impact.
```

---

## Final Submission Checklist

```txt
[ ] Problem statement understood
[ ] Working Backwards summary written
[ ] Architecture diagram ready
[ ] Backend deployed
[ ] Frontend deployed
[ ] DynamoDB working
[ ] AI feature tested, if included
[ ] README updated
[ ] Demo script ready
[ ] Pitch deck ready
[ ] GitHub repo clean
[ ] .env.local not committed
[ ] App tested on mobile
[ ] App tested in incognito
[ ] Backup demo video recorded
[ ] Team knows who presents what
```

---

## Current Status

```txt
Step 1: AWS account and billing safety completed
Step 2: AWS CLI configured
Step 3: Local tools installed
Step 4: GitHub repo created
Step 5: Next.js frontend created
Step 6: Amazon-style UI base added
Step 7: Serverless backend created
Step 8: Backend deployed to AWS
Step 9: DynamoDB APIs added and deployed
Step 10: Frontend connected to live backend
Step 11: Bedrock readiness confirmed
Step 12: README and execution checklist prepared
```

---

## Notes for Tomorrow

When the HackOn problem statement is released, do not start coding immediately.

First decide:

```txt
1. What exact user journey will we demo?
2. What data model do we need?
3. Which existing /items route should be replaced or extended?
4. What are the 3-5 must-have screens?
5. Is Bedrock useful or unnecessary?
6. What is the judge-facing wow moment?
```

Then update:

```txt
frontend/src/app/page.tsx
frontend/src/lib/api.ts
backend/src/handler.js
backend/serverless.yml
README.md
```

The current project is intentionally simple so we can pivot fast.
