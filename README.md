# 🚀 Stripe Server

A lightweight Express.js server for handling Stripe payments, subscriptions, and account link operations.

## ✨ Features

- 💳 Process one-time payments
- 🔄 Handle subscriptions
- 🔗 Generate account links for Stripe Connect
- 🔒 Environment-based configuration
- 🌐 Deep link redirection support

## 📋 Prerequisites

- Node.js (v22+)
- npm
- Stripe account

## 🛠️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/cswni/stripe-server.git
cd stripe-server
npm install
```

## ⚙️ Configuration

Create a `.env` file in the project root with the following variables:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REFRESH_URL=https://example.com/refresh
RETURN_URL=https://yourserver.com/redirect
APP_DEEP_LINK=your.app://app/path
PORT=3000
```

## 🚀 Usage

Start the development server:

```bash
npm run dev
```

The server runs on port 3000 by default or the port specified in your `.env` file.

## 🔌 API Endpoints

### Health Check
```
GET /
```
Returns a simple health check message.

### Process Payment
```
POST /payment
```
Body:
- `email`: Customer email address
- `price`: Amount to charge (in euros)

### Create Subscription
```
POST /subscription
```
Body:
- `email`: Customer email address
- `price`: Stripe price ID

### Generate Account Link
```
POST /account-link
```
Body:
- `email`: Email for the connected account

### Redirect Handler
```
GET /redirect
```
Redirects to the configured deep link.

## 🐳 Docker Support

A Docker Compose (FOR SWARM MODE) configuration is available for easy deployment:

```bash
docker-compose -f stripeserver.yml up
```

## 📝 License

MIT License

## 👤 Author

Carlos Andres Perez
