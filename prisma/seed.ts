import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { scoreNeedAgainstExpert, scoreNeedAgainstSupply } from "../lib/matching";

// All data below is clearly-labeled DEMO data for the Phase-1 pilot sandbox.
// It is NOT the real membership figures cited in the proposal (those are
// flagged in the proposal itself as unverified survey snapshots) — do not
// treat this seed as production data.

async function main() {
  console.log("Seeding VI CONNECT demo data...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ---- Organizations ----
  const vast = await db.organization.create({
    data: {
      name: "Viện Hàn lâm Khoa học và Công nghệ Việt Nam (VAST) — Ban điều hành VI CONNECT",
      shortName: "VAST",
      type: "CO_QUAN_QUAN_LY",
      status: "ACTIVE",
      province: "Hà Nội",
      description: "Đơn vị chủ trì nền tảng VI CONNECT.",
    },
  });

  const hoiHaNoi = await db.organization.create({
    data: {
      name: "Liên hiệp Hội Khoa học và Kỹ thuật TP. Hà Nội (demo)",
      shortName: "LHH Hà Nội",
      type: "HOI_THANH_VIEN",
      status: "ACTIVE",
      province: "Hà Nội",
      description: "Hội thành viên thí điểm Giai đoạn 1 (dữ liệu demo).",
    },
  });

  const hoiCaoBang = await db.organization.create({
    data: {
      name: "Liên hiệp Hội Khoa học và Kỹ thuật tỉnh Cao Bằng (demo)",
      shortName: "LHH Cao Bằng",
      type: "HOI_THANH_VIEN",
      status: "ACTIVE",
      province: "Cao Bằng",
      description: "Hội thành viên thí điểm Giai đoạn 1 (dữ liệu demo).",
    },
  });

  await db.organization.create({
    data: {
      name: "Trung tâm Đổi mới sáng tạo công nghệ cao (HTIC)",
      shortName: "HTIC",
      type: "TO_CHUC_KHCN",
      status: "ACTIVE",
      province: "Hà Nội",
      parentId: vast.id,
      description: "Đơn vị đề xuất và vận hành kỹ thuật VI CONNECT.",
    },
  });

  const enterprise = await db.organization.create({
    data: {
      name: "Công ty CP Công nghệ Xanh Việt (demo)",
      shortName: "GreenTech VN",
      type: "DOANH_NGHIEP",
      status: "ACTIVE",
      province: "TP. Hồ Chí Minh",
      description: "Doanh nghiệp đối tác thí điểm (dữ liệu demo).",
    },
  });

  // ---- Users ----
  const vastAdmin = await db.user.create({
    data: {
      email: "admin@vi-connect.demo",
      name: "Quản trị viên VAST (demo)",
      passwordHash,
      role: "SUPERADMIN",
      organizationId: vast.id,
    },
  });

  const hoiAdmin = await db.user.create({
    data: {
      email: "hoihanoi@vi-connect.demo",
      name: "Cán bộ đầu mối LHH Hà Nội (demo)",
      passwordHash,
      role: "ADMIN",
      organizationId: hoiHaNoi.id,
    },
  });

  const enterpriseUser = await db.user.create({
    data: {
      email: "doanhnghiep@vi-connect.demo",
      name: "Đại diện GreenTech VN (demo)",
      passwordHash,
      role: "ENTERPRISE",
      organizationId: enterprise.id,
    },
  });

  const expertUsers = await Promise.all(
    [
      {
        email: "chuyengia1@vi-connect.demo",
        name: "Nguyễn Văn A (demo)",
        org: hoiHaNoi.id,
        title: "TS.",
        fields: ["ai_ml", "cntt"],
        skills: ["computer vision", "deep learning", "python"],
        bio: "Chuyên gia AI ứng dụng trong xử lý ảnh và giám sát môi trường.",
        experienceYears: 12,
        verificationStatus: "VERIFIED" as const,
      },
      {
        email: "chuyengia2@vi-connect.demo",
        name: "Trần Thị B (demo)",
        org: hoiHaNoi.id,
        title: "PGS.TS.",
        fields: ["moi_truong", "do_luong"],
        skills: ["quan trắc môi trường", "cảm biến", "phân tích nước thải"],
        bio: "20 năm nghiên cứu quan trắc và xử lý nước thải công nghiệp.",
        experienceYears: 20,
        verificationStatus: "VERIFIED" as const,
      },
      {
        email: "chuyengia3@vi-connect.demo",
        name: "Lê Văn C (demo)",
        org: hoiCaoBang.id,
        title: "ThS.",
        fields: ["nong_nghiep", "sinh_hoc"],
        skills: ["nông nghiệp công nghệ cao", "giống cây trồng"],
        bio: "Ứng dụng công nghệ sinh học trong chọn tạo giống cây trồng.",
        experienceYears: 8,
        verificationStatus: "PENDING" as const,
      },
      {
        email: "chuyengia4@vi-connect.demo",
        name: "Phạm Thị D (demo)",
        org: hoiCaoBang.id,
        title: "TS.",
        fields: ["vat_lieu", "co_khi_tu_dong"],
        skills: ["vật liệu composite", "cơ khí chính xác"],
        bio: "Nghiên cứu vật liệu composite ứng dụng trong cơ khí chế tạo.",
        experienceYears: 10,
        verificationStatus: "VERIFIED" as const,
      },
    ].map((e) =>
      db.user.create({
        data: {
          email: e.email,
          name: e.name,
          passwordHash,
          role: "EXPERT",
          organizationId: e.org,
          expertProfile: {
            create: {
              organizationId: e.org,
              title: e.title,
              bio: e.bio,
              fields: e.fields,
              skills: e.skills,
              experienceYears: e.experienceYears,
              verificationStatus: e.verificationStatus,
              publications: Math.floor(Math.random() * 20) + 1,
              patents: Math.floor(Math.random() * 3),
            },
          },
        },
        include: { expertProfile: true },
      })
    )
  );

  console.log(
    `Created ${[vastAdmin, hoiAdmin, enterpriseUser, ...expertUsers].length} users.`
  );

  // ---- Supplies (technology on offer) ----
  await db.supply.create({
    data: {
      title: "Hệ thống giám sát chất lượng nước thải bằng cảm biến IoT",
      description:
        "Giải pháp cảm biến IoT quan trắc tự động chỉ tiêu nước thải công nghiệp theo thời gian thực.",
      type: "TECHNOLOGY",
      fields: ["moi_truong", "do_luong"],
      trl: 6,
      organizationId: hoiHaNoi.id,
      status: "PUBLISHED",
    },
  });

  await db.supply.create({
    data: {
      title: "Mô hình AI phát hiện sâu bệnh trên cây trồng qua ảnh vệ tinh",
      description:
        "Ứng dụng thị giác máy tính và học sâu để phát hiện sớm sâu bệnh trên cây trồng.",
      type: "SOLUTION",
      fields: ["ai_ml", "nong_nghiep"],
      trl: 5,
      organizationId: hoiHaNoi.id,
      status: "PUBLISHED",
    },
  });

  // ---- Needs (from enterprise) ----
  const need1 = await db.need.create({
    data: {
      title: "Cần giải pháp giám sát chất lượng nước thải nhà máy theo thời gian thực",
      description:
        "Nhà máy cần hệ thống quan trắc tự động, cảnh báo sớm khi chỉ tiêu vượt ngưỡng cho phép.",
      fields: ["moi_truong", "do_luong"],
      organizationId: enterprise.id,
      budgetVnd: BigInt(800_000_000),
      status: "PUBLISHED",
    },
  });

  const need2 = await db.need.create({
    data: {
      title: "Tìm chuyên gia tư vấn ứng dụng AI trong nông nghiệp công nghệ cao",
      description:
        "Cần chuyên gia hỗ trợ xây dựng mô hình phát hiện sâu bệnh sớm bằng AI cho vùng trồng rau an toàn.",
      fields: ["ai_ml", "nong_nghiep"],
      organizationId: enterprise.id,
      status: "PUBLISHED",
    },
  });

  // ---- Matches (computed via the real scoring engine, not hard-coded) ----
  const expertProfiles = await db.expertProfile.findMany();

  async function createMatchesForNeed(need: typeof need1) {
    const supplies = await db.supply.findMany({ where: { status: "PUBLISHED" } });
    for (const supply of supplies) {
      const { score, reasons } = scoreNeedAgainstSupply(need, supply);
      if (score > 0.15) {
        await db.match.create({
          data: { needId: need.id, supplyId: supply.id, score, reasons, stage: "SUGGESTED" },
        });
      }
    }
    for (const expert of expertProfiles) {
      const { score, reasons } = scoreNeedAgainstExpert(need, expert);
      if (score > 0.15) {
        await db.match.create({
          data: {
            needId: need.id,
            expertProfileId: expert.id,
            score,
            reasons,
            stage: "SUGGESTED",
          },
        });
      }
    }
  }

  await createMatchesForNeed(need1);
  await createMatchesForNeed(need2);

  // Accept one match and turn it into a project, to seed the EXECUTE layer.
  const bestMatch = await db.match.findFirst({
    where: { needId: need1.id },
    orderBy: { score: "desc" },
  });

  if (bestMatch) {
    await db.match.update({ where: { id: bestMatch.id }, data: { stage: "CONVERTED_PROJECT" } });
    const project = await db.project.create({
      data: {
        matchId: bestMatch.id,
        title: "Triển khai hệ thống giám sát nước thải — GreenTech VN",
        summary: "Dự án thí điểm chuyển từ ghép nối need1 sang triển khai thực tế.",
        status: "ACTIVE",
        milestones: {
          create: [
            { title: "Khảo sát hiện trạng & thiết kế hệ thống", status: "ACCEPTED" },
            { title: "Lắp đặt cảm biến & tích hợp dashboard", status: "IN_PROGRESS" },
            { title: "Nghiệm thu & bàn giao", status: "PLANNED" },
          ],
        },
        agreement: {
          create: {
            type: "SERVICE_CONTRACT",
            status: "SIGNED",
            valueVnd: BigInt(800_000_000),
            signedAt: new Date(),
          },
        },
      },
    });
    console.log("Seeded 1 project from an accepted match:", project.title);
  }

  // ---- Challenge bank ----
  const challenge = await db.challenge.create({
    data: {
      title: "Bài toán: Giảm thất thoát nước sạch tại hệ thống cấp nước đô thị",
      problem:
        "Tỷ lệ thất thoát nước sạch tại một số khu vực đô thị vượt 25%, cần giải pháp phát hiện rò rỉ sớm.",
      goal: "Giảm tỷ lệ thất thoát nước xuống dưới 15% trong 12 tháng.",
      fields: ["moi_truong", "do_luong", "cntt"],
      trl: 4,
      hasBudget: true,
      budgetVnd: BigInt(1_200_000_000),
      organizationId: enterprise.id,
      status: "PUBLISHED",
    },
  });

  await db.solution.create({
    data: {
      challengeId: challenge.id,
      submittedById: expertUsers[0].id,
      summary: "Ứng dụng cảm biến áp lực + AI dự đoán điểm rò rỉ trên mạng lưới cấp nước.",
      approach:
        "Lắp đặt cảm biến áp lực tại các nút mạng, huấn luyện mô hình phát hiện bất thường theo chuỗi thời gian.",
      status: "SHORTLISTED",
      reviewScore: 0.82,
    },
  });

  // ---- KPI snapshot ----
  const [connectCount, matchCount, projectCountAgg] = await Promise.all([
    db.expertProfile.count(),
    db.match.count(),
    db.agreement.aggregate({ _sum: { valueVnd: true } }),
  ]);

  await db.kpiSnapshot.create({
    data: {
      connectCount,
      matchCount,
      mobilizeVnd: projectCountAgg._sum.valueVnd ?? BigInt(0),
      impactCount: 0,
      raw: { note: "seed snapshot" },
    },
  });

  console.log("Seed complete.");
  console.log("Demo login: admin@vi-connect.demo / Password123!");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
