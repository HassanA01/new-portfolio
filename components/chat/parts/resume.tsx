"use client";

export default function ResumePart({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="chat-resume-link" type="button" onClick={onOpen}>
      my résumé · us$5 ↗
    </button>
  );
}
