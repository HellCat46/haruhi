import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Haruhi } from "../Haruhi";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendcode")
    .setDescription(
      "Uploads your code to forum with proper name and Formatting"
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Title or Name of the program")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("program")
        .setDescription("File which contains the actual program")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("author")
        .setDescription(
          "To give someone else credit of the code. Why? MAYBE BECAUSE YOU DIDN'T WROTE IT"
        )
    ),
  async execute(client: Haruhi, i: ChatInputCommandInteraction) {
    await i.deferReply();

    const title = i.options.getString("title", true);
    const file = i.options.getAttachment("program", true);
    const author = i.options.getUser("author") ?? i.user;

    const fileExt = file.name.split(".").at(-1);

    if (!file.contentType?.startsWith("text")) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error! Unsupported file format")
            .setDescription("Only Text files are allowed.")
            .setColor("Red"),
        ],
      });
      return;
    }

    const dataList: string[] = [];

    try {
      const data = await (await fetch(file.url))?.text();
      if (data.length > 40000) {
        await i.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error! Too much Text!!!")
              .setDescription("Are you sure file being uploaded is correct?")
              .setColor("Red"),
          ],
        });
        return;
      }

      let dataStr = "";
      for (const line of data.split("\n")) {
        if (dataStr.length + line.length + 1 > 4000) {
          dataList.push(dataStr);
          dataStr = "";
        }

        dataStr += line + "\n";
      }

      if (dataStr.length > 0) {
        dataList.push(dataStr);
      }
    } catch (ex) {
      console.error(ex);
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error! While Retriving File Data")
            .setColor("Red"),
        ],
      });
      return;
    }

    if (dataList.length == 0) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error! No Data Found")
            .setDescription("The file seems to be empty.")
            .setColor("Red"),
        ],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription("```" + `${fileExt}\n${dataList[0]}\n` + "```")
      .setFooter({
        text: `By ${author.displayName}`,
        iconURL: author.avatarURL() ?? undefined,
      })
      .setTimestamp();

    await i.editReply({ embeds: [embed] });

    dataList.shift();
    for (const data of dataList) {
      embed.setDescription("```" + `${fileExt}\n${data}\n` + "```");
      await i.followUp({ embeds: [embed] });
    }
  },
};
