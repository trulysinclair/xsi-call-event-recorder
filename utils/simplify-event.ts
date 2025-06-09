/**
 * Simplify a single Event node into a flat object.
 */
export function simplifyEvent(evt: any): any {
  const out: Record<string, any> = {};

  // capture the event type
  if (evt.attributes?.["xsi1:type"]) {
    out.type = evt.attributes["xsi1:type"].split(":").pop();
  }

  // process all children under <Event>
  for (const child of evt.children || []) {
    if (child.kind !== "REGULAR_TAG_NODE") continue;
    const key = stripNamespace(child.tagName);

    if (child.attributes?.["xsi1:type"]) {
      out["type"] = child.attributes["xsi1:type"].split(":").pop();

    }

    out[key] = simplifyNode(child);
      console.log(out)

  }

  return out;
}

/**
 * Recursively simplify a node:
 * - TEXT_NODE → its .value
 * - REGULAR_TAG_NODE → object (or array) of its children
 */
function simplifyNode(node: any): any {
  if (node.kind === "TEXT_NODE") {
    return node.value;
  }

  // REGULAR_TAG_NODE or ORPHAN_TAG_NODE
  const buckets: Record<string, any[]> = {};
  for (const ch of node.children || []) {
    if (ch.kind === "TEXT_NODE") {
      // direct text under a tag: use it as if the tag has a single value
      buckets["_text"] = buckets["_text"] || [];
      buckets["_text"].push(ch.value);
    } else if (
      ch.kind === "REGULAR_TAG_NODE" || ch.kind === "ORPHAN_TAG_NODE"
    ) {
      const k = stripNamespace(ch.tagName);

      buckets[k] = buckets[k] || [];

      buckets[k].push(simplifyNode(ch));
    }
  }

  // collapse buckets: single entry → value, multiple → array
  const result: Record<string, any> = {};
  for (const [k, arr] of Object.entries(buckets)) {
    if (k === "_text" && Object.keys(buckets).length === 1) {
      // only text content
      return arr.join("");
    }
    result[k] = arr.length === 1 ? arr[0] : arr;
  }

  return result;
}

/** strip namespace prefix (e.g. "xsi:eventID" → "eventID") */
function stripNamespace(tag: string): string {
  const parts = tag.split(":");
  return parts[parts.length - 1];
}
