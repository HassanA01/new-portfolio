"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ProjectCard, type Project } from "@/components/ProjectCard";

export default function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!project) return;
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [project]);
  if (!project) return null;
  return (
    <dialog
      ref={dialog}
      className="project-detail-modal"
      aria-label={`${project.title} details`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="checkout-close project-detail-close"
        aria-label="Close project details"
        onClick={onClose}
      >
        <X size={17} aria-hidden="true" />
      </button>
      <ProjectCard project={project} detail />
    </dialog>
  );
}
