import { SidePane } from "./SidePane";
import React from "react";
import { Timestamp } from "../Utils/Timestamp";

export interface OutputEvent {
  value: string;
  key: string;
  timestamp: number;
}
export interface OutputViewerStringProps {
  events: { value: string; timestamp: number }[];
  clearEvents: () => void;
}

export function OutputViewerString(props: OutputViewerStringProps) {
  const { events, clearEvents } = props;

  const header = (
    <React.Fragment>
      <span className="font-semibold">Output </span>
      <button
        onClick={() => clearEvents()}
        className="justify-end justify-items-end content-end ml-auto text-sm"
      >
        Clear
      </button>
    </React.Fragment>
  );

  const eventItems = events.map((ev, idx) => {
    return (
      <div className="my-0 flex flex-row py-0.5 px-3" key={idx}>
        <Timestamp timestamp={ev.timestamp} />{" "}
        <div className="ml-1">{ev.value}</div>
      </div>
    );
  });

  const inner =
    events.length === 0 ? (
      <div className="text-slate-400 py-8 px-8">
        Values sent to main output pins will appear here
      </div>
    ) : (
      <div className="flex flex-col flex-1">{eventItems}</div>
    );

  return <SidePane header={header}>{inner}</SidePane>;
}
