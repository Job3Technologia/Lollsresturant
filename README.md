# Lolly's Food Joint - Premium Durban Dining

Lolly's Food Joint is a full-stack food ordering platform designed for a premium Durban street food experience. It features a modern frontend, a robust backend API, and administrative tools for managing the menu, orders, and kitchen operations.

## Features

- **Customer Experience**: 
    - Responsive, modern frontend.
    - User authentication (registration, login, email verification).
    - Dynamic menu browsing.
    - Shopping cart and checkout system.
    - Order history and profile management.
- **Admin & Kitchen Dashboards**:
    - Real-time order tracking.
    - Menu management (add, edit, delete items).
    - Kitchen workflow management.
    - Analytics and reporting.
- **Backend & Security**:
    - Express.js REST API.
    - MySQL database with optimized schema.
    - **Demo Mode**: Automatic fallback to mock data if the database is unavailable (perfect for presentations).
    - JWT-based authentication.
    - Rate limiting and security headers (Helmet).
    - Email notifications via Nodemailer.
    - Integration with Stripe for payments.

## Tech Stack
...
## Demo Mode (For Class Presentations)

The system is designed to work even if you haven't set up the MySQL database yet. If the backend fails to connect to a database within 2 seconds, it will automatically switch to **DEMO MODE**.

- **Customer Demo Account**: `user@lollys.co.za` / `password123`
- **Admin Demo Account**: `admin@lollys.co.za` / `admin`
- **Features in Demo Mode**:
    - Login/Logout functionality.
    - Menu browsing (with mock items).
    - Placing orders (returns a mock success message).
    - Viewing orders (shows mock order list).

*Note: Data is not persistent in Demo Mode.*

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Font Awesome.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Security**: JWT, bcrypt, Helmet, express-rate-limit.
- **Payments**: Stripe API.
- **Mailing**: Nodemailer.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL Server

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/lollys.git
    cd lollys
    ```

2.  **Backend Setup**:
    - Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    - Install dependencies:
        ```bash
        npm install
        ```
    - Create a `.env` file based on `.env.example` and fill in your details:
        ```bash
        cp .env.example .env
        ```
    - Import the database schema:
        ```bash
        mysql -u root -p < database.sql
        ```
    - (Optional) Seed the database:
        ```bash
        npm run seed
        ```
    - Start the server:
        ```bash
        npm run dev
        ```

3.  **Frontend Setup**:
    - The frontend is composed of static HTML files. You can serve them using any local web server (e.g., Live Server in VS Code) or simply open `index.html` in your browser.

## Project Structure

- `backend/`: API server, routes, controllers, and database logic.
- `css/`: Stylesheets for various components and pages.
- `js/`: Frontend logic (API interaction, UI components).
- `Images/`: Static assets (logos, images).
- Root directory: HTML templates for the application.

## Next Steps & Future Enhancements

- [ ] Implement Cloudflare Turnstile for CAPTCHA.
- [ ] Fully integrate Stripe for production-ready payments.
- [ ] Add automated tests (Unit & Integration).
- [ ] Implement a CI/CD pipeline.
- [ ] Add PWA support for better mobile experience.
