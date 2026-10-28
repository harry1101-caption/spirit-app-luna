"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Download, LoaderCircle, Radar, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tuViBranches, type TuViChart, type TuViPalace } from "@/lib/tuvi";
import { orderedTuViPalaces, tuViPalaceRelations, tuViReadingEvidence } from "@/lib/tuvi-reading";

const positions: Record<string, string> = {
  "Tỵ": "1 / 1", "Ngọ": "1 / 2", "Mùi": "1 / 3", "Thân": "1 / 4",
  "Thìn": "2 / 1", "Dậu": "2 / 4", "Mão": "3 / 1", "Tuất": "3 / 4",
  "Dần": "4 / 1", "Sửu": "4 / 2", "Tý": "4 / 3", "Hợi": "4 / 4",
};
const statusMark: Record<string, string> = {
  "miếu": "M", "vượng": "V", "đắc": "Đ", "bình": "B", "hãm": "H",
};

function Palace({ palace, index, showDecadeFortune }: { palace: TuViPalace; index: number; showDecadeFortune: boolean }) {
  return (
    <section
      className="tuvi-palace"
      style={{ gridArea: positions[palace.branch], animationDelay: `${Math.min(index, 11) * 35}ms` }}
      aria-label={`Cung ${palace.name} tại ${palace.branch}`}
    >
      <div className="tuvi-palace-head">
        <span className="tuvi-palace-branch">{palace.branch}</span>
        <strong>{palace.name}{palace.isBodyPalace ? <em>Thân</em> : null}</strong>
        <span className="tuvi-palace-decade">{showDecadeFortune ? palace.decadeAge ?? "" : ""}</span>
      </div>
      <div className="tuvi-major-stars">
        {palace.majorStars.length ? palace.majorStars.map((star) => (
          <strong key={star.name} className={star.status === "hãm" ? "is-challenging" : ""}>
            {star.name} <span>({statusMark[star.status] ?? star.status})</span>
          </strong>
        )) : <span className="tuvi-empty-major">Vô chính diệu</span>}
      </div>
      <div className="tuvi-secondary-stars">
        <div>
          {palace.transformations.map((name) => <span className="tuvi-transformation" key={name}>{name}</span>)}
          {palace.goodStars.map((name) => <span className="tuvi-good-star" key={name}>{name}</span>)}
        </div>
        <div>{palace.challengingStars.map((name) => <span className="tuvi-challenging-star" key={name}>{name}</span>)}</div>
      </div>
      <div className="tuvi-palace-foot"><span>{palace.lifeStage}</span>{palace.barriers.map((barrier) => <b key={barrier}>{barrier}</b>)}</div>
    </section>
  );
}

