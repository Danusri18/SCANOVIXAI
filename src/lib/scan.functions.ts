import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { analyze, chat, readImage } from "./scan.server";

export const analyzeContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ content: z.string().trim().min(1).max(8000) }).parse(data),
  )
  .handler(async ({ data }) => analyze(data.content));

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ imageDataUrl: z.string().min(30).max(8_000_000) }).parse(data),
  )
  .handler(async ({ data }) => readImage(data.imageDataUrl));

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(4000),
            }),
          )
          .min(1)
          .max(24),
      })
      .parse(data),
  )
  .handler(async ({ data }) => chat(data.messages));
