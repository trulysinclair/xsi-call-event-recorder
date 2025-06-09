import * as xml_parser from "@melvdouc/xml-parser";
import {simplifyEvent} from "../utils/simplify-event.ts";

const xml = await Deno.readTextFile("tmp/raw.txt");

// convert xml to nested node array
const nodes = xml_parser.parse(xml).filter((node) =>
  // remove separators
  {
    switch (node.kind) {
      case "TEXT_NODE":
        return node.value.includes("====") ? undefined : node;
      case "ORPHAN_TAG_NODE":
        return undefined;
      default:
        return node;
    }
  }
);

const events = nodes.map((event) => simplifyEvent(event));
const result = JSON.stringify(events, null, 2);

// write new structure into fresh array
await Deno.writeTextFile("tmp/events.json", result);
