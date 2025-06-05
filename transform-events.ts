import * as xml_parser from "jsr:@melvdouc/xml-parser";

const xml = await Deno.readTextFile("events.txt");

// convert xml to nested node array
const nodes = xml_parser.parse(xml).filter((node) =>
  // remove separators
  {
    node.kind === "TEXT_NODE" && node.value.includes("====") ? undefined : node;

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

const result = JSON.stringify(nodes, null, 2);

// write new structure into fresh array
await Deno.writeTextFile("events.json", result);
