# FundsA – Mini ERP + CRM Operations Portal

FundsA is a full-stack ERP + CRM operations portal designed for a wholesale/distribution business.

The system provides internal teams with tools to manage customers, products, stock movements, sales challans, and role-based access.

## Live Application

- Frontend: https://fundsa-erp-crm-1.onrender.com
- Backend API: https://fundsa-erp-crm.onrender.com
- Database: PostgreSQL hosted on Supabase

---

## Features

### Authentication & Role-Based Access

- JWT-based authentication
- Protected routes
- Role-based authorization
- Supported roles:
  - Admin
  - Sales
  - Warehouse
  - Accounts

Users can only access operations permitted for their assigned role.

### Customer CRM

- Add customers
- Edit customer information
- Search customers
- View customer details
- Customer business information
- GST information
- Customer type
- Customer status
- Follow-up information
- CRM notes

### Product Management

- Add products
- Edit products
- View product information
- SKU/code management
- Category
- Unit price
- Current stock
- Minimum stock level
- Warehouse/location information

### Stock Management

The application maintains stock movement history.

Each movement records:

- Product
- Quantity changed
- Movement type (IN / OUT)
- Reason
- User who created the movement
- Timestamp

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

## Project Structure


fundsa-erp-crm/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
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
├── .gitignore
└── README.md

