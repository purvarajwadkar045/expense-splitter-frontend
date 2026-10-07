# 💰 Expense Splitter

A modern expense-sharing application inspired by Splitwise that helps users manage group expenses, track balances, split bills fairly, and settle debts efficiently.

This project demonstrates frontend architecture, state management, business logic implementation, and user experience design using React and Vite.

---

## 🚀 Features

### 👤 Authentication & User Management

* User Registration UI
* User Login UI
* Protected Routes
* Profile Management
* Authentication Context

### 👥 Group Management

* Create Groups
* View Group Details
* Add Members
* Manage Shared Expenses

### 💸 Expense Management

* Add Expenses
* Select Payer
* Select Participants
* Expense Categories
* Expense History

### 🔀 Expense Splitting

* Equal Split
* Custom Split
* Automatic Share Calculation

### 📊 Balance Tracking

* Calculate Who Owes Whom
* Group-wise Balance Summary
* Total Amount Owed
* Total Amount Receivable

### 💳 Settlements

* Record Settlements
* Track Payment History
* Update Outstanding Balances

### 📈 Dashboard

* Balance Overview
* Weekly Spending Analytics
* Recent Activity Feed
* Quick Actions Panel

### 🔔 Notifications

* Notification Interface
* Activity Tracking

---

## 🛠 Tech Stack

### Frontend

* React.js
* Vite
* React Router DOM
* React Hook Form
* Yup Validation
* Framer Motion
* Recharts
* React Icons
* Lucide React

### Styling

* CSS3
* Custom Design System
* Responsive Layouts
* Glassmorphism UI

### Backend

* FastAPI
* PostgreSQL
* SQLAlchemy
* JWT Authentication

---


## Setup and Run

This workspace contains both `backend/` (FastAPI) and `frontend/` (React/Vite). It requires Python 3.10+, Node.js 20.19+ or 22.12+, and a running PostgreSQL server. Docker is not required. On startup, the backend creates missing tables and applies its supported additive schema upgrades; the SQL scripts under `backend/migrations/` document those changes.

Create an empty PostgreSQL database:

```powershell
createdb -U postgres expense_splitter
```

If `createdb` is not on `PATH` on Windows, use the PostgreSQL installation path (adjust the version if needed):

```powershell
& "$env:ProgramFiles\PostgreSQL\18\bin\createdb.exe" -U postgres expense_splitter
```

Install the backend and configure its environment:

```powershell
cd backend
py -3 -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL`, a unique random `SECRET_KEY`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `EMAIL`, and `EMAIL_PASSWORD`. SMTP credentials must be valid for registration verification and password-reset email. Never commit `.env` or use the example values as production credentials.

Start the backend from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, install and start the frontend:

```powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1
```

The frontend defaults to `http://localhost:8000`; set `VITE_API_BASE_URL` in `frontend/.env` if the backend uses another address. Open the Vite URL printed by the dev server.

Run backend tests from the workspace root after setting the required backend environment variables:

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest discover -s . -p "test_*.py"
```

Build the frontend from `frontend/`:

```powershell
npm run build
```

---

## 📸 Screenshots

### Landing Page

(Add Screenshot)

### Dashboard

(Add Screenshot)

### Groups Page

(Add Screenshot)

### Expense Management

(Add Screenshot)

---

## 🔮 Future Improvements

* FastAPI Backend Integration
* PostgreSQL Database
* JWT Authentication
* Real-time Notifications
* Email Verification
* Expense Export Reports
* Mobile App Version
* Advanced Debt Simplification

---

## 🎯 Learning Outcomes

This project helped strengthen skills in:

* React Component Architecture
* State Management
* Form Handling & Validation
* Business Logic Design
* Expense Calculation Algorithms
* Responsive UI Design
* Reusable Component Development
* Frontend Project Structure

---

## 👩‍💻 Author

Purva Rajwadkar

GitHub:
https://github.com/purvarajwadkar045

LinkedIn:
https://www.linkedin.com/in/purva-rajwadkar
