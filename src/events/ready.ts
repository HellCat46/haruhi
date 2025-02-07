import { Client } from "discord.js";

module.exports = {
    name : "ready",
    once : true,
    async execute(client : Client){
        console.log("Logged In as "+client.user?.tag)

        const guild = await client.guilds.fetch("1280461299830095984");
        
    }
}