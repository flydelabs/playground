import { DebuggerEvent, DebuggerEventType } from "@flyde/core";

export interface EventsViewerProps {
  events: DebuggerEvent[];
}

function padZero(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

const padZero2 = (num: number) => padZero(num, 2);
const padZero3 = (num: number) => padZero(num, 3);

function Timestamp({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  // format date into HH:MM:SS.mmm
  const timeString = `${padZero2(date.getHours())}:${padZero2(
    date.getMinutes()
  )}:${padZero2(date.getSeconds())}.${padZero3(date.getMilliseconds())}`;

  return <div className="text-2xs text-slate-100 py-1 px-4">{timeString}</div>;
}

function eventText(event: DebuggerEvent) {
  switch (event.type) {
    case DebuggerEventType.OUTPUT_CHANGE:
    case DebuggerEventType.INPUT_CHANGE: {
      const { insId, nodeId, pinId } = event;
      const verb =
        event.type === DebuggerEventType.OUTPUT_CHANGE ? "sent" : "received";
      return (
        <span>
          Node {nodeId} pin {pinId} received
        </span>
      );
    }
    default: {
      return <span>Unknown event type</span>;
    }
  }
}

function EventItem({ event }: { event: DebuggerEvent }) {
  return (
    <div className="flex items-center gap-2 border-b">
      <Timestamp timestamp={event.time} />
      <div className="text-sm text-slate-100 py-1 px-4">{event.type}</div>
      <div className="text-sm text-slate-100 py-1 px-4">{eventText(event)}</div>
    </div>
  );
}

export function EventsViewer(props: EventsViewerProps) {
  return (
    <div className="border-b">
      {props.events.map((event, i) => (
        <EventItem key={i} event={event} />
      ))}
    </div>
  );
}
