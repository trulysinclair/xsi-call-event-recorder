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
  personality:string;
  state:string;
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
      state: event.eventData.call.state,
      personality: event.eventData.call.personality
    });
  }
}

const maxWidth = (colName: string) => Math.max(
  ...[...eventTableData.values()].map((e) => e[colName].length),
)

const maxExtTrackingIdWidth = maxWidth("extTrackingId");
const maxTargetIdWidth = maxWidth("targetId");
const maxCallEventTypeWidth = maxWidth("type");

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
  "Call State",
  "Call Personality"
];

await Deno.writeTextFile(filePath, rowHeaders.join(",") + "\n", {
  append: true,
});

for (
  const { extTrackingId, count, type, targetId, remoteParty,state,personality } of eventTableData
    .values()
) {
  const rowParts = [
    extTrackingId.padEnd(maxExtTrackingIdWidth),
    targetId.padEnd(maxTargetIdWidth),
    remoteParty.callType.padEnd(7),
    remoteParty.address.padEnd(42),
    count,
    type.replace("Call", "Call ").replace("Event", "").padEnd(maxCallEventTypeWidth),
    personality, state
  ];
  const row = rowParts.join(",") + "\n";

  await Deno.writeTextFile(filePath, row, { append: true });
}
