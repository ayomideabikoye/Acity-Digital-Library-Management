# 📚 Digital Library Catalogue System – Backend API

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Deployment](https://img.shields.io/badge/Hosted_on-Render-success)
![Course](https://img.shields.io/badge/Course-CS3139_Web_Technologies-purple)

This repository contains the backend REST API for the Digital Library Catalogue System.  
It provides secure authentication, role-based access, book management, and borrowing functionality.

---

## 🧾 Project Overview

The backend is built using **Node.js, Express, and PostgreSQL**, exposing RESTful endpoints consumed by the frontend application.

### Core Responsibilities
- User authentication using JWT
- Role-based access control (Admin vs Student)
- Book management (Admin only)
- Borrowing and return management
- Data integrity using PostgreSQL transactions
- Secure password storage using bcrypt

---

## 🌐 Deployment Link

- **Backend API (Render):**  
  👉 `https://<your-backend-name>.onrender.com`

---

## 🔐 Login Details (For Grading)

### Admin Account
Name : Ayomide Abikoye
Password: a123456$#


---

## ✅ Feature Checklist (Backend)

### 🔑 Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Role-based route protection
- ✅ Secure password hashing with bcrypt

### 📖 Book Management
- ✅ Admin can add books
- ✅ Admin can delete books
- ✅ Prevent deletion of books with active borrows

### 🔄 Borrow & Return Management
- ✅ Borrow available books
- ✅ Prevent duplicate borrows
- ✅ Track due dates
- ✅ Return borrowed books

### 🔐 Security & Data Integrity
- ✅ JWT middleware
- ✅ Admin-only middleware
- ✅ PostgreSQL transactions (BEGIN / COMMIT / ROLLBACK)

---


---

## 🔒 Middleware & Security

### authenticateToken
- Verifies JWT from the Authorization header
- Attaches `user_id` and `role` to `req.user`
- Returns:
  - 401 Unauthorized (no token)
  - 403 Forbidden (invalid token)

### requireAdmin
- Restricts admin-only routes
- Returns 403 Forbidden if user role is not admin

---

## 🔁 Database Transactions

Borrow and return routes use:
- BEGIN
- COMMIT
- ROLLBACK

This ensures atomic updates across:
- `borrows` table
- `books.available_copies`

---

## 📡 API Routes Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Access |
|------|---------|-------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| PUT | `/auth/password` | Authenticated |

### Books (`/api/books`)
| Method | Endpoint | Access |
|------|---------|-------|
| GET | `/books` | Public |
| POST | `/books` | Admin |
| DELETE | `/books/:bookId` | Admin |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access |
|------|---------|-------|
| POST | `/borrow` | Authenticated |
| PUT | `/return/:borrowId` | Authenticated |
| GET | `/my-books` | Authenticated |

---



