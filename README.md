# COMP353 Database Dashboard

This project is a web-based dashboard for managing the Montreal Youth Volleyball Club database. It provides a graphical interface to manage multiple entities including:

- **Club Members**
- **Family Members**
- **Personnel**
- **Locations**
- **Payments**
- **Statistics**

## Features

- CRUD operations for Club Members, Family Members, Personnel, Locations, and Payments.
- Detailed views for individual records.
- Dynamic statistics and metrics display.
- Backend powered by Node.js with Express and MySQL.

## Technology Stack

- **Backend:** Node.js with Express
- **Database:** MySQL
- **Frontend:** HTML, CSS, and JavaScript

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OlivMaher/COMP353.git
   ```
2. **Navigate to the backend directory:**
   ```bash
   cd COMP353/Backend
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up environment variables:**
   Create a `.env` file in the backend folder with your database credentials:
   ```env
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```
5. **Start the server:**
   ```bash
   node app.js
   ```
6. **Access the Dashboard:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- Use the navigation links in the web interface to access pages for managing each category (Club Members, Family Members, Locations, Payments, Personnel, and viewing Statistics).
- Forms are provided for adding new records. Detailed views allow you to see and manage individual entries.

## Project Structure

- **Backend/**: Contains server code (`app.js`, `database.js`), API endpoints, and static files.
- **Backend/public/**: Contains all HTML files, CSS, and client-side JavaScript.
- **.vscode/**: Contains VS Code configuration files.
- **.env**: Environment variable file (not included; see installation instructions).
