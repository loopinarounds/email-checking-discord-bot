// @ts-check
//our array of slash commands for the bot.
// very expandable, just an array of objects with a command name, description and options for the command.

export const commands = [
  {
    name: "verify-emails",
    description: "Verifies if an email is valid",
    options: [
      {
        name: "emails",
        description: "Separate emails with a space",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "generate-emails-and-verify",
    description:
      "Generates a list of emails from a first name, last name and domain, then verifies them",
    options: [
      {
        name: "first-name",
        description: "First name of the person",
        type: 3,
        required: true,
      },
      {
        name: "last-name",
        description: "Last name of the person",
        type: 3,
        required: true,
      },
      {
        name: "domain",
        description: "email domain of the workplace, no @ symbol",
        type: 3,
        required: true,
      },
    ],
  },
];
