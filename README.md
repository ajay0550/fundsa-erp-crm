# FundsA – Mini ERP + CRM Operations Portal

FundsA is a full-stack ERP + CRM operations portal designed for a wholesale/distribution business.

The system provides internal teams with tools to manage customers, products, stock movements, sales challans, dashboard information, and role-based access.

## Live Application

- Frontend: https://fundsa-erp-crm-1.onrender.com
- Backend API: https://fundsa-erp-crm.onrender.com
- Database: PostgreSQL hosted on Supabase

---

## Features

### Authentication & Role-Based Access

- JWT-based authentication
- Protected backend routes
- Role-based authorization
- Supported roles:
  - Admin
  - Sales
  - Warehouse
  - Accounts

### Customer CRM

- Add customers
- Edit customer information
- Delete customers
- Search customers
- View customer details
- Customer business information
- GST information
- Customer type
- Customer status
- Follow-up date
- CRM notes
- Add and view follow-up records

### Product Management

- Add products
- Edit products
- View product information
- SKU/code management
- Category
- Unit price
- Current stock
- Minimum stock quantity
- Warehouse/location information
- Search products
- Low-stock filtering

### Stock Management

The application maintains a stock movement history.

Each movement records:

- Product
- Quantity changed
- Movement type (`IN` / `OUT`)
- Reason
- User who created the movement
- Timestamp

Stock movements update the product's current stock and prevent stock from becoming negative.

### Sales Challans

Users with appropriate permissions can:

- Create challans
- Select customers
- Add multiple products
- Specify quantities
- Automatically generate challan numbers
- Save challans as Draft
- Confirm challans
- View challan details

When a challan is confirmed:

- Product stock is reduced automatically.
- Stock cannot become negative.
- The API returns an error if available stock is insufficient.
- Product information is stored as a snapshot in the challan.
- A stock `OUT` movement is recorded.

### Dashboard

The dashboard provides:

- Total customers
- Total products
- Low-stock product count
- Pending draft challans
- Recent challans

---

## Tech Stack

### Frontend

- React
- JavaScript
- HTML
- CSS
- React Router

### Backend

- Node.js
- Express.js
- JavaScript
- REST APIs
- JWT Authentication
- PostgreSQL driver (`pg`)
- bcrypt for password hashing

### Database

- PostgreSQL
- Supabase

### Deployment

- Render Static Site – Frontend
- Render Web Service – Backend
- Supabase – PostgreSQL Database

### Version Control

- Git
- GitHub

---

## Architecture

```text
                    User
                     |
                     v
             React Frontend
                     |
                  HTTPS
                     |
                     v
             Express Backend
                     |
          +----------+----------+
          |                     |
          v                     v
     JWT Authentication    REST APIs
                                |
                                v
                         PostgreSQL
                           Supabase
```

### Frontend

The React frontend provides the user interface and communicates with the backend using REST APIs.

### Backend

The Express backend handles:

- Authentication
- Authorization
- Request validation
- Business logic
- Customer operations
- Product operations
- Stock operations
- Challan operations
- Dashboard data

### Database

PostgreSQL stores persistent business data.

The backend connects to the Supabase PostgreSQL database using environment variables.

---

## Project Structure

```text
fundsa-erp-crm/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── schema.sql
│   ├── seedUsers.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── postman/
│   └── FundsA.postman_collection.json
│
├── .gitignore
└── README.md
```

---

## Database Design

The main PostgreSQL tables are:

```text
users
customers
follow_ups
products
stock_movements
challans
challan_items
```

### Relationships

```text
users
  |
  +--------------------+
  |                    |
  v                    v
follow_ups          challans
  |                    |
  v                    v
customers         challan_items
                       |
                       v
                    products
                       |
                       v
                stock_movements
```

### Challan Product Snapshots

`challan_items` stores:

- Product ID
- Product name snapshot
- SKU snapshot
- Unit price snapshot
- Quantity

This preserves the product information that existed when the challan was created, even if the product details are changed later.

---

## Authentication

The application uses JWT-based authentication.

### Login

```http
POST /api/auth/login
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

After successful authentication, the backend returns a JWT token along with basic user information.

Protected requests use:

```http
Authorization: Bearer <token>
```

JWT payload contains the authenticated user's:

- ID
- Role
- Email

Tokens expire after one day.

Passwords are stored using bcrypt password hashing.

---

## API Overview

The deployed backend base URL is:

```text
https://fundsa-erp-crm.onrender.com/api
```

### Health

```http
GET /
GET /api/test-db
```

### Authentication

```http
POST /api/auth/login
```

### Dashboard

```http
GET /api/dashboard/summary
```

### Customers

```http
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

POST   /api/customers/:id/follow-ups
GET    /api/customers/:id/follow-ups
```

Customer search is supported using:

```http
GET /api/customers?search=searchTerm
```

### Products

```http
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id

