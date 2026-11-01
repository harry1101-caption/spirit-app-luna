import type { Metadata } from "next";

/**
 * SEO dùng chung: domain, title/description từng trang, canonical, Open Graph
 * và JSON-LD. Thêm trang mới → thêm một mục vào `PAGES` là đủ (sitemap tự cập nhật).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://lunara.haohn.tech").replace(/\/$/, "");
export const SITE_NAME = "Lunara";
export const OG_IMAGE = "/og.jpg";

type PageSeo = {
  path: string;
  /** Title không kèm " · Lunara" (template ở layout tự thêm) */
  title: string;
  description: string;
  /** Tên công cụ cho schema WebApplication */
  appName?: string;
  priority: number;
};

export const PAGES = {
  home: {
    path: "/",
    title: "Lunara: Tarot, Tử Vi, Thần số học và hơn 15 cách hiểu mình",
    description:
      "Xem Tarot cùng AI, lập lá số Tử Vi, tra Thần số học, xin xăm, gieo quẻ Kinh Dịch và nhiều trải nghiệm tâm linh khác. Diễn giải dễ hiểu, không phán xét, không cần tài khoản.",
    priority: 1,
  },
  tarot: {
    path: "/tarot",
    title: "Xem Tarot online cùng AI: rút 3 lá miễn phí",
    description:
      "Đặt câu hỏi về tình cảm, công việc hay một quyết định, rút 3 lá Tarot (bộ Rider–Waite 78 lá) và đọc diễn giải AI dành riêng cho câu chuyện của bạn.",
    appName: "Xem Tarot cùng AI",
    priority: 0.9,
  },
  "tu-vi": {
    path: "/tu-vi",
    title: "Lập lá số Tử Vi online: luận giải 12 cung, đại vận, tiểu vận",
    description:
      "Nhập ngày giờ sinh để lập lá số Tử Vi Đẩu Số đầy đủ 12 cung, an sao ngay trong Lunara, kèm luận giải theo năm xem và các lĩnh vực đời sống.",
    appName: "Lập lá số Tử Vi",
    priority: 0.9,
  },
  "than-so-hoc": {
    path: "/than-so-hoc",
    title: "Thần số học: tính 6 con số theo họ tên và ngày sinh",
    description:
      "Tra Thần số học Pythagoras miễn phí: số Đường Đời, Linh Hồn, Nhân Cách, Vận Mệnh… hiện rõ từng bước tính và ý nghĩa của từng con số.",
    appName: "Tra Thần số học",
    priority: 0.9,
  },
  "phac-hoa": {
    path: "/phac-hoa",
    title: "Phác hoạ người ấy: vẽ chân dung người yêu tương lai bằng AI",
    description:
      "Từ họ tên, ngày sinh và cung hoàng đạo của bạn, Lunara phác hoạ bằng nét chì gương mặt người dành cho bạn. Tải ảnh chân dung để tìm người hợp tướng.",
    appName: "Phác hoạ người ấy",
    priority: 0.8,
  },
  "chiem-tinh": {
    path: "/chiem-tinh",
    title: "Chiêm tinh hằng ngày: thông điệp hôm nay theo 12 cung hoàng đạo",
    description:
      "Chọn cung hoàng đạo hoặc nhập ngày sinh để nhận thông điệp trong ngày về tình yêu, sự nghiệp và cuộc sống, viết bằng lời thường.",
    appName: "Chiêm tinh hằng ngày",
    priority: 0.8,
  },
  lenormand: {
    path: "/lenormand",
    title: "Bói bài Lenormand online: trải 3 lá và đọc biểu tượng",
    description:
      "Rút 3 lá Lenormand cho câu hỏi của bạn và đọc ý nghĩa những biểu tượng đời thường qua diễn giải dễ hiểu.",
    appName: "Bói bài Lenormand",
    priority: 0.7,
  },
  "bat-tu": {
    path: "/bat-tu",
    title: "Xem Bát Tự (Tứ Trụ) theo ngày giờ sinh",
    description:
      "Lập Bát Tự từ ngày giờ sinh: bốn trụ năm, tháng, ngày, giờ, ngũ hành vượng suy và đại vận, giải thích bằng lời thường.",
    appName: "Xem Bát Tự",
    priority: 0.7,
  },
  "human-design": {
    path: "/human-design",
    title: "Human Design: xem bản đồ năng lượng của bạn",
    description:
      "Tìm hiểu kiểu Human Design, chiến lược và thẩm quyền của bạn từ ngày giờ sinh và múi giờ nơi sinh, diễn giải dễ hiểu cho người mới.",
    appName: "Human Design",
    priority: 0.7,
  },
  "chi-tay": {
    path: "/chi-tay",
    title: "Xem chỉ tay online: đọc các đường trên bàn tay",
    description:
      "Quan sát đường sinh đạo, trí đạo, tâm đạo và các dấu hiệu trên bàn tay của bạn với hướng dẫn từng bước và lời giải thích dễ hiểu.",
    appName: "Xem chỉ tay",
    priority: 0.7,
  },
  "giac-mo": {
    path: "/giac-mo",
    title: "Giải mã giấc mơ: ý nghĩa các biểu tượng trong mơ",
    description:
      "Kể lại giấc mơ của bạn, Lunara dò các biểu tượng và gợi ý ý nghĩa liên quan tới cảm xúc và đời sống hiện tại. Giấc mơ không phải điềm báo.",
    appName: "Giải mã giấc mơ",
    priority: 0.7,
  },
  "xin-xam": {
    path: "/xin-xam",
    title: "Xin xăm Quan Âm online: một lời gợi mở cho câu hỏi của bạn",
    description:
      "Thành tâm đặt câu hỏi và xin một quẻ xăm Quan Âm, kèm lời giải gần gũi, để có thêm một góc nhìn cho điều bạn đang bận lòng.",
    appName: "Xin xăm Quan Âm",
    priority: 0.7,
  },
  "kinh-dich": {
    path: "/kinh-dich",
    title: "Gieo quẻ Kinh Dịch online: giải 64 quẻ",
    description:
      "Gieo một quẻ Kinh Dịch cho câu hỏi của bạn, xem quẻ chủ, hào động và lời giải dễ hiểu về ý nghĩa của quẻ.",
    appName: "Gieo quẻ Kinh Dịch",
    priority: 0.7,
  },
  "tinh-cach": {
    path: "/tinh-cach",
    title: "Trắc nghiệm tính cách: 15 câu hỏi hiểu khuynh hướng của bạn",
    description:
      "15 câu hỏi ngắn giúp bạn nhìn rõ 5 khuynh hướng tính cách hiện tại, kèm biểu đồ và gợi ý. Bài tự khám phá, chưa phải thang đo tâm lý đã kiểm định.",
    appName: "Trắc nghiệm tính cách",
    priority: 0.6,
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof PAGES;

/** Metadata đầy đủ cho một trang: title, description, canonical, Open Graph, Twitter */
export function pageMetadata(key: PageKey): Metadata {
  const page: PageSeo = PAGES[key];
  const isHome = key === "home";
  return {
    // Trang chủ dùng title đầy đủ, không qua template " · Lunara"
    title: isHome ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      url: page.path,
      title: isHome ? page.title : `${page.title} · ${SITE_NAME}`,
      description: page.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Lunara — Hành trình nội tâm" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isHome ? page.title : `${page.title} · ${SITE_NAME}`,
      description: page.description,
      images: [OG_IMAGE],
    },
  };
}

/** JSON-LD WebApplication cho từng công cụ */
export function toolJsonLd(key: Exclude<PageKey, "home">) {
  const page: PageSeo = PAGES[key];
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: page.appName,
    url: `${SITE_URL}${page.path}`,
    description: page.description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: "vi",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/** JSON-LD toàn site: WebSite + Organization */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: "Lunara — Hành trình nội tâm",
      url: SITE_URL,
      inLanguage: "vi",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
    },
  ],
};
