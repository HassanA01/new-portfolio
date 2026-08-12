"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { useAgentPalette } from "./AgentChatProvider";

export function AskAgentButton() {
  const { openChat, agentOnline } = useAgentPalette();
  return (
    <GlassButton onClick={() => openChat()} disabled={!agentOnline} disabledHint="Agent warming up">
      Ask my agent
    </GlassButton>
  );
}
