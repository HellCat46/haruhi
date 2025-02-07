
import dotenv from "dotenv";
import { Haruhi } from "./Haruhi";

dotenv.config();

(async () => {
  const client = new Haruhi();
  await client.login(process.env.TOKEN);
  await client.RegisterCommands();
  //console.log(generateDependencyReport());

})()