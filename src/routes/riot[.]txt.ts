import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/riot.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response("351e474b-64c7-4179-83da-05c5be196496", {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
