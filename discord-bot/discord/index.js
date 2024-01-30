import { Client, GatewayIntentBits } from "discord.js";
import { generateEmails, verifyEmail } from "../email/index.js";
import { createPlan, editPlan, getPlan } from "../plans/index.js";
import { registerCommands } from "./register.js";
import { sendErrorToWebhook } from "./webhook.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// turns on bot
client.on("ready", async (as) => {
  await registerCommands();
  console.log(`Logged in as ${client.user.tag}!`);

  // Send message to channel by ID:
  client.channels.cache
    // Email channel
    .get(process.env.BOT_CHANNEL_ID)
    .send(`🦾 I got an upgrade and I'm back online!`);
});

// listens for slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  // switch for different commands
  switch (interaction.commandName) {
    case "verify-emails":
      try {
        const placeholder = await interaction.reply({
          content: "Verifying email(s)...",
          ephemeral: true,
        });

        const response = await verifyEmail(
          interaction.options.getString("emails"),
          process.env.WHOIS_API_KEY
        );
        switch (response) {
          case "API error, please retry":
            await placeholder.delete();
            throw new Error("API not functioning. Please retry later");

          case "API error, empty result":
            await placeholder.delete();
            throw new Error(
              "API returned empty result. Check email format or try again"
            );

          case "Program error, please retry":
            await placeholder.delete();
            throw new Error("Program error, please retry");

          default:
            const message = response.join("\n");
            await interaction.channel.send(message);
            await placeholder.delete();
            break;
        }
      } catch (error) {
        console.error(error);
        await interaction.channel
          .send(
            "❌ Error verifying email(s), please retry" +
              "input: " +
              "email: " +
              interaction.options.getString("emails")
          )
          .catch((e) => console.error(`Error sending error messaage: ${e}`));

        await sendErrorToWebhook(error);
      }
      break;
    case "generate-emails-and-verify":
      try {
        const placeholder = await interaction.reply({
          content: "Generating emails and verifying...",
          ephemeral: true,
        });

        if (interaction.options.getString("domain").indexOf("@") !== -1) {
          await placeholder.delete();
          throw new Error("Invalid domain, please retry");
        }

        const emails = await generateEmails(
          interaction.options.getString("first-name").toLowerCase(),
          interaction.options.getString("last-name").toLowerCase(),
          interaction.options.getString("domain").toLowerCase()
        );

        const response = await verifyEmail(emails, process.env.WHOIS_API_KEY);

        switch (response) {
          case "API error, please retry":
            await placeholder.delete();
            throw new Error("API not functioning. Please retry later");

          case "API error, empty result":
            await placeholder.delete();
            throw new Error(
              "API returned empty result and timed-out. Try again"
            );

          case "Program error, please retry":
            await placeholder.delete();
            throw new Error("Program error, please retry");

          default:
            const message = response.join("\n");
            await interaction.channel.send(message);
            await placeholder.delete();
            break;
        }
      } catch (error) {
        console.error(error);
        await interaction.channel
          .send(
            "❌ Error verifying email(s), please retry " +
              "input: " +
              "first name: " +
              interaction.options.getString("first-name").toLowerCase() +
              ", last name: " +
              interaction.options.getString("last-name").toLowerCase() +
              ", domain: " +
              interaction.options.getString("domain").toLowerCase()
          )
          .catch((e) => console.error(`Error sending error messaage: ${e}`));

        await sendErrorToWebhook(error);
      }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
