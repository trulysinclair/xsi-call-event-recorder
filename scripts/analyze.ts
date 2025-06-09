const events = await Deno.readTextFile("tmp/events.json");

const callEventCounter = new Map<string, number>();
const callEventTypes = new Map<string, string>();
const eventTableData = new Set<{
  extTrackingId: string;
  targetId: string;
  count: number;
  type: string;
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
    });
  }
}

const maxTargetIdWidth = Math.max(
  ...[...eventTableData.values()].map((e) => e.targetId.length),
);
const maxExtTrackingIdWidth = Math.max(
  ...[...eventTableData.values()].map((e) => e.extTrackingId.length),
)

for (const {extTrackingId,count,type,targetId} of eventTableData.values()) {
  console.log(
    `[${targetId.padEnd(maxTargetIdWidth)}] ${extTrackingId.padEnd(maxExtTrackingIdWidth)} (${count}) -> ${type.replace("Call","Call ").replace("Event","")}`,
  );
}
