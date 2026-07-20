# 🚀 Job Board Platform — Backend API

A complete, production-ready **Job Board Platform Backend** built with **Python, Django, and Django REST Framework**. Handles employers, candidates, job listings, resumes, applications, notifications, and comprehensive reporting.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Example API Requests](#-example-api-requests)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)

---

## ✨ Features

### Authentication & Authorization
- JWT-based authentication (Access + Refresh tokens)
- Role-based access control (Employer / Candidate)
- Registration, Login, Logout, Token Refresh
- Profile management & password change

### Employers
- Company profile creation and management
- Dashboard with job and application statistics
- Create, update, delete job listings
- View and manage applications received
- Update application statuses

### Candidates
- Professional profile with skills, experience, education
- Upload, replace, delete resumes (PDF only, max 5MB)
- Apply for jobs with cover letters
- Track application status
- Withdraw applications

### Jobs
- Advanced search and filtering (title, skill, company, category, salary, experience, location, remote)
- Multiple sorting options (latest, salary high/low, deadline)
- Pagination support
- Job categories
- Application deadline enforcement

### Applications
- Apply with resume and cover letter
- Duplicate application prevention
- Status tracking (Applied → Under Review → Shortlisted → Interview → Selected / Rejected)
- Deadline and status validation

### Notifications
- Real-time in-app notifications
- Auto-generated on application and status change
- Mark as read, mark all read, delete

### Reporting Dashboard
- Total users, employers, candidates, jobs
- Open/closed job counts
- Application statistics by status
- Top companies by hiring
- Monthly posting and application trends

### Security
- Password hashing (Django default)
- JWT token authentication with blacklisting
- Role-based permissions
- CSRF protection
- Input validation and sanitization
- Secure file uploads with type and size validation
- Environment variable configuration

---

## 🛠 Technology Stack

| Technology | Purpose |
|---|---|
| Python 3.x | Programming language |
| Django 4.2+ | Web framework |
| Django REST Framework | REST API framework |
| SimpleJWT | JWT authentication |
| django-filter | Advanced filtering |
| django-cors-headers | CORS support |
| drf-yasg | Swagger/OpenAPI documentation |
| Pillow | Image processing |
| PostgreSQL / SQLite | Database |
| python-decouple | Environment variable management |

---

## 🗄 Database Schema

### Entity Relationships
User (Custom Auth)
├── Role: Employer / Candidate
├── Email (unique), Full Name, Phone, Profile Picture, Location
│
├── Employer Profile (1:1)
│ └── Company Name, Logo, Description, Website, Industry, Size
│ │
│ └── Jobs (1:N)
│ ├── Title, Description, Requirements, Responsibilities
│ ├── Salary Range, Experience, Employment Type
│ ├── Location, Remote Option, Deadline, Status
│ │
│ └── Applications (1:N) ←── Candidate
│ ├── Resume, Cover Letter
│ └── Status (Applied/Review/Shortlisted/Interview/Selected/Rejected)
│
└── Candidate Profile (1:1)
├── Title, Experience, Education, Skills
├── Portfolio, LinkedIn, GitHub
│
├── Resumes (1:N) [PDF, max 5MB]
│
└── Applications (1:N) ──→ Job
Notifications
├── Employer / Candidate (recipient)
├── Title, Message, Is Read
└── Created At


### Tables
| Model | Key Fields |
|---|---|
| **User** | id, email, full_name, password, phone, role, location |
| **Employer** | id, owner(FK), company_name, logo, description, industry, size |
| **Candidate** | id, user(FK), title, experience, education, skills |
| **JobCategory** | id, category_name |
| **Job** | id, employer(FK), category(FK), title, salary, status, deadline |
| **Resume** | id, candidate(FK), resume_file(PDF), title |
| **JobApplication** | id, candidate(FK), job(FK), resume(FK), status |
| **Notification** | id, employer(FK), candidate(FK), title, message, is_read |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, get JWT tokens |
| POST | `/api/auth/logout/` | Logout, blacklist refresh token |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/` | Update user profile |
| POST | `/api/auth/change-password/` | Change password |

### Employers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/employers/` | Create employer profile |
| GET/PUT | `/api/employers/profile/` | View/update employer profile |
| GET | `/api/employers/dashboard/` | Employer dashboard stats |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/candidates/` | Create candidate profile |
| GET/PUT | `/api/candidates/profile/` | View/update candidate profile |
| GET | `/api/candidates/dashboard/` | Candidate dashboard stats |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/` | Create job (employer) |
| GET | `/api/jobs/list/` | List all jobs (with filters) |
| GET | `/api/jobs/my-jobs/` | Employer's jobs |
| GET | `/api/jobs/open/` | Open jobs only |
| GET | `/api/jobs/closed/` | Closed jobs only |
| GET/PUT/DEL | `/api/jobs/<id>/` | Job CRUD |
| GET | `/api/jobs/categories/` | List categories |
| POST | `/api/jobs/categories/create/` | Create category |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications/apply/` | Apply for a job |
| GET | `/api/applications/my-applications/` | Candidate's applications |
| GET | `/api/applications/employer-applications/` | Employer's received apps |
| DELETE | `/api/applications/<id>/withdraw/` | Withdraw application |
| PATCH | `/api/applications/<id>/status/` | Update application status |

### Resumes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resumes/` | List my resumes |
| POST | `/api/resumes/upload/` | Upload resume |
| GET/PUT/DEL | `/api/resumes/<id>/` | View/replace/delete resume |
| GET | `/api/resumes/<id>/download/` | Download resume PDF |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/` | List notifications |
| POST | `/api/notifications/create/` | Create notification |
| PATCH | `/api/notifications/<id>/read/` | Mark as read |
| POST | `/api/notifications/mark-all-read/` | Mark all as read |
| DELETE | `/api/notifications/<id>/delete/` | Delete notification |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/platform/` | Platform statistics (admin) |

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- pip
- Virtual environment (recommended)
- PostgreSQL (optional, SQLite works for development)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd job_board

## Step 2: Create Virtual Environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

##Step 3: Install Dependencies
pip install -r requirements.txt

##Step 4: Configure Environment Variables
cp .env.example .env
# Edit .env with your settings

##Step 5: Run Migrations
python manage.py makemigrations
python manage.py migrate

##Step 6: Create Superuser
python manage.py createsuperuser

##Step 7: Run Development Server
python manage.py runserver

he API will be available at: http://127.0.0.1:8000/
Step 8: Access Documentation
Swagger UI: http://127.0.0.1:8000/swagger/
ReDoc: http://127.0.0.1:8000/redoc/
Admin Panel: http://127.0.0.1:8000/admin/


