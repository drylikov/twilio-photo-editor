
// Import the Replicate module
const Replicate = require("replicate");

// Create a new Replicate instance with the API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Export the bgErase function
module.exports = async function bgErase(url, to) {
  // Use the Replicate API to create a background erasing prediction
  await replicate.predictions.create({
    version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
    input: {
      image: url,
    },
    // Specify the webhook URL to receive the prediction result
    webhook: `${process.env.NGROK_URL}/messageEnd/${to}`,
    // Filter for completed webhook events
    webhook_events_filter: ["completed"],
  });
};
