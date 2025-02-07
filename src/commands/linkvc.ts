import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import prism from "prism-media";
import { Haruhi } from "../Haruhi";
import ffmpeg from "fluent-ffmpeg";
import {
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType,
  joinVoiceChannel,
  StreamType,
} from "@discordjs/voice";
import { createWriteStream, readFile } from "node:fs";
import { log } from "node:console";
import { OpusEncoder } from "@discordjs/opus";
import { Stream } from "node:stream";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a Group")
    .addChannelOption((op) =>
      op
        .setName("channel")
        .setDescription("Channel to Join")
        .addChannelTypes([ChannelType.GuildVoice])
        .setRequired(true)
    )
    .addStringOption((op) => op.setName("id").setDescription("ID of Group")),
  async execute(client: Haruhi, i: ChatInputCommandInteraction) {
    await i.deferReply();

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

    if (i.guild == null) {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Unable to get Server Info")
            .setColor("Red"),
        ],
      });
      return;
    }

    const channel = i.options.getChannel("channel", true, [
      ChannelType.GuildVoice,
    ]);

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

    const stream = Stream;

    data.on;

    let resource = createAudioResource(data, {
      inputType: StreamType.Opus,
    });

    player.play(resource);
    connection.subscribe(player);

    //while(true) console.log(player.state.status)
    // ffmpeg -f s16le -ar 48k -ac 2 -i out.pcm out.mp3

    // data.on("end", () => {
    //   "Data Stream ended";
    // });
    // player.play(createAudioResource(data));

    // connection.subscribe(player);

    // setTimeout(() => {
    //   connection.disconnect();
    //   connection.destroy();
    //   //wStream.close();
    // }, 10000);

    i.editReply("HELlo");
  },
};
