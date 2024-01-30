import fetch from 'node-fetch';

export const sendErrorToWebhook = async (error, isString = false) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  const requestBody = {
    content: !isString ? `Error: ${error.message}` : `Error: ${error}`,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(
        `Failed to send error message to webhook: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(`Failed to send error message to webhook: ${error}`);
  }
};
