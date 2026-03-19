# AFI CRM — Customer & Order Management

A web-based CRM for Advanced Food Industries (AFI) to manage customers, orders, and leads. Built on Google Apps Script with a tabbed SPA interface, real-time search, and direct Google Sheets integration.

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-WebApp-blue)
![Status](https://img.shields.io/badge/Status-Production-green)

---

## Features

### Orders
- Filter orders by status: All · Pending · In Progress · Out for Delivery · Delivered
- Expandable order rows with full product breakdown, quantities, prices, and comments
- Update order status directly from the table

### Customers
- Customer grid with aggregated stats: total orders, total spent, last order date
- Add customers with full details (name, phone, address, district, area)
- Debounced real-time search by name or phone
- Multiple delivery addresses per customer

### Leads
- Leads grid with name, phone, email, district, source, status, and notes
- Add and manage potential customers through the pipeline

### Order Creation
- Guided modal: customer search → address selection → product rows → validation → submit
- Dynamic product rows — add or remove lines as needed
- Searchable dropdowns for customers, products, and units

---

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Platform | Google Apps Script              |
| UI       | HTML5, CSS3, Vanilla JavaScript |
| Database | Google Sheets                   |
| Deploy   | clasp CLI                       |

---

## Project Structure

```
afi-online-sales-crm/
├── README.md
├── AGENT.md
├── .gitignore
└── src/
    ├── env.js          # Sheet IDs and config
    ├── Backend.js      # Data access layer (Sheets read/write)
    ├── Helpers.js      # Pure utility functions
    ├── Middleware.js   # Server-side routing and validation
    ├── Server.js       # doGet() / doPost() entry points
    └── index.html      # SPA shell (Orders, Customers, Leads tabs)
```

---

## Getting Started

### Prerequisites

- A Google account with Google Apps Script access
- [clasp](https://github.com/google/clasp) installed globally

```bash
npm install -g @google/clasp
clasp login
```

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mohamedallam13/afi-online-sales-crm.git
   cd afi-online-sales-crm
   ```

2. Link to your Apps Script project:
   ```bash
   clasp create --type webapp --title "AFI CRM" --rootDir src
   ```

3. Push source files:
   ```bash
   clasp push
   ```

4. Set Sheet IDs in `env.js`.

---

## Deployment

1. In the Apps Script editor, go to **Deploy > New deployment**
2. Select type: **Web app**
3. Set access permissions as required
4. Click **Deploy** and share the Web App URL

---

## Author

**Mohamed Allam** — [GitHub](https://github.com/mohamedallam13) · [Email](mailto:mohamedallam.tu@gmail.com)
