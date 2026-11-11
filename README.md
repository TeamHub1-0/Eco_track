# EcoTrack 🌱

> A comprehensive web platform for tracking, visualizing, and reducing environmental impact.

---

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Environment Variables](#-environment-variables)
- [Git & Branching Workflow](#-git--branching-workflow)
- [Team Members](#-team-members)
- [License](#-license)

---

## 🧪 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18+, Next.js (App Router), Tailwind CSS, JavaScript (ES6+) |
| **Backend (Core)** | Node.js, Express.js |
| **Backend (Analytics/Scripts)** | Python 3.10+ |
| **Database** | PostgreSQL / MySQL |
| **Version Control** | Git & GitHub |

---

## 📁 Project Architecture

```text
eco-track/
├── docs/                 # API documentation & database schemas
├── frontend/             # Next.js web application
├── backend-node/         # Primary REST API (Express.js)
├── backend-python/       # Secondary microservices / Data processing
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following software installed locally:
- **Node.js**: `v18.x` or higher
- **Python**: `v3.10` or higher
- **PostgreSQL / MySQL**: Local instance or remote connection URI
- **Git**

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_ORGANIZATION_NAME/eco-track.git](https://github.com/YOUR_ORGANIZATION_NAME/eco-track.git)
cd eco-track
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Frontend will be running at `http://localhost:3000`

#### 3. Node.js Backend Setup
```bash
cd ../backend-node
npm install
npm run dev
```
> Express server will run at `http://localhost:5000`

#### 4. Python Service Setup
```bash
cd ../backend-python
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```

---

## 🔑 Environment Variables

Copy the `.env.example` files in each service directory to create local `.env` files:

### `backend-node/.env`
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=your_user
DB_PASS=your_password
DB_NAME=ecotrack_db
JWT_SECRET=your_jwt_secret_key
```

---

## 🌿 Git & Branching Workflow

We follow a simplified Feature Branch Workflow:

1. **`main`**: Production branch. Only stable code merged via Pull Requests.
2. **`dev`**: Integration branch for active development.
3. **Feature Branches**: Branch out from `dev` for new features or bug fixes.

```bash
# Branch naming convention
feature/login-auth
feature/user-dashboard
fix/navbar-responsive-bug

# Example workflow
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Commit and Push
git add .
git commit -m "feat: add user login component"
git push origin feature/your-feature-name
```

---

## 👥 Team Members

| Name | Role | GitHub |
| :--- | :--- | :--- |
| **Htet Aung Linn** | Auth & Security / full-stack | [@Ezio222222](https://github.com/Ezio222222) |
| **Thaw Sitt Han** | Reporting & AI / full-stack | [@username](https://github.com/username) |
| **Shan Shan** | Mapping & Ops / full-stack| [@pyaephyo-hein](https://github.com/pyaephyo-hein) |
| **Pyae Phyo Hein** | Engagement / full-stack | [@username](https://github.com/username) |

---

## 📄 License

This project is maintained by the organization development team.