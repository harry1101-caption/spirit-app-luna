export type TuViInput = {
  fullName: string;
  birthDate: string;
  birthTime: string;
  gender: "Nam" | "Nữ";
  readingYear: number;
  showDecadeFortune: boolean;
  showAnnualFortune: boolean;
  occupation: "Đi làm" | "Đi học";
  relationship: "Độc thân" | "Đang hẹn hò" | "Đã kết hôn";
};

export type TuViPalace = {
  branch: string;
  stem?: string;
  name: string;
  majorStars: { name: string; status: string }[];
  goodStars: string[];
  challengingStars: string[];
  transformations: string[];
  barriers: string[];
  lifeStage: string;
  annualCycleStar?: string;
  wealthCycleStar?: string;
  decadeAge?: number;
  decadeEndAge?: number;
  isBodyPalace: boolean;
};

export type TuViChart = {
  formatVersion: 2;
  input: TuViInput;
  lunarDate: { day: number; month: number; year: number; leap: boolean };
  pillars: { year: string; month: string; day: string; hour: string };
  destinyElement: string;
  cycle: string;
  bodyPalace: string;
  age: number;
  yinYang: string;
  readingYearPillar: string;
  periods: { start: number; end: number; palace: string; transformations: TuViTransformation[] }[];
  transformations: { natal: TuViTransformation[]; annual: TuViTransformation[]; decade: TuViTransformation[] };
  decadeFortune: { age: number; endAge: number; palace: string; transitPalace: string };
  annualFortune: { age: number; palace: string; direction: string };
  interpretation: {
    summary: string;
    sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
    topics: { title: string; takeaway?: string; text: string; evidence: string[] }[];
    source: "ai" | "guide";
  };
  palaces: TuViPalace[];
  source: { name: string; url: string };
};

export type TuViTransformation = { name: string; star: string; branch: string; palace: string };
export const tuViPalaceOrder = ["Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách", "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"] as const;

export const tuViTimeSlots = Array.from({ length: 48 }, (_, index) => {
  const startHour = Math.floor(index / 2);
  const endHour = (startHour + (index % 2)) % 24;
  return `${startHour}h${index % 2 ? "30" : ""} – ${endHour}h${index % 2 ? "" : "30"}`;
});

// Clockwise around the 2 × 2 centre of the traditional 4 × 4 chart.
export const tuViBranches = [
  "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất",
  "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn",
] as const;
