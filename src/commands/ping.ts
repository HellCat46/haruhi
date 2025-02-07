import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Haruhi } from "../Haruhi";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get Latency Info about the bot"),
  async execute(client: Haruhi, i: ChatInputCommandInteraction) {
    await i.deferReply();

    i.editReply({
      embeds: [
        new EmbedBuilder().setDescription(
          `**Latency:** ${Date.now() - i.createdTimestamp}ms \n**WS Ping:** ${
            client.ws.ping
          }ms \n**Started At:** <t:${Math.floor(
            (Date.now() - i.client.uptime) / 1000
          )}:R>`
        ),
      ],
    });
  },
};
