/**
 * Bài tra cứu nổi bật cho trang chủ và footer. Cố ý chép tay vài tiêu đề thay vì import
 * content/*: trang chủ là client component, import nội dung bài vào sẽ kéo cả trăm KB
 * chữ xuống trình duyệt chỉ để in vài cái link. Danh sách đầy đủ ở /tra-cuu (server).
 *
 * Slug phải khớp content/*; tests/library.test.mjs kiểm tra điều này.
 */

export type LibraryLink = { title: string; href: string };

export type LibrarySection = {
  id: string;
  title: string;
  description: string;
  /** Trang tổng của loại bài này */
  href: string;
  featured: LibraryLink[];
};

export const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: "tu-vi-2027",
    title: "Tử vi 2027 theo tuổi",
    description: "Năm Đinh Mùi của 12 con giáp: công việc, tiền bạc, tình cảm.",
    href: "/tu-vi-2027",
    featured: [
      { title: "Tuổi Tý", href: "/tu-vi-2027/tuoi-ty" },
      { title: "Tuổi Dần", href: "/tu-vi-2027/tuoi-dan" },
      { title: "Tuổi Thìn", href: "/tu-vi-2027/tuoi-thin" },
      { title: "Tuổi Ngọ", href: "/tu-vi-2027/tuoi-ngo" },
      { title: "Tuổi Mùi", href: "/tu-vi-2027/tuoi-mui" },
      { title: "Tuổi Hợi", href: "/tu-vi-2027/tuoi-hoi" },
    ],
  },
  {
    id: "giac-mo",
    title: "Nằm mơ thấy gì?",
    description: "Những giấc mơ hay gặp nhất, đọc theo tình huống và cảm xúc.",
    href: "/tra-cuu#giac-mo",
    featured: [
      { title: "Mơ thấy rắn", href: "/giac-mo/nam-mo-thay-ran" },
      { title: "Mơ rụng răng", href: "/giac-mo/nam-mo-rung-rang" },
      { title: "Mơ thấy người đã mất", href: "/giac-mo/nam-mo-thay-nguoi-da-mat" },
      { title: "Mơ thấy người yêu cũ", href: "/giac-mo/nam-mo-thay-nguoi-yeu-cu" },
      { title: "Mơ mang thai", href: "/giac-mo/nam-mo-mang-thai" },
      { title: "Mơ bị đuổi", href: "/giac-mo/nam-mo-bi-duoi" },
    ],
  },
  {
    id: "xin-xam",
    title: "Giải 100 quẻ xăm Quan Âm",
    description: "Thơ chữ Hán, nghĩa từng câu, điển tích và lời giải.",
    href: "/tra-cuu#xin-xam",
    featured: [
      { title: "Xăm số 1", href: "/xin-xam/xam-so-1" },
      { title: "Xăm số 8", href: "/xin-xam/xam-so-8" },
      { title: "Xăm số 18", href: "/xin-xam/xam-so-18" },
      { title: "Xăm số 28", href: "/xin-xam/xam-so-28" },
      { title: "Xăm số 68", href: "/xin-xam/xam-so-68" },
      { title: "Xăm số 99", href: "/xin-xam/xam-so-99" },
    ],
  },
];
