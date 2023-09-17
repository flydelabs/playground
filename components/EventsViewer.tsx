import { DebuggerEvent, DebuggerEventType } from "@flyde/core";
import React, { useMemo } from "react";

export interface EventsViewerProps {
  events: DebuggerEvent[];
  showAllEvents: boolean;
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

  return <div className="text-2xs text-slate-300 py-1">{timeString}</div>;
}

function EventTypeTag({ eventType }: { eventType: DebuggerEventType }) {
  const baseClass = `text-xs rounded-full px-2`;

  switch (eventType) {
    case DebuggerEventType.OUTPUT_CHANGE: {
      return <div className={`${baseClass} bg-orange-400 gap-2`}>Output</div>;
    }
    case DebuggerEventType.INPUT_CHANGE: {
      return <div className={`${baseClass} bg-blue-400 gap-2`}>Input</div>;
    }
    case DebuggerEventType.ERROR: {
      return <div className={`${baseClass} bg-red-400 gap-2`}>Error</div>;
    }
    case DebuggerEventType.PROCESSING_CHANGE: {
      return <div className={`${baseClass} bg-indigo-400 gap-2`}>PSC</div>;
    }
    case DebuggerEventType.INPUTS_STATE_CHANGE: {
      return <div className={`${baseClass} bg-teal-400 gap-2`}>ISC</div>;
    }
  }
}

function EventType({ event }: { event: DebuggerEvent }) {
  switch (event.type) {
    case DebuggerEventType.OUTPUT_CHANGE: {
      return (
        <React.Fragment>
          <span className="text-slate-300">Node</span>{" "}
          <strong>{event.nodeId} </strong>{" "}
          <span className="text-slate-300">pin </span>{" "}
          <strong>{event.pinId}</strong> emitted value
        </React.Fragment>
      );
    }
    case DebuggerEventType.INPUT_CHANGE: {
      return (
        <React.Fragment>
          <span className="text-slate-300">Node</span>{" "}
          <strong>{event.nodeId}</strong>{" "}
          <span className="text-slate-300">pin </span>{" "}
          <strong>{event.pinId}</strong> received value
        </React.Fragment>
      );
    }
    case DebuggerEventType.ERROR: {
      return (
        <React.Fragment>
          <span className="text-slate-300">Node</span>{" "}
          <strong>{event.nodeId}</strong> threw an error
        </React.Fragment>
      );
    }
    case DebuggerEventType.PROCESSING_CHANGE: {
      return (
        <React.Fragment>
          <span className="text-slate-300">Node</span>{" "}
          <strong>{event.nodeId}</strong> is now{" "}
          <strong>{event.val ? "running" : "idle"}</strong>
        </React.Fragment>
      );
    }
    case DebuggerEventType.INPUTS_STATE_CHANGE: {
      const pinAndCount = Object.entries(event.val).map(
        ([pinId, count], idx) => {
          return (
            <React.Fragment key={pinId}>
              <strong>{pinId}</strong>: {count}
              {idx !== Object.entries(event.val).length - 1 ? ", " : ""}
            </React.Fragment>
          );
        }
      );
      return (
        <React.Fragment>
          <span className="text-slate-300">Node</span>{" "}
          <strong>{event.nodeId}</strong> inputs queue changed -{" "}
          <span>{pinAndCount}</span>
        </React.Fragment>
      );
    }
  }
}

function EventItem({ event }: { event: DebuggerEvent }) {
  const [showValue, setShowValue] = React.useState(false);

  const maybeValueButton = useMemo(() => {
    if (
      (event.type === DebuggerEventType.INPUT_CHANGE ||
        event.type === DebuggerEventType.OUTPUT_CHANGE) &&
      !showValue
    ) {
      return (
        <button
          className="text-xs text-slate-400 hover:text-slate-300 group-hover:block hidden whitespace-nowrap"
          onClick={() => setShowValue(true)}
        >
          Show value
        </button>
      );
    }
  }, [event.type, showValue]);

  return (
    <div className="border-b gap-2 group px-3">
      <main className="flex items-center gap-2">
        <Timestamp timestamp={event.time} />
        <EventTypeTag eventType={event.type} />

        <div className="text-white text-xs font-light truncate">
          <EventType event={event} />
        </div>
        {maybeValueButton}
      </main>
      {showValue && (
        <div>
          <strong className="text-sm">Value:</strong>
          <br />
          <span className="text-slate-800 text-xs font-light bg-slate-100 inline-block">
            {JSON.stringify(event.val)}
          </span>
          <button
            className="text-xs text-slate-400 hover:text-slate-300 group-hover:block hidden whitespace-nowrap"
            onClick={() => setShowValue(false)}
          >
            Hide value
          </button>
        </div>
      )}
    </div>
  );
}

export function EventsViewer(props: EventsViewerProps) {
  const filtered = useMemo(() => {
    if (props.showAllEvents) {
      return props.events;
    }
    return props.events.filter((event) => {
      return (
        event.type !== DebuggerEventType.PROCESSING_CHANGE &&
        event.type !== DebuggerEventType.INPUTS_STATE_CHANGE
      );
    });
  }, [props.events, props.showAllEvents]);
  if (props.events.length === 0) {
    return (
      <div className="text-slate-400 py-8 px-8">
        Events from Flyde's debugger will appear here once you run the app.
      </div>
    );
  } else if (filtered.length === 0) {
    return (
      <div className="text-slate-400 py-8 px-8">
        No events found that match the selected filters
      </div>
    );
  } else {
    return (
      <div className="border-b text-slate-100 py-2">
        {filtered.map((event, i) => (
          <EventItem key={i} event={event} />
        ))}
      </div>
    );
  }
}
