import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
} from "@discordjs/voice";
import {
    ActivityType,
    Client,
    Collection,
    EmbedBuilder,
    IntentsBitField,
    Routes,
    SlashCommandBuilder,
} from "discord.js";
//import { Pool } from "pg";
import path from "node:path";
import fs from "node:fs";

export class Haruhi extends Client {
    groups : Collection<string, {
        serverId: string,
        audioStream : number
    }[]> = new Collection();
    commands: Collection<
        string,
        { data: SlashCommandBuilder; execute: Function }
    > = new Collection();
    buttons: Collection<string, { execute: Function }> = new Collection();

    constructor() {
        // Initilize the Base Discord Bot Client
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildVoiceStates
            ],
        });
        // Loads all the Event Files
        console.log("\x1b[33m" + "[Bot] Loading Events...");
        this.updateEventHandlers();
        console.log("\x1b[32m" + "[Bot] Successfully Loaded the Events!");

        // Loads all the Command and Button Interaction Files
        console.log("\x1b[33m" + "[Bot] Adding Interactions to Collection");
        this.updateInteractionCollection();
        console.log(
            "\x1b[32m" + "[Bot] Successfully Added Interaction to Collection."
        );
    }

    // Register Commands to
    async RegisterCommands() {
        if (this.user == null)
            throw new Error(
                "Application needs to be a Discord Bot Client to Deploy Commands."
            );

        const commandsData: SlashCommandBuilder[] = [];
        for (const command of this.commands.values()) {
            commandsData.push(command.data);
        }

        console.log(
            "\x1b[30m" +
            `[Bot] Started refreshing ${commandsData.length} application (/) commands.`
        );

        const data = await this.rest.put(
            Routes.applicationCommands(this.user.id),
            {
                body: commandsData,
            }
        );

        console.log(
            "\x1b[30m" +
            // @ts-ignore
            `[Bot] Successfully reloaded ${data.length} application (/) commands.`
        );
    }



    // Fetches Interaction Data from the directories using node fs modules
    // and add them to collection.
    // In case of failure, it will just throw exception and if exception is handled
    // Existing collection map will be used.
    updateInteractionCollection() {
        // Adds Commands to Collection
        const commands: typeof this.commands = new Collection();
        const commandsPath = path.join(__dirname, "commands");
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file: string) => file.endsWith(".js"));



        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);

            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if ("data" in command && "execute" in command) {
                commands.set(command.data.name, command);
            } else {
                console.warn(`${filePath} is missing a required some properties.`);
            }
        }

        this.commands = commands;

    }

    // Add Event Handlers to Client Events
    updateEventHandlers() {
        const eventsPath = path.join(__dirname, "events");
        const eventFiles = fs
            .readdirSync(eventsPath)
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                this.on(event.name, (...args) => event.execute(this, ...args));
            }
        }
    }
}