function ChartCentre({ chart }: { chart: TuViChart }) {
  const { input, lunarDate, pillars } = chart;
  const [year, month, day] = input.birthDate.split("-");
  const rows = [
    ["Họ và tên", input.fullName],
    ["Dương lịch", `${day}/${month}/${year}`],
    ["Âm lịch", `${lunarDate.day}/${lunarDate.month}/${lunarDate.year}${lunarDate.leap ? " (nhuận)" : ""}`],
    ["Giờ sinh", input.birthTime],
    ["Năm sinh", pillars.year],
    ["Tháng sinh", pillars.month],
    ["Ngày sinh", pillars.day],
    ["Giờ can chi", pillars.hour],
    ["Năm xem", `${input.readingYear} · ${chart.age} tuổi mụ`],
    ...(input.showDecadeFortune ? [["Đại vận", `${chart.decadeFortune.age}–${chart.decadeFortune.endAge} tuổi · ${chart.decadeFortune.palace}`]] : []),
    ...(input.showDecadeFortune ? [["Lưu đại vận", chart.decadeFortune.transitPalace]] : []),
    ...(input.showAnnualFortune ? [["Tiểu vận", `${chart.annualFortune.age} tuổi · ${chart.annualFortune.palace} (${chart.annualFortune.direction})`]] : []),
    ["Bản mệnh", chart.destinyElement],
    ["Cục", chart.cycle],
    ["Cung Thân", chart.bodyPalace],
    ["Đại hạn hiện tại", `${chart.decadeFortune.age}–${chart.decadeFortune.endAge} tuổi · ${chart.decadeFortune.palace}`],
    ...(input.showDecadeFortune ? [["Lưu đại vận", chart.decadeFortune.transitPalace]] : []),
    ...(input.showAnnualFortune ? [["Tiểu hạn", `${chart.annualFortune.palace} · ${chart.annualFortune.direction}`]] : []),
  ];
  return (
    <div className="tuvi-chart-centre">
      <div className="tuvi-centre-seal" aria-hidden="true" />
      <p className="tuvi-chart-kicker">HÀNH TRÌNH NỘI TÂM</p>
      <h2>LÁ SỐ TỬ VI</h2>
      <div className="tuvi-chart-info">
        {rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <p className="tuvi-chart-context">{input.gender} · {input.occupation} · {input.relationship}</p>
    </div>
  );
}

const palaceOrder = ["Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách", "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"];
const radarLabels: Record<string, string> = {
  "Mệnh": "Mệnh", "Phụ Mẫu": "Phụ mẫu", "Phúc Đức": "Phúc đức", "Điền Trạch": "Điền trạch",
  "Quan Lộc": "Quan lộc", "Nô Bộc": "Nô bộc", "Thiên Di": "Thiên di", "Tật Ách": "Tật ách",
  "Tài Bạch": "Tài bạch", "Tử Tức": "Tử tức", "Phu Thê": "Phu thê", "Huynh Đệ": "Huynh đệ",
};

function TwelvePalaceChart({ chart }: { chart: TuViChart }) {
  const cx = 420, cy = 345, radius = 214;
  const palaces = palaceOrder.map((name) => chart.palaces.find((item) => item.name === name)).filter((item): item is TuViPalace => Boolean(item));
  const counts = palaces.map((palace) => palace.majorStars.length + palace.goodStars.length + palace.challengingStars.length + palace.transformations.length);
  const maxCount = Math.max(...counts, 1);
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / palaces.length;
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale] as const;
  };
  const polygon = (scale: number) => palaces.map((_, index) => point(index, scale).join(",")).join(" ");
  const values = counts.map((count) => count / maxCount);
  const valuePoints = values.map((value, index) => point(index, Math.max(value, 0.08)).join(",")).join(" ");
  return <section className="tuvi-radar-panel" aria-labelledby="tuvi-radar-title">
    <div className="tuvi-radar-heading"><div><p className="eyebrow">PHẦN 2 · 12 CUNG</p><h2 id="tuvi-radar-title"><Radar size={21} /> Biểu đồ 12 cung</h2><p>Mật độ sao tương quan trong lá số, tính từ dữ liệu từng cung.</p></div></div>
    <div className="tuvi-radar-chart-wrap">
      <svg className="tuvi-radar-chart" viewBox="0 0 840 690" role="img" aria-label="Biểu đồ mật độ sao của 12 cung trong lá số">
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => <polygon key={scale} points={polygon(scale)} className="tuvi-radar-grid" />)}
        {palaces.map((palace, index) => <line key={`axis-${palace.branch}`} x1={cx} y1={cy} x2={point(index, 1)[0]} y2={point(index, 1)[1]} className="tuvi-radar-axis" />)}
        {[20, 40, 60, 80, 100].map((value) => <text key={value} x={cx - 16} y={cy - radius * value / 100 + 4} className="tuvi-radar-scale">{value}</text>)}
        <polygon points={valuePoints} className="tuvi-radar-area" />
        {palaces.map((palace, index) => {
          const [x, y] = point(index, 1.24);
          const [dotX, dotY] = point(index, Math.max(values[index], 0.08));
          const anchor = x < cx - 20 ? "end" : x > cx + 20 ? "start" : "middle";
          return <g key={`label-${palace.branch}`}>
            <circle cx={dotX} cy={dotY} r="5.5" className={palace.isBodyPalace ? "tuvi-radar-dot is-body" : "tuvi-radar-dot"} />
            <text x={x} y={y} textAnchor={anchor} className={palace.isBodyPalace ? "tuvi-radar-label is-body" : "tuvi-radar-label"}>{radarLabels[palace.name] ?? palace.name}{palace.isBodyPalace ? " (Thân)" : ""}</text>
          </g>;
        })}
      </svg>
    </div>
    <p className="tuvi-radar-footnote">Thang đo thể hiện số lượng chính tinh, phụ tinh và hóa tinh tương quan giữa 12 cung; không phải điểm tốt xấu hay dự đoán vận mệnh.</p>
  </section>;
}

