import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database DERMAYU...");

  // 1. Seed Report Categories
  const categories = [
    { code: "FLOOD", name: "Banjir / Genangan Air", icon: "waves", requires_ai: true },
    { code: "LEVEE", name: "Tanggul / Saluran Jebol", icon: "shield-alert", requires_ai: false },
    { code: "DRAINAGE", name: "Drainase / Gorong Tersumbat", icon: "activity", requires_ai: false },
    { code: "ROAD", name: "Jalan Rusak / Tergenang", icon: "alert-triangle", requires_ai: false },
    { code: "TREE", name: "Pohon Tumbang", icon: "tree-pine", requires_ai: false },
    { code: "OTHER", name: "Aduan Wilayah Lainnya", icon: "more-horizontal", requires_ai: false },
  ];

  for (const cat of categories) {
    await prisma.reportCategory.upsert({
      where: { code: cat.code },
      update: cat,
      create: cat,
    });
  }
  console.log("✅ Kategori aduan berhasil di-seed");

  // 2. Seed Default Accounts (3 Peran: SUPERADMIN, OFFICER, CITIZEN)
  const hashedPassword = await bcrypt.hash("AdminDermayu2026!", 12);
  const citizenPassword = await bcrypt.hash("WargaDermayu2026!", 12);

  // Super Admin (Akses Web Admin & Komando Penuh)
  await prisma.user.upsert({
    where: { email: "superadmin@dermayu.id" },
    update: {
      role: "SUPERADMIN",
    },
    create: {
      full_name: "Super Admin DERMAYU",
      email: "superadmin@dermayu.id",
      phone: "+6281234560001",
      password_hash: hashedPassword,
      role: "SUPERADMIN",
    },
  });

  // Petugas Lapangan (Akses Portal Tugas Lapangan, Bukti & Telemetri)
  await prisma.user.upsert({
    where: { email: "petugas@dermayu.id" },
    update: {
      role: "OFFICER",
    },
    create: {
      full_name: "Petugas TRC BPBD",
      email: "petugas@dermayu.id",
      phone: "+6281234560003",
      password_hash: hashedPassword,
      role: "OFFICER",
    },
  });

  // Contoh Warga (Akses Pelaporan, Status Aduan & Titik Evakuasi)
  await prisma.user.upsert({
    where: { email: "warga@dermayu.id" },
    update: {
      role: "CITIZEN",
    },
    create: {
      full_name: "Warga Indramayu",
      email: "warga@dermayu.id",
      phone: "+6281234560004",
      password_hash: citizenPassword,
      role: "CITIZEN",
    },
  });
  console.log("✅ Akun default berhasil di-seed (3 Role: superadmin, petugas, warga)");

  // 3. Seed Districts (Kecamatan Utama Indramayu)
  const districts = [
    { code: "32.12.01", name: "Indramayu" },
    { code: "32.12.02", name: "Sindang" },
    { code: "32.12.03", name: "Cantigi" },
    { code: "32.12.04", name: "Pasekan" },
    { code: "32.12.05", name: "Balongan" },
    { code: "32.12.06", name: "Juntinyuat" },
    { code: "32.12.07", name: "Jatibarang" },
    { code: "32.12.08", name: "Losarang" },
    { code: "32.12.09", name: "Kandanghaur" },
    { code: "32.12.10", name: "Haurgeulis" },
  ];

  for (const dist of districts) {
    await prisma.district.upsert({
      where: { code: dist.code },
      update: dist,
      create: dist,
    });
  }
  console.log("✅ Data kecamatan Indramayu berhasil di-seed");

  // 4. Seed Emergency Contacts
  const contacts = [
    { name: "Pusdalops BPBD Indramayu", phone: "0234-272444", description: "Layanan Darurat Bencana 24 Jam", sort_order: 1 },
    { name: "Damkar Indramayu", phone: "0234-274113", description: "Pemadam Kebakaran & Penyelamatan", sort_order: 2 },
    { name: "PMI Kabupaten Indramayu", phone: "0234-272211", description: "Layanan Ambulans & Donor Darah", sort_order: 3 },
    { name: "Polres Indramayu", phone: "110", description: "Kepolisian Resor Indramayu", sort_order: 4 },
  ];

  for (const c of contacts) {
    const existing = await prisma.emergencyContact.findFirst({
      where: { name: c.name },
    });
    if (!existing) {
      await prisma.emergencyContact.create({ data: c });
    }
  }
  console.log("✅ Kontak darurat berhasil di-seed");

  // 5. Seed Evacuation Points
  const sindang = await prisma.district.findFirst({ where: { name: "Sindang" } });
  const indramayu = await prisma.district.findFirst({ where: { name: "Indramayu" } });
  const kandanghaur = await prisma.district.findFirst({ where: { name: "Kandanghaur" } });

  const evacPoints = [
    {
      name: "GOR Singalodra Sindang",
      address: "Jl. Mayor Dasuki No. 12, Sindang",
      latitude: -6.3354000,
      longitude: 108.3182000,
      district_id: sindang?.id,
      capacity: 500,
      facilities: JSON.stringify(["Tenda Pengungsi", "Dapur Umum", "Toilet Portabel", "Posko Medis", "Genset Darurat"]),
      contact_name: "Bripka Hartono",
      contact_phone: "081234567890",
    },
    {
      name: "Gedung Juang Indramayu",
      address: "Jl. Veteran No. 5, Indramayu",
      latitude: -6.3278000,
      longitude: 108.3241000,
      district_id: indramayu?.id,
      capacity: 350,
      facilities: JSON.stringify(["Aula Tertutup", "Dapur Umum", "Ambulans Siaga", "Air Bersih PDAM"]),
      contact_name: "Sertu Bambang",
      contact_phone: "081298765432",
    },
    {
      name: "Balai Desa Eretan Wetan Kandanghaur",
      address: "Jl. Raya Pantura Eretan Wetan, Kandanghaur",
      latitude: -6.3120000,
      longitude: 108.1560000,
      district_id: kandanghaur?.id,
      capacity: 250,
      facilities: JSON.stringify(["Dapur Umum BPBD", "Perahu Karet Evakuasi", "Posko Kesehatan"]),
      contact_name: "Pak Kuwu Eretan",
      contact_phone: "081345678901",
    },
  ];

  for (const ep of evacPoints) {
    const existing = await prisma.evacuationPoint.findFirst({
      where: { name: ep.name },
    });
    if (!existing) {
      await prisma.evacuationPoint.create({ data: ep });
    }
  }
  console.log("✅ Titik evakuasi berhasil di-seed");

  console.log("🎉 Seeding database DERMAYU selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
