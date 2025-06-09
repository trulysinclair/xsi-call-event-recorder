import {exists} from "@std/fs";

const events = await Deno.readTextFile("tmp/events.json");

const callEventCounter = new Map<string, number>();
const callEventTypes = new Map<string, string>();
const eventTableData = new Set<{
  extTrackingId: string;
  targetId: string;
  count: number;
  type: string;
  remoteParty: {
    name?: string;
    address: string;
    callType: "Network" | "Group";
  };
}>();

for (const event of JSON.parse(events)) {
  if (event.eventData.hookStatus) {
    //   noop
  }

  if (event.eventData.call) {
    const extTrackingId = event.eventData.call.extTrackingId;
    const count = (callEventCounter.get(extTrackingId) || 0) + 1;

    callEventCounter.set(extTrackingId, count);
    callEventTypes.set(extTrackingId, event.type);

    eventTableData.add({
      extTrackingId,
      targetId: event.targetId,
      count: count,
      type: event.type,
      remoteParty: event.eventData.call.remoteParty,
    });
  }
}

const maxTargetIdWidth = Math.max(
  ...[...eventTableData.values()].map((e) => e.targetId.length),
);
const maxExtTrackingIdWidth = Math.max(
  ...[...eventTableData.values()].map((e) => e.extTrackingId.length),
);
const filePath = "tmp/call-trace.csv";
if (await exists(filePath)) {
  await Deno.remove(filePath);
}

const rowHeaders = [
  "ExtTrackingId",
  "TargetId",
  "Caller Type",
  "Caller Address",
  "Event Count",
  "Call Event Type",
];

await Deno.writeTextFile(filePath, rowHeaders.join(",") + "\n", {
  append: true,
});

for (
  const { extTrackingId, count, type, targetId, remoteParty } of eventTableData
    .values()
) {
  const rowParts = [
    extTrackingId.padEnd(maxExtTrackingIdWidth),
    targetId.padEnd(maxTargetIdWidth),
    remoteParty.callType.padEnd(7),
    remoteParty.address.padEnd(16),
    count,
    type.replace("Call", "Call ").replace("Event", ""),
  ];
  const row = rowParts.join(",") + "\n";

  await Deno.writeTextFile(filePath, row, { append: true });
}
