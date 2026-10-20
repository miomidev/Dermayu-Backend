import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  return apiSuccess({
    name: "DERMAYU API Backend",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    regions: "Kabupaten Indramayu",
  });
}
