import { tuViBranches, tuViPalaceOrder, type TuViChart } from "./tuvi.ts";

export const tuViReadingTopics = ["Tính cách, ưu điểm và điểm cần cải thiện", "Sự nghiệp và khả năng phát triển", "Tài chính và tích lũy tài sản", "Tình duyên và hôn nhân", "Đại hạn hiện tại và kế tiếp", "Xu hướng năm xem"] as const;
export type TuViChartData = Omit<TuViChart, "interpretation">;

export function tuViPalaceRelations(chart: TuViChartData, branch: string) {
  const index = tuViBranches.findIndex((item) => item === branch);
  return { trine: [4, 8].map((offset) => chart.palaces.find((palace) => palace.branch === tuViBranches[(index + offset) % 12])?.name ?? ""), opposite: chart.palaces.find((palace) => palace.branch === tuViBranches[(index + 6) % 12])?.name ?? "" };
}

export function tuViReadingEvidence(chart: TuViChartData): Record<string, string> {
  const facts: Record<string, string> = {
    overview: `Âm Dương: ${chart.yinYang}; Bản mệnh: ${chart.destinyElement}; Cục: ${chart.cycle}; ${chart.bodyPalace}.`,
    periods: chart.periods.map((period) => `${period.start}–${period.end} tuổi: cung ${period.palace}`).join("; "),
    annual: `Năm ${chart.input.readingYear} (${chart.readingYearPillar}), ${chart.age} tuổi âm; tiểu hạn tại ${chart.annualFortune.palace}. ${chart.transformations.annual.map((item) => `${item.name} (${item.star}) ở ${item.palace}`).join("; ")}`,
    decadeFortune: `Đại hạn hiện tại ${chart.decadeFortune.age}–${chart.decadeFortune.endAge} tuổi tại ${chart.decadeFortune.palace}; lưu đại vận tại ${chart.decadeFortune.transitPalace}.`,
    yinYang: `Âm Dương: ${chart.yinYang}.`,
    destinyElement: `Bản mệnh: ${chart.destinyElement}.`,
    cycle: `Cục: ${chart.cycle}.`,
    bodyPalace: chart.bodyPalace,
    transformations: [...chart.transformations.natal.map((item) => `Nguyên cục: ${item.name} (${item.star}) tại ${item.palace}`), ...chart.transformations.decade.map((item) => `Đại vận: ${item.name} (${item.star}) tại ${item.palace}`), ...chart.transformations.annual.map((item) => `Lưu niên: ${item.name} (${item.star}) tại ${item.palace}`)].join("; ") || "Không có hóa tinh trong dữ liệu trả về.",
  };
  facts.annualFortune = facts.annual;
  for (const [key, items] of Object.entries(chart.transformations)) {
    facts[`transformations:${key}`] = items.map((item) => `${item.name} (${item.star}) tại cung ${item.palace} – ${item.branch}`).join("; ") || "Không có hóa tinh trong dữ liệu trả về.";
  }
  for (const period of chart.periods) {
    facts[`period:${period.start}-${period.end}`] = `${period.start}–${period.end} tuổi tại ${period.palace}. Tứ Hóa riêng của hạn: ${period.transformations.map((item) => `${item.name} (${item.star}) tại ${item.palace}`).join("; ") || "Chưa có dữ liệu"}.`;
  }
  const nextPeriod = chart.periods.find((period) => period.start > chart.decadeFortune.endAge);
  facts.nextPeriod = nextPeriod ? facts[`period:${nextPeriod.start}-${nextPeriod.end}`] : "Chưa có dữ liệu đại hạn kế tiếp.";
  for (const palace of chart.palaces) {
    const stars = [...palace.majorStars.map((star) => `${star.name} (${star.status})`), ...palace.goodStars, ...palace.challengingStars, ...palace.transformations, ...palace.barriers];
    facts[`palace:${palace.name}`] = `Cung ${palace.name} tại ${[palace.stem, palace.branch].filter(Boolean).join(" ")}: ${stars.join(", ") || "vô chính diệu"}.`;
  }
  return facts;
}

export function orderedTuViPalaces(chart: TuViChartData) {
  return tuViPalaceOrder.flatMap((name) => chart.palaces.filter((palace) => palace.name === name));
}
