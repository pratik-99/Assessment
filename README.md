
# How to verify authenticity of webhook in production

Webhook Authenticity can be verified using signature verification by capturing the signature header
from webhook request

- signature header should be enabled in Hubspot webhook settings
- Extract the X-HubSpot-Signature header from the request
- using the webhook app's client secret key we need to recreate the HMAC SHA-256 hash 
- Compare the result with provided signature

```
const crypto = require('crypto');

// Raw body parsing middleware setup
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Save raw body for HMAC
  }
}));

function verifyHubspotSignature(req, res, next) {
  const signature = req.headers['x-hubspot-signature'];
  const secret = process.env.HUBSPOT_CLIENT_SECRET;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid HubSpot signature' });
  }

  next();
}
```

# How can we ensure idempotency if the webhook is received multiple times?

To ensure Idempotency i.e handle duplicate webhook deliveries safely we will not be processing the same 
webhook event more than once

- sending a unique ID Webhook payload 
- ensuring we set up a unique event Id column in our database
- Check the database before proccessing

```
const eventId = req.body.eventId;

if (await isEventProcessed(eventId)) {
  return res.status(200).json({ message: 'Already processed' });
}
```
If not processed, mark event ID as processing 
Ensure the eventId is updated in the database and marked as done

# How will we handle API rate limmits effectively

To handle API rate limits effectively our service must detect and respond to continuous
requests by either slowing down, retrying or queing the requests

- Check and handle rate limit headers whenever status code of 429 is encountered
- Queue the requests instead of firing all requests at once
- Caching of repeated calls can be an alternative

Below is an example of using a queue library to limit API rates
```
const PQueue = require('p-queue');
const queue = new PQueue({ interval: 1000, intervalCap: 5 }); // max 5 requests per second

queue.add(() => sendToMonday(deal));

```
