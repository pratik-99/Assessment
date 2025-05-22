// Import the express module
const express = require('express');
const axios = require('axios');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
// Create an express application
const app = express();

// Define the port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_TOKEN = '<DUMMY-TOKEN>';



// Define a basic route
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// POST endpoint to receive HubSpot webhook
app.post('/hubspot-webhook', async (req, res) => {
  try {
    // JWT verification would occur here

    const payload = req.body;

    // Extract required fields
    const dealName = payload.dealName;
    const dealStage = payload.propertyValue; // assuming 'dealStage' maps to 'propertyValue'
    const dealAmount = parseFloat(payload.dealAmount);
    const contactEmail = payload.contactEmail;
    
    if (!dealName || !dealStage || isNaN(dealAmount) || !contactEmail) {
      return res.status(400).json({ error: 'Missing or invalid required fields.' });
    }
    
    // Format column values for Monday.com
    const columnValues = {
      status: { label: dealStage },
      numbers: dealAmount,
      email: { email: contactEmail, text: contactEmail }
    };

    // Prepare GraphQL mutation
    const mutation = {
      query: `mutation {
        create_item(
          board_id: 2012772463,
          item_name: "${dealName}",
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) {
          id
        }
      }`
    };

    const response = await axios.post(MONDAY_API_URL, mutation, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MONDAY_API_TOKEN
      }
    });

    res.status(200).json({ message: 'Item created in Monday.com', data: response.data });
  } catch (error) {
    console.error('Error processing webhook:', error);

    // Retry logic can be implemented here
    return res.status(500).json({ error: 'Failed to process webhook.' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});