import path from "path";
import { promises as fs } from "fs";
import db from "./db";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const AI_INTERNAL_KEY = process.env.AI_INTERNAL_KEY || "internal_ai_secret_key_dermayu";

export async function triggerAiPrediction(mediaId: bigint, storageKey: string) {
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", storageKey);
    const fileBuffer = await fs.readFile(filePath);

    // Create a form data request
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, storageKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(`${AI_SERVICE_URL}/v1/predict`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_INTERNAL_KEY}`,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`AI Service responded with status: ${res.status}`);
    }

    const data = await res.json();

    // Save prediction result
    await db.aiPrediction.upsert({
      where: { media_id: mediaId },
      update: {
        label: data.label || "unknown",
        confidence: data.confidence ?? 0,
        prob_flood: data.probabilities?.flood ?? 0,
        prob_non_flood: data.probabilities?.non_flood ?? 0,
        model_version: data.model_version || "cnn-flood-0.1.0",
        inference_ms: data.inference_ms ?? null,
        status: "DONE",
      },
      create: {
        media_id: mediaId,
        label: data.label || "unknown",
        confidence: data.confidence ?? 0,
        prob_flood: data.probabilities?.flood ?? 0,
        prob_non_flood: data.probabilities?.non_flood ?? 0,
        model_version: data.model_version || "cnn-flood-0.1.0",
        inference_ms: data.inference_ms ?? null,
        status: "DONE",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[AI Service Warning] Failed prediction for media ${mediaId}:`, errorMsg);

    // Record failure gracefully
    await db.aiPrediction.upsert({
      where: { media_id: mediaId },
      update: {
        status: "FAILED",
        error_message: errorMsg.slice(0, 255),
      },
      create: {
        media_id: mediaId,
        label: "unknown",
        confidence: 0,
        prob_flood: 0,
        prob_non_flood: 0,
        model_version: "cnn-flood-pending",
        status: "FAILED",
        error_message: errorMsg.slice(0, 255),
      },
    });
  }
}
