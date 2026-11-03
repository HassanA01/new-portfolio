import "server-only";
import { showProjects } from "@/lib/agent/server/tools/show-projects";
import { showResume } from "@/lib/agent/server/tools/show-resume";
import { showProfile } from "@/lib/agent/server/tools/show-profile";

/** Names are the stable contract shared with system.MD and the tool UI. */
export const portfolioTools = { showProjects, showResume, showProfile };
