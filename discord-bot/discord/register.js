// @ts-check
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {commands} from './commands.js';

if (!process.env.DISCORD_BOT_TOKEN || !process.env.APPLICATION_ID) {
  throw new Error('DISCORD_BOT_TOKEN or APPLICATION_ID is not defined');
}

const rest = new REST({version: '9'}).setToken(process.env.DISCORD_BOT_TOKEN);

const applicationCommands = Routes.applicationCommands(
  process.env.APPLICATION_ID,
);

// register slash command, commands array is imported from commands.js
export const registerCommands = async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(applicationCommands, {body: commands});

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};
