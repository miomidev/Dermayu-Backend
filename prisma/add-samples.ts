import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function addSampleReports() {
  const citizen = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
  const floodCat = await prisma.reportCategory.findUnique({ where: { code: "FLOOD" } });
  const leveeCat = await prisma.reportCategory.findUnique({ where: { code: "LEVEE" } });
  const sindang = await prisma.district.findFirst({ where: { name: "Sindang" } });
  const indramayu = await prisma.district.findFirst({ where: { name: "Indramayu" } });

  if (!citizen || !floodCat || !leveeCat) {
    console.log("Prerequisites not met");
    return;
  }

  // Report 1: Flood - SUBMITTED with AI prediction (High confidence)
  await prisma.report.upsert({
    where: { ticket_code: "DMY-20261020-0001" },
    update: {},
    create: {
      ticket_code: "DMY-20261020-0001",
      reporter_id: citizen.id,
      category_id: floodCat.id,
      title: "Genangan banjir setinggi lutut di Jl. Raya Sindang",
      description: "Air luapan saluran irigasi meluap sejak pukul 04.30 subuh dan mulai masuk ke pemukiman warga serta jalan desa.",
      severity: "HIGH",
      water_level: "KNEE",
      latitude: new Prisma.Decimal(-6.3312000),
      longitude: new Prisma.Decimal(108.3245000),
      district_id: sindang?.id,
      address_text: "Jl. MT Haryono, Desa Sindang, Kec. Sindang",
      status: "SUBMITTED",
      media: {
        create: [
          {
            type: "IMAGE",
            storage_key: "sample-flood-1.jpg",
            url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
            mime_type: "image/jpeg",
            size_bytes: 524000,
            uploaded_by: citizen.id,
            ai_prediction: {
              create: {
                label: "flood",
                confidence: 0.9420,
                prob_flood: 0.9420,
                prob_non_flood: 0.0580,
                model_version: "cnn-flood-indramayu-0.1.0",
                inference_ms: 175,
                status: "DONE",
              },
            },
          },
        ],
      },
    },
  });

  // Report 2: Critical Flood
  await prisma.report.upsert({
    where: { ticket_code: "DMY-20261020-0002" },
    update: {},
    create: {
      ticket_code: "DMY-20261020-0002",
      reporter_id: citizen.id,
      category_id: floodCat.id,
      title: "Banjir setinggi dada akibat debit sungai Cimanuk naik",
      description: "Air terus naik dengan arus deras, warga butuh bantuan perahu karet untuk evakuasi lansia dan anak-anak.",
      severity: "CRITICAL",
      water_level: "ABOVE_CHEST",
      latitude: new Prisma.Decimal(-6.3268000),
      longitude: new Prisma.Decimal(108.3221000),
      district_id: indramayu?.id,
      address_text: "Blok Karanganyar, Kel. Margadadi, Kec. Indramayu",
      status: "SUBMITTED",
      media: {
        create: [
          {
            type: "IMAGE",
            storage_key: "sample-flood-2.jpg",
            url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
            mime_type: "image/jpeg",
            size_bytes: 612000,
            uploaded_by: citizen.id,
            ai_prediction: {
              create: {
                label: "flood",
                confidence: 0.9780,
                prob_flood: 0.9780,
                prob_non_flood: 0.0220,
                model_version: "cnn-flood-indramayu-0.1.0",
                inference_ms: 160,
                status: "DONE",
              },
            },
          },
        ],
      },
    },
  });

  // Report 3: Levee breach
  await prisma.report.upsert({
    where: { ticket_code: "DMY-20261020-0003" },
    update: {},
    create: {
      ticket_code: "DMY-20261020-0003",
      reporter_id: citizen.id,
      category_id: leveeCat.id,
      title: "Tanggul irigasi sekunder retak dan rembes",
      description: "Tanggul tanah penahan air saluran irigasi menunjukkan retakan sepanjang 10 meter, rawan jebol jika hujan lebat kembali turun.",
      severity: "MEDIUM",
      latitude: new Prisma.Decimal(-6.3400000),
      longitude: new Prisma.Decimal(108.3150000),
      district_id: sindang?.id,
      address_text: "Saluran Sekunder Desa Terusan, Kec. Sindang",
      status: "VERIFIED",
    },
  });

  console.log("✅ 3 Sample Reports Created Successfully!");
}

addSampleReports()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
