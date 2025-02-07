import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Haruhi } from "../Haruhi";
import {
  createAudioPlayer,
  EndBehaviorType,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { OpusEncoder } from "@discordjs/opus";
import { createWriteStream } from "fs";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("record")
    .setDescription("Record All or Specific User Voice in Voice Channel")
    .addUserOption((op) =>
      op
        .setName("user")
        .setDescription("Record a specific user")
        .setRequired(true)
    )
    .addIntegerOption((op) =>
      op
        .setName("duration")
        .setDescription("In Seconds")
        .setMinValue(1)
        .setMaxValue(10800)
    ),
  async execute(client: Haruhi, i: ChatInputCommandInteraction) {
    await i.deferReply();
    const duration = i.options.getInteger("duration");
    const specUser = i.options.getUser("user");

    if (i.user.username !== "hellcat46") {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("HAH! Imagine being able to run this command.")
            .setAuthor({ name: "HellCat" })
            .setColor("Red"),
        ],
      });
      return;
    }

    if (i.guild == null || !(i.member instanceof GuildMember)) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "Unable to get Info about Server or the user who created the interaction."
            )
            .setColor("Red"),
        ],
      });
      return;
    }

    if (!i.member.voice.channel) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("You need to be in voice channel to perform this action.")
            .setColor("Red"),
        ],
      });
      return;
    }
    const channel = i.member.voice.channel;

    if (!channel.joinable) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`I don't have permission to join the <#${channel.id}>`)
            .setColor("Red"),
        ],
      });
      return;
    }

    if (specUser && !channel.members.has(specUser.id)) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `User (<@${specUser.id}>) needs to be in same channel as you.`
            )
            .setColor("Red"),
        ],
      });
      return;
    }

    const player = createAudioPlayer();

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: i.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const data = connection.receiver.subscribe(i.user.id, {
      end: {
        behavior: EndBehaviorType.Manual,
      },
    });
    const wStream = createWriteStream("out.pcm");

    const opusDecoder = new OpusEncoder(48000, 2);


    await i.editReply("Recording has been started.");
    
    data.readable
    data.on("data", (data) => {
      console.log("Data Incoming");
      const deData = opusDecoder.decode(data);
      console.log(data)
      console.log(deData);
      wStream.write(deData)
      console.log(Date.now());
      console.log(connection.state + " " + data.readable)
    });


    if (duration) {
      setTimeout(() => {
        connection.destroy();
        wStream.close()
      }, duration * 1000);
    }
  },
};
