import { NextRequest, NextResponse } from "next/server";
import { predictImageBuffer } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let fileName = "scan.jpg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: { message: "Berkas gambar tidak ditemukan dalam formulir." } },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = file.name || "scan.jpg";
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.dataUrl) {
        const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mime = matches[1] || "";
          buffer = Buffer.from(matches[2], "base64");
          fileName = mime.includes("png") ? "webcam.png" : mime.includes("webp") ? "webcam.webp" : "webcam.jpg";
        }
      }
    }

    if (!buffer) {
      return NextResponse.json(
        { error: { message: "Gambar tidak valid atau tidak terbaca." } },
        { status: 400 }
      );
    }

    // Call Python FastAPI AI microservice
    const result = await predictImageBuffer(buffer, fileName);

    const isFlood = result.label === "flood";
    const isReview = result.label === "review";
    const confidence = result.confidence ?? (isFlood ? result.probabilities?.flood : result.probabilities?.non_flood) ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        label: result.label,
        confidence: confidence,
        confidence_percent: Math.round(confidence * 100),
        prob_flood: result.probabilities?.flood ?? 0,
        prob_non_flood: result.probabilities?.non_flood ?? 0,
        inference_ms: result.inference_ms ?? 0,
        model_version: result.model_version,
        is_flood: isFlood,
        is_review: isReview,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[API AI Scan Error]:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AI_SERVICE_UNAVAILABLE",
          message:
            "Layanan AI Microservice (port 8000) belum terhubung atau sedang tidak aktif.",
          details: errorMsg,
        },
      },
      { status: 503 }
    );
  }
}
