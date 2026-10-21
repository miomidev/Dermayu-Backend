import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { authorize, Roles } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const categoryParam = url.searchParams.get("category");

    const where: any = {};
    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }
    if (categoryParam && categoryParam !== "ALL") {
      where.category = { code: categoryParam };
    }

    const reports = await db.report.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        category: true,
        district: true,
        village: true,
        reporter: {
          select: { full_name: true, phone: true, email: true },
        },
        media: {
          include: { ai_prediction: true },
        },
      },
    });

    // Generate CSV content
    const csvHeaders = [
      "Kode Tiket",
      "Waktu Kejadian",
      "Kategori",
      "Judul Laporan",
      "Keparahan",
      "Ketinggian Air",
      "Status",
      "Kecamatan",
      "Desa/Kelurahan",
      "Alamat Lengkap",
      "Latitude",
      "Longitude",
      "Nama Pelapor",
      "Kontak Pelapor",
      "Validasi AI",
      "Confidence AI",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = reports.map((r) => {
      const pred = r.media?.[0]?.ai_prediction;
      const aiLabel = pred ? pred.label : "Tidak Ada";
      const aiConf = pred ? `${Math.round(pred.confidence * 100)}%` : "-";

      return [
        escapeCsv(r.ticket_code),
        escapeCsv(new Date(r.occurred_at || r.created_at).toISOString()),
        escapeCsv(r.category.name),
        escapeCsv(r.title),
        escapeCsv(r.severity),
        escapeCsv(r.water_level || "-"),
        escapeCsv(r.status),
        escapeCsv(r.district?.name || "-"),
        escapeCsv(r.village?.name || "-"),
        escapeCsv(r.address_text || "-"),
        escapeCsv(r.latitude),
        escapeCsv(r.longitude),
        escapeCsv(r.reporter.full_name),
        escapeCsv(r.reporter.phone || r.reporter.email || "-"),
        escapeCsv(aiLabel),
        escapeCsv(aiConf),
      ].join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\r\n");

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `rekap-laporan-dermayu-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /admin/export/reports error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal mengekspor data laporan" } },
      { status: 500 }
    );
  }
}
