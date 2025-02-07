import { EmbedBuilder, Interaction } from "discord.js";
import { Haruhi } from "../Haruhi";

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(client: Haruhi, i: Interaction) {
    try {
      if (i.isChatInputCommand()) {
        const command = client.commands.get(i.commandName);
        if (!command) return;

        await command.execute(client, i);
      }
      // else if (i.isAutocomplete()) {
      //   const command = client.commands.get(i.commandName);
      //   if (!command || !command.data.autocomplete) return;

      //   await command.baseCommand.autocomplete(command, client, i);
      // }
    } catch (ex) {
      console.error(ex);
      if (i.isAutocomplete()) return;
      if (i.replied || i.deferred) {
        await i.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle("There was an error while executing the command!")
              .setColor("Red"),
          ],
          ephemeral: true,
        });
      } else {
        await i.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("There was an error while executing the command!")
              .setColor("Red"),
          ],
          ephemeral: true,
        });
      }
    }
  },
};