function ChartInterpretation({ chart }: { chart: TuViChart }) {
  const { input, lunarDate, pillars, interpretation } = chart;
  const [year, month, day] = input.birthDate.split("-");
  const palaces = orderedTuViPalaces(chart);
  const evidence = tuViReadingEvidence(chart);
  const rows = [
    ["Họ tên", input.fullName],
    ["Năm sinh dương lịch", year],
    ["Năm sinh âm lịch", `${lunarDate.year} – ${pillars.year}`],
    ["Tháng sinh", `${month} dương lịch · tháng ${lunarDate.month}${lunarDate.leap ? " nhuận" : ""} âm lịch – ${pillars.month}`],
    ["Ngày sinh", `${day} dương lịch · ngày ${lunarDate.day} âm lịch – ${pillars.day}`],
    ["Giờ sinh", `${input.birthTime} – ${pillars.hour}`],
    ["Giới tính", input.gender],
    ["Âm Dương", chart.yinYang],
    ["Âm dương mệnh", "Chưa có dữ liệu"],
    ["Bản mệnh", chart.destinyElement],
    ["Cục", chart.cycle],
    ["Quan hệ Mệnh – Cục", "Chưa có dữ liệu"],
    ["Mệnh chủ", "Chưa có dữ liệu"],
    ["Thân chủ", "Chưa có dữ liệu"],
    ["Năm xem", `${input.readingYear} – ${chart.readingYearPillar} (${chart.age} tuổi âm)`],
    ["Cung Mệnh", chart.palaces.find((palace) => palace.name === "Mệnh")?.branch ?? "Chưa có dữ liệu"],
    ["Cung Thân", chart.bodyPalace],
  ];
  function sources(ids: string[]) {
    return <aside className="tuvi-reading-evidence"><strong>Căn cứ trong lá số</strong><ul>{ids.map((id) => <li key={id}>{evidence[id]}</li>)}</ul></aside>;
  }
  return <section className="tuvi-interpretation tuvi-reading-report" aria-labelledby="tuvi-interpretation-title">
    <header className="tuvi-interpretation-heading">
      <div><p className="eyebrow">PHẦN 3 · LUẬN GIẢI CÁ NHÂN</p><h2 id="tuvi-interpretation-title"><BookOpenText size={21} /> Giải thích lá số</h2></div>
      <span className="tuvi-interpretation-source">{interpretation.source === "ai" ? "Luận giải AI" : "Dữ liệu lá số"}</span>
    </header>
    <section className="tuvi-reading-section" aria-labelledby="tuvi-overview-title">
      <h3 id="tuvi-overview-title">I. Thông tin tổng quan lá số</h3>
      <table className="tuvi-reading-overview"><thead><tr><th scope="col">Thuộc tính</th><th scope="col">Giá trị</th></tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>
      <p className="tuvi-reading-data-note">Can chi được ghi theo âm lịch. Các mục chưa có dữ liệu không được dùng làm căn cứ luận giải.</p>
      <div className="tuvi-reading-overview-text"><h4>{interpretation.source === "ai" ? "Tổng luận Mệnh – Thân – Cục – Âm Dương" : "Trạng thái luận giải"}</h4><p>{interpretation.summary}</p></div>
    </section>
    <section className="tuvi-reading-section" aria-labelledby="tuvi-palaces-title">
      <h3 id="tuvi-palaces-title">II. Chi tiết 12 cung Tử Vi</h3>
      {palaces.map((palace, index) => {
        const reading = interpretation.sections.find((item) => item.title === palace.name);
        const relations = tuViPalaceRelations(chart, palace.branch);
        const auxiliary = [...new Set([...palace.goodStars, ...palace.challengingStars, ...palace.transformations, ...[palace.annualCycleStar, palace.wealthCycleStar].filter((item): item is string => Boolean(item))])];
        const data = [
          ["Vị trí", [palace.stem, palace.branch].filter(Boolean).join(" ")],
          ["Đại hạn", palace.decadeAge !== undefined && palace.decadeEndAge !== undefined ? `${palace.decadeAge}–${palace.decadeEndAge} tuổi` : "Chưa có dữ liệu"],
          ["Chính tinh", palace.majorStars.map((star) => `${star.name} (${star.status})`).join(", ") || "Vô chính diệu"],
          ["Phụ tinh / Hóa tinh", auxiliary.join(", ") || "Không có trong dữ liệu trả về"],
          ["Trạng thái Trường Sinh", palace.lifeStage],
          ["Tuần / Triệt", palace.barriers.join(", ") || "Không án ngữ"],
          ["Tam hợp", relations.trine.join(" · ")],
          ["Xung chiếu", relations.opposite],
        ];
        return <article className="tuvi-reading-palace" key={palace.name}>
          <h4>{index + 1}. Cung {palace.name} – {palace.branch}{palace.isBodyPalace ? " · Thân cư tại đây" : ""}</h4>
          <dl className="tuvi-reading-facts">{data.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {reading ? <div className="tuvi-reading-analysis"><h5>Luận giải</h5><p>{reading.text}</p>{sources(reading.evidence)}</div> : null}
        </article>;
      })}
    </section>
    <section className="tuvi-reading-section" aria-labelledby="tuvi-topics-title">
      <h3 id="tuvi-topics-title">III. Luận giải chuyên sâu</h3>
      {interpretation.topics.length ? interpretation.topics.map((topic, index) => <article className="tuvi-reading-topic" key={topic.title}><h4>{index + 1}. {topic.title === "Xu hướng năm xem" ? `Xu hướng năm ${input.readingYear}` : topic.title}</h4><p>{topic.text}</p>{sources(topic.evidence)}</article>) : <p className="tuvi-reading-data-note">Luận giải chuyên sâu chưa khả dụng cho lần lập này. Dữ liệu lá số bên trên vẫn đầy đủ.</p>}
    </section>
    <p className="tuvi-interpretation-note">Phần luận giải sử dụng cách diễn giải Tử Vi truyền thống, mang tính tham khảo; các xu hướng được nêu không phải sự kiện chắc chắn xảy ra.</p>
  </section>;
}

export function TuViChartView({ chart, onEdit }: { chart: TuViChart; onEdit: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  async function download() {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    setExportError("");
    try {
      const { toPng } = await import("html-to-image");
      const image = await toPng(sheetRef.current, {
        pixelRatio: 2,
        backgroundColor: "#fffcf5",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `la-so-tu-vi-${chart.input.fullName.trim().replace(/\s+/g, "-").toLowerCase()}-${chart.input.readingYear}.png`;
      link.href = image;
      link.click();
    } catch {
      setExportError("Chưa thể lưu ảnh. Hãy thử lại trên trình duyệt này.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="tuvi-result" aria-labelledby="tuvi-result-title">
      <div className="tuvi-result-toolbar">
        <div><p className="eyebrow">LÁ SỐ ĐÃ LẬP</p><h1 id="tuvi-result-title">Lá số của {chart.input.fullName}</h1></div>
        <div className="tuvi-result-actions">
          <Button variant="outline" onClick={onEdit}><ArrowLeft size={16} /> Chỉnh thông tin</Button>
          <Button onClick={download} disabled={exporting}>
            {exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
            {exporting ? "Đang tạo ảnh…" : "Tải ảnh PNG"}
          </Button>
        </div>
      </div>
      {exportError ? <p className="tuvi-export-error" role="alert">{exportError}</p> : null}
      <section className="tuvi-chart-section" aria-labelledby="tuvi-chart-title">
        <header className="tuvi-chart-section-heading">
          <p className="eyebrow">PHẦN 1 · LÁ SỐ TỬ VI</p>
          <h2 id="tuvi-chart-title">Ảnh lá số Tử Vi</h2>
          <p>Toàn bộ 12 cung và hệ thống sao được an theo thông tin ngày giờ sinh.</p>
        </header>
        <p className="tuvi-scroll-hint">Vuốt ngang để xem toàn bộ lá số trên màn hình nhỏ.</p>
        <div className="tuvi-chart-viewport">
          <div className="tuvi-chart-sheet" ref={sheetRef}>
            <div className="tuvi-chart-grid">
              {tuViBranches.map((branch, index) => {
                const palace = chart.palaces.find((item) => item.branch === branch);
                return palace ? <Palace key={branch} palace={palace} index={index} showDecadeFortune={chart.input.showDecadeFortune} /> : null;
              })}
              <ChartCentre chart={chart} />
            </div>
            <footer className="tuvi-chart-footer">
              <span>M: Miếu · V: Vượng · Đ: Đắc · B: Bình · H: Hãm</span>
              <span>Dữ liệu an sao: {chart.source.name} · {chart.source.url.replace(/^https?:\/\//, "")}</span>
            </footer>
          </div>
        </div>
        <p className="tuvi-chart-disclaimer">Lá số dùng để tham khảo và tự suy ngẫm. Giờ sinh được tính theo điểm giữa khung 30 phút đã chọn (giờ Việt Nam).</p>
      </section>
      <TwelvePalaceChart chart={chart} />
      <ChartInterpretation chart={chart} />
    </section>
  );
}
