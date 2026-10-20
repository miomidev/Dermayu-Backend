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

  // 2. Seed Default Accounts
  const hashedPassword = await bcrypt.hash("AdminDermayu2026!", 12);
  const citizenPassword = await bcrypt.hash("WargaDermayu2026!", 12);

  // Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@dermayu.id" },
    update: {},
    create: {
      full_name: "Super Admin DERMAYU",
      email: "superadmin@dermayu.id",
      phone: "+6281234560001",
      password_hash: hashedPassword,
      role: "SUPERADMIN",
    },
  });

  // Admin Petugas
  await prisma.user.upsert({
    where: { email: "admin@dermayu.id" },
    update: {},
    create: {
      full_name: "Admin Operator Indramayu",
      email: "admin@dermayu.id",
      phone: "+6281234560002",
      password_hash: hashedPassword,
      role: "ADMIN",
    },
  });

  // Petugas Lapangan
  await prisma.user.upsert({
    where: { email: "petugas@dermayu.id" },
    update: {},
    create: {
      full_name: "Petugas TRC BPBD",
      email: "petugas@dermayu.id",
      phone: "+6281234560003",
      password_hash: hashedPassword,
      role: "OFFICER",
    },
  });

  // Contoh Warga
  await prisma.user.upsert({
    where: { email: "warga@dermayu.id" },
    update: {},
    create: {
      full_name: "Warga Indramayu",
      email: "warga@dermayu.id",
      phone: "+6281234560004",
      password_hash: citizenPassword,
      role: "CITIZEN",
    },
  });
  console.log("✅ Akun default berhasil di-seed (superadmin, admin, petugas, warga)");

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
      update: { name: dist.name },
      create: { code: dist.code, name: dist.name },
    });
  }
  console.log("✅ Data kecamatan Indramayu berhasil di-seed");

  // 4. Seed Emergency Contacts
  const emergencyContacts = [
    {
      name: "Pusdalops BPBD Kab. Indramayu",
      phone: "0234-274644",
      description: "Penanggulangan Bencana & Evakuasi",
      sort_order: 1,
    },
    {
      name: "Pemadam Kebakaran (Damkar) Indramayu",
      phone: "0234-272113",
      description: "Penyelamatan & Kebakaran",
      sort_order: 2,
    },
    {
      name: "PMI Kabupaten Indramayu",
      phone: "0234-271018",
      description: "Bantuan Medis, Ambulans & Darah",
      sort_order: 3,
    },
    {
      name: "Polres Indramayu (Call Center 110)",
      phone: "110",
      description: "Keamanan, Ketertiban & Laporan Darurat",
      sort_order: 4,
    },
    {
      name: "PSC 119 Indramayu Sehat",
      phone: "119",
      description: "Layanan Gawat Darurat Medis & Ambulans",
      sort_order: 5,
    },
  ];

  for (const ec of emergencyContacts) {
    const existing = await prisma.emergencyContact.findFirst({
      where: { name: ec.name },
    });
    if (!existing) {
      await prisma.emergencyContact.create({ data: ec });
    }
  }
  console.log("✅ Kontak darurat berhasil di-seed");

  // 5. Seed Titik Evakuasi Contoh
  const evacuationPoints = [
    {
      name: "GOR Singalodra Indramayu",
      address: "Jl. MT Haryono No. 1, Sindang, Kec. Indramayu",
      latitude: -6.3312000,
      longitude: 108.3245000,
      capacity: 1000,
      facilities: JSON.stringify(["Tenda Pengungsi", "Dapur Umum", "Toilet Portabel", "Posko Medis"]),
      contact_name: "Koordinator BPBD",
      contact_phone: "081234567890",
    },
    {
      name: "Pendopo Raden Bagus Aria Wiralodra",
      address: "Jl. Mayjen Sutoyo No. 1, Margadadi, Kec. Indramayu",
      latitude: -6.3268000,
      longitude: 108.3221000,
      capacity: 800,
      facilities: JSON.stringify(["Aula Utama", "Gudang Logistik", "Ambulans Siaga"]),
      contact_name: "Sekretariat Posko",
      contact_phone: "081234567891",
    },
  ];

  for (const ep of evacuationPoints) {
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
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
