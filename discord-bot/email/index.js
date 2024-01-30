import fetch from 'node-fetch';

export const verifyEmail = async (emails, apiKey) => {
  const emailArray = emails.split(' ');
  let resultArray = [];

  const requestVerification = await fetch(
    `https://emailverification.whoisxmlapi.com/api/bevService/request`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails: emailArray,
        apiKey: apiKey,
        format: 'json',
      }),
    },
  );

  if (!requestVerification.ok) {
    return 'API error, please retry';
  }

  // Parse the JSON response to get the ID
  const data = await requestVerification.json();
  const id = data.response.id;

  let responseData = {response: []};
  let attempts = 0;

  while (attempts < 10) {
    // Wait for 5 seconds before making a request at each iteration
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const requestResults = await fetch(
      `https://emailverification.whoisxmlapi.com/api/bevService/request/completed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          id: id,
          format: 'json',
        }),
      },
    );

    // Parse the JSON response to get the data
    responseData = await requestResults.json();

    if (responseData.response.length !== 0) break; //break the loop if the response is not empty

    attempts++;
  }

  if (responseData.response.length === 0) return 'API error, empty result';

  console.log(responseData.response);

  //switch statement to check the result of the email verification
  responseData.response.forEach((data) => {
    switch (data.result) {
      case 'ok':
        resultArray.push(`✅ ${data.emailAddress} (email exists)`);
        break;
      case 'unknown':
        resultArray.push(
          `❓ ${data.emailAddress} (unknown response, retry later)`,
        );
        break;
      case 'smtp-failed':
        resultArray.push(
          `❌ ${data.emailAddress} (can't access email, most likely invalid)`,
        );
        break;
      case 'bad':
        resultArray.push(`❌ ${data.emailAddress} (email does not exist)`);
      default:
        resultArray.push(
          `❌ ${data.emailAddress} (unexpected result: ${data.result})`,
        );
    }
  });

  console.log(resultArray);

  return resultArray;
};

export const generateEmails = async (firstName, lastName, domain) => {
  if (domain.indexOf('@') !== -1) return 'Invalid domain, please retry';

  const emailArray = [];

  // Generate emails
  emailArray.push(`${firstName}@${domain}`);
  emailArray.push(`${firstName}${lastName}@${domain}`);
  emailArray.push(`${firstName}.${lastName}@${domain}`);
  emailArray.push(`${firstName}.${lastName[0]}@${domain}`);
  emailArray.push(`${firstName[0]}.${lastName}@${domain}`);
  emailArray.push(`${firstName[0]}${lastName}@${domain}`);

  if (emailArray.length === 0) return 'Program error, please retry';

  const emails = emailArray.join(' ');

  return emails;
};
