/** Minimal provider wire fixtures for real SDK decoding and tool-loop tests. */
export function providerStream(provider, toolCall) {
  const input = JSON.stringify({ category: "AI/ML" });
  const events =
    provider === "anthropic"
      ? [
          {
            type: "message_start",
            message: {
              id: "msg-test",
              type: "message",
              role: "assistant",
              model: "test-model",
              content: [],
              stop_reason: null,
              stop_sequence: null,
              usage: { input_tokens: 10, output_tokens: 0 },
            },
          },
          {
            type: "content_block_start",
            index: 0,
            content_block: toolCall
              ? {
                  type: "tool_use",
                  id: "call-projects",
                  name: "showProjects",
                  input: {},
                }
              : { type: "text", text: "" },
          },
          {
            type: "content_block_delta",
            index: 0,
            delta: toolCall
              ? { type: "input_json_delta", partial_json: input }
              : { type: "text_delta", text: "here are my ai projects :)" },
          },
          { type: "content_block_stop", index: 0 },
          {
            type: "message_delta",
            delta: {
              stop_reason: toolCall ? "tool_use" : "end_turn",
              stop_sequence: null,
            },
            usage: { output_tokens: 10 },
          },
          { type: "message_stop" },
        ]
      : (() => {
          const item = toolCall
            ? {
                type: "function_call",
                status: "completed",
                id: "fc-test",
                call_id: "call-projects",
                name: "showProjects",
                arguments: input,
              }
            : {
                type: "message",
                id: "msg-test",
                role: "assistant",
                status: "completed",
                content: [
                  {
                    type: "output_text",
                    text: "here are my ai projects :)",
                    annotations: [],
                  },
                ],
              };
          return [
            {
              type: "response.created",
              response: {
                id: "resp-test",
                created_at: 0,
                model: "test-model",
                status: "in_progress",
              },
            },
            {
              type: "response.output_item.added",
              output_index: 0,
              item: toolCall
                ? { ...item, arguments: "" }
                : { ...item, content: [] },
            },
            ...(toolCall
              ? [
                  {
                    type: "response.function_call_arguments.delta",
                    output_index: 0,
                    item_id: "fc-test",
                    delta: input,
                  },
                  {
                    type: "response.function_call_arguments.done",
                    output_index: 0,
                    item_id: "fc-test",
                    arguments: input,
                  },
                ]
              : [
                  {
                    type: "response.content_part.added",
                    item_id: "msg-test",
                    output_index: 0,
                    content_index: 0,
                    part: { type: "output_text", text: "", annotations: [] },
                  },
                  {
                    type: "response.output_text.delta",
                    item_id: "msg-test",
                    output_index: 0,
                    content_index: 0,
                    delta: "here are my ai projects :)",
                  },
                  {
                    type: "response.output_text.done",
                    item_id: "msg-test",
                    output_index: 0,
                    content_index: 0,
                    text: "here are my ai projects :)",
                  },
                ]),
            { type: "response.output_item.done", output_index: 0, item },
            {
              type: "response.completed",
              response: {
                id: "resp-test",
                created_at: 0,
                model: "test-model",
                status: "completed",
                output: [item],
                usage: {
                  input_tokens: 10,
                  output_tokens: 10,
                  total_tokens: 20,
                },
              },
            },
          ];
        })();
  return new Response(
    events
      .map(
        (event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`,
      )
      .join(""),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
