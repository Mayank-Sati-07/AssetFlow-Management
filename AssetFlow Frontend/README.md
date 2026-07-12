# AssetFlow

**AssetFlow** is an Enterprise Asset & Resource Management System designed to help organizations track, allocate, and maintain their assets efficiently.

## Features

- **Dashboard**: A comprehensive overview of your organization's assets with key metrics and visualizations.
- **Organization Setup**: Manage organizational structure and basic configurations.
- **Asset Management**: Add, update, and track all physical and digital assets in one place.
- **Asset Allocation**: Assign assets to specific users, departments, or projects.
- **Asset Booking**: A system for scheduling and booking shared assets or resources.
- **Maintenance Tracking**: Schedule, track, and manage maintenance tasks for assets to ensure longevity and compliance.
- **Asset Auditing**: Perform audits to verify the existence, condition, and location of assets.
- **Reporting & Analytics**: Generate detailed reports and charts for insights into asset utilization and value, including:
  - Total Assets
  - Assets by Category
  - Assets by Status
  - Assigned vs Available Assets
  - Monthly Asset Additions
  - Top Department by Assets
- **Activity Logging**: Track all actions and changes within the system for accountability and security.

## Tech Stack

AssetFlow is built with a lightweight, dependency-free vanilla frontend stack for maximum performance and simplicity:

- **HTML5**: Semantic structure.
- **CSS3**: Custom design system using CSS Variables, organized into modular files (`variables.css`, `base.css`, `components.css`, `layout.css`, `pages.css`).
- **JavaScript (ES6+)**: Vanilla JavaScript with custom state management (`store.js`), routing (`router.js`), and component architecture.
- **Chart.js**: For rendering beautiful, interactive charts and reports.
- **Google Fonts**: Uses 'Inter' for clean, modern typography.

## Architecture

The application uses a custom single-page application (SPA) architecture without reliance on heavy frameworks:
- **State Management**: Centralized store (`js/store.js`).
- **Routing**: Client-side router (`js/router.js`).
- **Components**: Reusable UI components including modals, toasts, tables, calendars, and forms (`js/components/`).
- **Pages**: Modular page logic separated by feature (`js/pages/`).
- **Authentication**: Built-in mock authentication flow (`js/auth.js`).

## Getting Started

To run the application locally:
1. Clone the repository.
2. Open `index.html` in your modern web browser.
*(No build tools or local servers are strictly required for viewing, though a local development server like Live Server is recommended for routing).*
