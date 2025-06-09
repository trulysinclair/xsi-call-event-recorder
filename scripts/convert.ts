import {stringify} from "@eemeli/yaml";
import {XmlNode} from "@melvdouc/xml-parser";

const raw = await Deno.readTextFile("tmp/events.json");
const events: XmlNode[] = JSON.parse(raw);

await Deno.writeTextFile(
  "tmp/events.yml",
  stringify(events),
);
