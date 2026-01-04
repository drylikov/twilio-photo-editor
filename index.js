
// Import required modules
require("dotenv").config();
const ngrok = require("ngrok");
const express = require("express");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;

// Get Twilio account credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Create Twilio client
const client = require("twilio")(accountSid, authToken);

// Create an instance of Express
const app = express();

// Configure body-parser middleware for JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require background eraser service
const bgErase = require("./services/bgErase.js");

// Endpoint for receiving image URLs and sending edited images via WhatsApp
app.post("/messageEnd/:to", async (req, res) => {
  const { to } = req.params;
  const { output: editedImageUrl } = req.body;

  const twiml = new MessagingResponse();
  twiml.message().media(editedImageUrl);

  // Send the edited image via WhatsApp using Twilio client
  await client.messages.create({
    mediaUrl: editedImageUrl,
    from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    to,
  });

  // Send a successful response to the request
  res.sendStatus(200);
});

// Endpoint for receiving image messages and initiating background eraser service
app.post("/message", async (req, res) => {
  const { MediaUrl0: sentImageUrl, From: from } = req.body;

  // Check if an image was sent
  if (!sentImageUrl) {
    const twiml = new MessagingResponse();
    twiml.message("No image sent");
    res.type("text/xml").send(twiml.toString());
    return;
  }

  // Call the background eraser service to process the image asynchronously
  await bgErase(sentImageUrl, from);

  // Send a response indicating that the AI is processing the image
  const twiml = new MessagingResponse();
  twiml.message("Hold on! The AI is doing its magic...");
  res.type("text/xml").send(twiml.toString());
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is listening on port 3000");

  // Expose the server to the internet using ngrok
  (async function () {
    const url = await ngrok.connect(3000);
    process.env["NGROK_URL"] = url;
    console.log(`Ngrok url: ${url}`);
  })();
});
