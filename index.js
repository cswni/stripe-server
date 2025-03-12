import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Get endpoint to show that the server is running
app.get('/', (req, res) => {
    res.json({
        message: 'I am alive!',
    });
});

app.post('/payment', async (req, res) => {
    console.log('req.body: ', req.body);
    // Get the customer ID from the request.
    const email = req.body.email;

    // Find the customer in Stripe.
    let customer = await stripe.customers.list({
        email: email,
        limit: 1,
    });

    // If the customer doesn't exist, create a new one.
    if (!customer.data.length) {
        customer = await stripe.customers.create({
            email: email,
            name: 'SDK Customer',
        });
    } else {
        customer = customer.data[0];
    }

    console.log('CUSTOMER: ', customer?.email);

    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2025-02-24.acacia' }
    );
    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(req.body.price ?? '1') * 100,
        currency: 'eur',
        customer: customer.id,
        automatic_payment_methods: {
            enabled: true,
        },
    });

    console.log('PAYMENT INTENT INFORMATION: ', {
        secret: paymentIntent?.client_secret,
        amount: paymentIntent?.amount,
    });

    res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

/**
 * Enable endpoint to create a payment intent for a subscription mode
 */
app.post('/subscription', async (req, res) => {
    console.log('req.body: ', req.body);
    // Get the customer ID from the request.
    const email = req.body.email;

    // Find the customer in Stripe.
    let customer = await stripe.customers.list({
        email: email,
        limit: 1,
    });

    // If the customer doesn't exist, create a new one.
    if (!customer.data.length) {
        customer = await stripe.customers.create({
            email: email,
            name: 'SDK Customer',
        });
    } else {
        customer = customer.data[0];
    }

    console.log('CUSTOMER: ', customer?.email);

    const subscription = await stripe.subscriptions.create({
        items: [
            {
                price: req.body.price,
            },
        ],
        currency: 'eur',
        customer: customer.id,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
    });

    console.log('PAYMENT SUBSCRIPTION INFORMATION: ', {
        secret: subscription?.client_secret,
    });

    res.send({
        customer: customer.id,
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
});

/**
 * Generate the account link for the connected account
 * Return the url to the application (android or ios) to redirect the user to the account link
 */
app.post('/account-link', async (req, res) => {
    console.log('req.body: ', req.body);

    const account = await stripe.accounts.create({
        type: 'standard',
        email: req.body.email
    });

    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: process.env.REFRESH_URL,
        return_url: process.env.RETURN_URL,
        type: 'account_onboarding',
    });

    console.log('ACCOUNT LINK: ', accountLink);

    res.json({
        url: accountLink.url,
    });
});

/**
 * Redirect to the application, When user open this (get) route, return the url to the application opening the app scheme
 */
app.get('/redirect', (req, res) => {
    // Para mayor seguridad, se pueden listar únicamente los destinos permitidos.
    let deepLink = process.env.APP_DEEP_LINK;

    console.log('DEEP LINK en uso: ', deepLink);

    // Envía una página HTML que redirige inmediatamente al deep link.
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Redirigiendo...</title>
        <meta http-equiv="refresh" content="0; url=${deepLink}" />
      </head>
      <body>
        <p>Si no eres redirigido automáticamente, haz clic <a href="${deepLink}">aquí</a>.</p>
        <script>
          window.location.href = "${deepLink}";
        </script>
      </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
