# AFI CRM - Customer & Order Management

A web-based CRM system for managing customers, orders, and leads, with a modern UI and robust feature set.

---

## Features

### 1. Navigation & Layout
- Tabbed navigation: Switch between Orders, Customers, and Leads sections.
- Responsive design: Works on desktop and mobile devices.
- Loading screen & toast notifications: User feedback for actions and loading states.

### 2. Orders Management
- Order filters: Filter orders by status (All, Pending, In Progress, Out for Delivery, Delivered).
- Orders table: View all orders with details like order number, customer, date, amount, status, and actions.
- Order details expansion: Click an order to view full details, including products, quantities, prices, and comments.
- Change order status: Update the status of any order directly from the table.

### 3. Customers Management
- Customers grid: View all customers with stats (total orders, total spent, last order date).
- Add customer: Add new customers with full details (name, phone, address, district, area).
- Customer search: Search for customers by name or phone, with instant results and highlight.
- Select customer: Choose an existing customer for a new order, or add a new one if not found.

### 4. Leads Management
- Leads grid: Manage potential customers (leads) with details like name, phone, email, district, source, status, and notes.
- Add lead: Add new leads with all relevant information.

### 5. Order Creation Workflow
- New order modal: Guided modal for creating a new order.
  - Customer search: Find or add a customer.
  - Address selection: Choose or add a delivery address for the customer.
  - Order details: Add products, quantities, units, prices, and comments.
  - Order comments: Add general notes for the order.
  - Order source: Specify where the order came from (website, social, etc.).
  - Validation: Ensures all required fields are filled and at least one product is added.
  - Submit order: Save the order and update the orders list.

### 6. Address Management
- Multiple addresses: Customers can have multiple addresses (home, work, other).
- Add/edit address: Add new addresses for customers during order creation.

### 7. Product Management (Mock Data)
- Product list: Select products from a predefined list with prices and categories.
- Dynamic pricing: Product price is shown and updated in the order form.

### 8. State Management & Mock API
- App state: All UI and data state is managed in a central appState object.
- Mock API: Simulates backend operations for orders, customers, leads, and products.

### 9. Utilities
- Currency & date formatting: Consistent display of prices and dates.
- Debounced search: Efficient customer search with debouncing.
- Form validation: Highlights missing or invalid fields and prevents submission.

---

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. No backend required (all data is mock/in-memory)

---

## File Structure

- `index.html` - Main application file (HTML, CSS, JS in one)
- `.gitignore` - Ignores `.clasp.json` and `appsscript.json`
- `server/` - (If present) Backend scripts (not used in the browser app)

---

## Customization

- Add more products: Edit the `mockProducts` array in the script section.
- Add more customers/leads: Edit the `mockCustomers` and `mockLeads` arrays.
- Integrate with a real backend: Replace the mock API functions with real API calls.

---

## License

MIT (or your preferred license) 