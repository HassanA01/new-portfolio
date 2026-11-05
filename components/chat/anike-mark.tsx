"use client";

import { useId } from "react";
import RobotIcon from "@/components/ui/robot-icon";

/** Robot in the nav's Agent gradient, with the name beside it in plain ink. */
export default function AnikeMark() {
  const id = useId();
  return (
    <span className="chat-brand">
      <RobotIcon
        className="agent-link-icon"
        size={18}
        strokeWidth={1.7}
        stroke={`url(#${id})`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff87ae" />
            <stop offset="100%" stopColor="#f5c768" />
          </linearGradient>
        </defs>
      </RobotIcon>
      <span>Anike</span>
    </span>
  );
}