GET    /api/products/movements
POST   /api/products/movements
```

Product search and low-stock filtering are supported using query parameters:

```http
GET /api/products?search=searchTerm
GET /api/products?lowStock=true
```

### Challans

```http
GET /api/challans
POST /api/challans
GET /api/challans/:id
PUT /api/challans/:id/confirm
```

---

## Important Business Rules

### Stock Movement

For stock movement:

- Movement type must be `IN` or `OUT`.
- Quantity must be greater than zero.
- Stock cannot become negative.
- The product stock is updated inside a database transaction.
- The stock movement is recorded with the authenticated user.

### Challan Creation

When creating a challan:

- A valid customer is required.
- At least one product is required.
- Product IDs must exist.
- Product quantities must be greater than zero.
- A challan number is generated automatically.
- Challan items store product snapshot information.
- Newly created challans start in `DRAFT` status.

### Challan Confirmation

When confirming a challan:

1. The challan is locked using a database transaction.
2. Only a Draft challan can be confirmed.
3. The challan must contain items.
4. Each product is locked while stock is checked.
5. Insufficient stock causes the transaction to roll back.
6. Product stock is reduced.
7. An `OUT` stock movement is recorded.
8. The challan status changes to `CONFIRMED`.

This prevents a confirmed challan from reducing stock below zero.

---

## Role Permissions

| Operation | Admin | Sales | Warehouse | Accounts |
|---|:---:|:---:|:---:|:---:|
| Login | ✓ | ✓ | ✓ | ✓ |
| View Customers | ✓ | ✓ | ✓ | ✓ |
| Create/Edit/Delete Customers | ✓ | ✓ | ✓ | ✓ |
| Follow-ups | ✓ | ✓ | ✓ | ✓ |
| View Products | ✓ | ✓ | ✓ | ✓ |
| Create/Edit Products | ✓ | — | ✓ | — |
| View Stock Movements | ✓ | ✓ | ✓ | ✓ |
| Create Stock Movement | ✓ | — | ✓ | — |
| Create Challan | ✓ | ✓ | — | — |
| View Challans | ✓ | ✓ | ✓ | ✓ |
| Confirm Challan | ✓ | — | ✓ | — |

Backend authorization is enforced through JWT authentication and role-based middleware on restricted operations.

---

## Error Handling

The backend returns appropriate HTTP status codes and JSON error responses.

Common responses include:

```text
400 – Invalid request / validation error
401 – Authentication required or invalid credentials
403 – Insufficient permissions / invalid token
404 – Resource not found
409 – Conflict, such as duplicate SKU
500 – Internal server error
```

Business validation is also performed for operations such as stock deduction and challan confirmation.

---

## Environment Variables

Environment variables are used to keep configuration and sensitive credentials outside the source code.

### Backend

Create a `.env` file inside the `backend` directory:

```env
DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret

PORT=5000
```

Production environment variables are configured through the Render dashboard.

Database credentials and JWT secrets are not committed to the repository.

> Never commit `.env` files or database passwords to GitHub.

### Frontend

The frontend uses the deployed backend API URL in its API service configuration.

The frontend does not contain database credentials or JWT secrets.

---

## Running Locally

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ajay0550/fundsa-erp-crm.git
cd fundsa-erp-crm
```

### 2. Set up the database

Create a PostgreSQL database and execute:

```text
backend/schema.sql
```

Configure the database connection values in:

```text
backend/.env
```

### 3. Start the backend

```bash
cd backend
npm install
node server.js
```

The backend will run on the configured `PORT`, or port `5000` by default.

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The React development server will provide the local frontend URL.

---

## Deployment

### Backend – Render

The backend is deployed as a Render Web Service.

Configuration:

```text
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

Production environment variables are configured through Render.

### Frontend – Render

The frontend is deployed as a Render Static Site.

Configuration:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

The frontend communicates with the deployed backend over HTTPS.

### Database – Supabase

The PostgreSQL database is hosted on Supabase.

The backend connects using the PostgreSQL connection details stored in environment variables.

---

## Postman Collection

A Postman collection is included in the repository:

```text
postman/FundsA.postman_collection.json
```

The collection contains requests for:

- Authentication
- Dashboard
- Customers
- Customer follow-ups
- Products
- Stock movements
- Challans
- Backend health
- Database connection testing

The collection uses environment/collection variables for the deployed API URL and authentication token.

---

## Business Flow

The main sales workflow is:

```text
Login
  |
  v
Select Customer
  |
  v
Create Challan
  |
  v
Add Products & Quantities
  |
  v
Save as Draft
  |
  v
Confirm Challan
  |
  v
Validate Stock
  |
  +---- Insufficient Stock --> Return Error
  |
  v
Reduce Product Stock
  |
  v
Record Stock Movement
```

This demonstrates the relationship between CRM, product management, sales operations, and inventory.

---

## Test Credentials

The following demo accounts are available for testing role-based access:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundsa.com | Admin@123 |
| Sales | sales@fundsa.com | Sales@123 |
| Warehouse | warehouse@fundsa.com | Warehouse@123 |
| Accounts | accounts@fundsa.com | Accounts@123 |

> These credentials are demo/test accounts created specifically for evaluation of the application.

## Security

The application uses:

- JWT authentication
- Role-based authorization
- Protected backend routes
- bcrypt password hashing
- Parameterized SQL queries
- Database transactions for critical stock operations
- Environment variables for secrets
- `.env` excluded from source control

---

## Known Limitations

Due to the 48-hour development timeline, a few requested features could not be completed:

- Challan cancellation workflow is not implemented. The current workflow supports Draft and Confirmed states.
- API pagination is not currently implemented.
- The backend is implemented using JavaScript with Express.js rather than TypeScript.

These features can be added in a future iteration without changing the overall architecture.

---

## Future Improvements

Potential future improvements include:

- Challan cancellation and stock reversal
- API pagination
- Advanced search and filtering
- Invoice generation
- PDF export
- Dashboard analytics
- Automated testing
- Docker support
- CI/CD pipeline
- Product image uploads

---

## Demo

A screen recording demonstrates the main application workflow, including:

- Login
- Dashboard
- Customer management
- Product management
- Stock history
- Challan creation
- Challan confirmation
- Automatic stock deduction
- Role-based access

---

## Author

**Ajay G**

GitHub:

https://github.com/ajay0550/fundsa-erp-crm
