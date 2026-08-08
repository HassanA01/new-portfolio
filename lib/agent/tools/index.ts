import { getResume, name as getResumeName } from "./get-resume";
import { navigateSite, name as navigateSiteName } from "./navigate-site";
import {
  searchBackground,
  name as searchBackgroundName,
} from "./search-background";
import {
  makeSendMessageTool,
  name as sendMessageName,
} from "./send-message-to-aneeq";

export function buildAgentTools(ctx: { ip: string }) {
  return {
    [searchBackgroundName]: searchBackground,
    [sendMessageName]: makeSendMessageTool(ctx),
    [navigateSiteName]: navigateSite,
    [getResumeName]: getResume,
  };
}
