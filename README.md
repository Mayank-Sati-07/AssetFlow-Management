#  AssetFlow - Smart Asset Management System

<p align="center">
  <b>Transforming traditional asset tracking into a smart, digital, and scalable management solution.</b>
</p>

---

#  Overview

AssetFlow is a smart asset management platform designed to help organizations efficiently track, manage, and monitor their physical assets.

Traditional asset management often relies on spreadsheets and manual records, leading to lost assets, poor tracking, and inefficient allocation.

AssetFlow solves this problem by providing a centralized digital platform with:

* Complete asset lifecycle management
* QR-based asset identification
* User assignment tracking
* Category-based organization
* Structured database management

The platform enables organizations to know **what assets exist, where they are, who is responsible for them, and their current status.**

---

#  Problem Statement

Organizations managing physical assets face several challenges:

*  Manual tracking through spreadsheets
*  Difficulty finding asset ownership information
*  Lack of real-time visibility
*  Poor maintenance and usage history tracking
*  Time-consuming inventory verification

AssetFlow provides an automated and organized solution to improve efficiency, accountability, and transparency.

---

#  Solution

AssetFlow creates a complete digital asset ecosystem where organizations can:

 Register and manage assets
 Categorize assets efficiently
 Assign assets to users
 Identify assets instantly using QR codes
 Maintain structured asset records
 Monitor asset distribution

---

#  Key Features

##  Smart Asset Management

* Add, update, delete, and view assets
* Maintain detailed asset information
* Track asset status and availability
* Organize assets systematically

---

##  QR Code Asset Identification 

A unique QR code is generated for every asset.

Benefits:

* Instant asset identification
* Faster verification process
* Reduces manual searching
* Improves inventory accuracy

---

##  User & Role Management

* Manage different user roles
* Maintain accountability
* Control asset access and operations

---

##  Asset Assignment Tracking

Track:

* Who is using an asset
* When it was assigned
* Current ownership status

This creates transparency throughout the asset lifecycle.

---

##  Category Management

* Organize assets into categories
* Improve filtering and searching
* Maintain structured records

---

##  Analytics Dashboard

Provides insights into:

* Total assets
* Asset distribution
* Availability status
* Usage patterns

---

#  System Architecture

```
                    React Frontend
                          |
                          |
                    REST API Layer
                          |
                          |
              Node.js + Express Backend
                          |
                          |
                     Prisma ORM
                          |
                          |
                  PostgreSQL Database
```

---

#  Tech Stack

## Frontend

* React.js

## Backend

* Node.js
* Express.js
* REST APIs

## Database

* PostgreSQL
* Prisma ORM

## Development Tools

* Git & GitHub
* Postman
* VS Code

---

#  Database Design

AssetFlow uses a relational database architecture designed for scalability and data consistency.

### Main Entities

```
User
 |
 |
Assignment
 |
 |
Asset
 |
 |
Category
```

### Relationships

* One category can contain multiple assets
* Assets can be assigned to users
* Assignment records maintain asset history

Database features:

* Relational modeling
* Prisma migrations
* Structured schema design
* Data consistency

---

#  Project Structure

```
AssetFlow-Management/

├── assetflow-backend/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── modules/
│   └── asset/
│       ├── asset.controller.js
│       ├── asset.routes.js
│       └── asset.service.js
│
├── app.js
├── server.js
│
├── AssetFlow Frontend/
│
└── README.md
```

---

#  Installation & Setup

## Clone Repository

```bash
git clone <repository-url>

cd AssetFlow-Management
```

---

## Backend Setup

```bash
cd assetflow-backend

npm install
```

Create `.env` file:

```env
DATABASE_URL="your_postgresql_database_url"
```

Run database setup:

```bash
npx prisma migrate dev

npx prisma generate
```

Start server:

```bash
npm start
```

Backend runs at:

```
http://localhost:5000
```

---

#  API Endpoints

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| GET    | `/api/assets`     | Fetch all assets    |
| GET    | `/api/assets/:id` | Fetch asset details |
| POST   | `/api/assets`     | Create asset        |
| PUT    | `/api/assets/:id` | Update asset        |
| DELETE | `/api/assets/:id` | Delete asset        |

---

#  Engineering Highlights

* Modular backend architecture
* RESTful API design
* Prisma ORM integration
* PostgreSQL relational database
* Database migrations
* Input validation
* Error handling
* Scalable project structure

---

#  Future Enhancements

* AI-based asset usage prediction
* Automated inventory auditing
* Mobile application
* Maintenance scheduling
* Real-time asset tracking
* Advanced analytics

---

#  Demo

(Add deployed link / demo video here)

---

#  Team

## Hackathon 2026

Built by:

* Member : Mayank Sati 
* Member : Pranav Juyal
* Member : Anuj Semwal
* Member : Vansh Panwar

---

#  Why AssetFlow?

AssetFlow combines **database-driven asset management, QR-based identification, and scalable backend architecture** to solve a real-world organizational problem.

It transforms asset tracking from a manual process into an intelligent digital workflow.
