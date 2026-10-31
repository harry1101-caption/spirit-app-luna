import { test } from "node:test";
import assert from "node:assert/strict";
import { batTuChart, tenGod, branches, stems } from "../src/lib/bat-tu.ts";
import { solarTermMinutes } from "../src/lib/solar-terms.ts";

const chart = (birthDate, birthTime, gender = "Nam") =>
  batTuChart({ birthDate, birthTime, gender });
const pillar = (c, label) => c.pillars.find((p) => p.label === label);
const text = (c, label) => {
  const p = pillar(c, label);
  return p ? `${p.stem} ${p.branch}` : null;
};

test("trụ Ngày bám chu kỳ 60 liên tục theo mốc đã biết", () => {
  assert.equal(text(chart("2000-01-01", "12:00"), "Ngày"), "Mậu Ngọ");
  assert.equal(text(chart("2024-01-01", "12:00"), "Ngày"), "Giáp Tý");
  // cách nhau đúng 60 ngày thì lặp lại
  assert.equal(
    text(chart("2024-01-01", "12:00"), "Ngày"),
    text(chart("2024-03-01", "12:00"), "Ngày"),
  );
});

test("trụ Năm đổi tại Lập Xuân chứ không phải 1/1", () => {
  // Lập Xuân 2024 rơi vào 4/2 — sinh trước đó vẫn thuộc năm Quý Mão.
  const truoc = chart("2024-01-20", "08:00");
  assert.equal(text(truoc, "Năm"), "Quý Mão");
  assert.equal(truoc.solarYear, 2023);
  assert.match(truoc.notes.join(" "), /trước Lập Xuân/);

  const sau = chart("2024-02-10", "08:00");
  assert.equal(text(sau, "Năm"), "Giáp Thìn");
  assert.equal(sau.solarYear, 2024);
});

test("trụ Tháng đổi tại tiết khí chứ không theo tháng dương lịch", () => {
  // Tiểu Hàn 1999 rơi vào 6/1 → mốc chuyển tháng Tý sang tháng Sửu.
  assert.equal(pillar(chart("1999-01-03", "08:00"), "Tháng").branch, "Tý");
  assert.equal(pillar(chart("1999-01-11", "08:00"), "Tháng").branch, "Sửu");
  // Cùng tháng 1 dương lịch nhưng khác trụ Tháng.
  assert.notEqual(
    text(chart("1999-01-03", "08:00"), "Tháng"),
    text(chart("1999-01-11", "08:00"), "Tháng"),
  );
});

test("đối chứng tứ trụ với dữ liệu mẫu 1999-01-11 17:00", () => {
  // 3 trụ Năm/Ngày/Giờ khớp fixture trong tests/tuvi.test.mjs.
  const c = chart("1999-01-11", "17:00");
  assert.equal(text(c, "Năm"), "Mậu Dần");
  assert.equal(text(c, "Ngày"), "Quý Hợi");
  assert.equal(text(c, "Giờ"), "Tân Dậu");
  // Trụ Tháng là Ất Sửu: ngày sinh nằm sau Tiểu Hàn 6/1/1999 nên đã sang
  // tháng Sửu. Fixture kia ghi Giáp Tý (tháng Tý) là dữ liệu mock viết tay.
  assert.equal(text(c, "Tháng"), "Ất Sửu");
});

test("Can giờ suy từ Can ngày theo ngũ thử độn", () => {
  // Ngày Giáp, giờ Tý → Giáp Tý. Ngày Mậu, giờ Tý → Nhâm Tý.
  const giap = chart("2024-01-01", "00:30"); // ngày Giáp Tý
  assert.equal(text(giap, "Giờ"), "Giáp Tý");
  const mau = chart("2000-01-01", "00:30"); // ngày Mậu Ngọ
  assert.equal(text(mau, "Giờ"), "Nhâm Tý");
});

test("giờ Tý muộn từ 23:00 đẩy trụ Ngày sang hôm sau", () => {
  const truoc = chart("2024-06-15", "22:30", "Nữ");
  const sau = chart("2024-06-15", "23:30", "Nữ");
  assert.equal(text(truoc, "Ngày"), "Canh Tuất");
  assert.equal(text(sau, "Ngày"), "Tân Hợi");
  assert.equal(text(sau, "Ngày"), text(chart("2024-06-16", "01:30", "Nữ"), "Ngày"));
  assert.match(sau.notes.join(" "), /giờ Tý muộn/);
});

test("hướng Đại Vận theo âm dương năm sinh kết hợp giới tính", () => {
  // 2024 Giáp Thìn — Giáp là Can dương.
  assert.equal(chart("2024-06-15", "08:00", "Nam").luck.direction, "Thuận");
  assert.equal(chart("2024-06-15", "08:00", "Nữ").luck.direction, "Nghịch");
  // 2023 Quý Mão — Quý là Can âm, nên đảo lại.
  assert.equal(chart("2023-06-15", "08:00", "Nam").luck.direction, "Nghịch");
  assert.equal(chart("2023-06-15", "08:00", "Nữ").luck.direction, "Thuận");
});

test("tuổi khởi vận nằm trong khoảng hợp lệ của quy ước 3 ngày = 1 tuổi", () => {
  // Khoảng cách tới tiết gần nhất tối đa ~31 ngày → tối đa ~10 tuổi.
  for (const d of ["1980-03-07", "1995-08-21", "2003-11-30", "2024-02-04", "2024-05-05"]) {
    for (const g of ["Nam", "Nữ"]) {
      const { luck } = chart(d, "09:00", g);
      assert.ok(
        luck.startAge >= 0 && luck.startAge <= 10,
        `${d} ${g}: tuổi khởi vận ${luck.startAge} ngoài khoảng 0–10`,
      );
      assert.ok(luck.startMonths >= 0 && luck.startMonths < 12);
      assert.equal(luck.pillars.length, 8);
      assert.equal(luck.pillars[0].startAge, luck.startAge);
    }
  }
});

test("Thập Thần đúng theo quan hệ ngũ hành và âm dương với Nhật Chủ", () => {
  assert.equal(tenGod("Giáp", "Giáp"), "Tỷ Kiên");   // cùng hành, cùng dương
  assert.equal(tenGod("Giáp", "Ất"), "Kiếp Tài");    // cùng hành, khác âm dương
  assert.equal(tenGod("Giáp", "Bính"), "Thực Thần"); // Mộc sinh Hỏa, cùng dương
  assert.equal(tenGod("Giáp", "Đinh"), "Thương Quan");
  assert.equal(tenGod("Giáp", "Mậu"), "Thiên Tài");  // Mộc khắc Thổ, cùng dương
  assert.equal(tenGod("Giáp", "Kỷ"), "Chính Tài");
  assert.equal(tenGod("Giáp", "Canh"), "Thất Sát");  // Kim khắc Mộc, cùng dương
  assert.equal(tenGod("Giáp", "Tân"), "Chính Quan");
  assert.equal(tenGod("Giáp", "Nhâm"), "Thiên Ấn");  // Thủy sinh Mộc, cùng dương
  assert.equal(tenGod("Giáp", "Quý"), "Chính Ấn");
  assert.equal(tenGod("Quý", "Mậu"), "Chính Quan");  // kiểm chéo từ Nhật Chủ âm
});

test("Can và Chi của mọi trụ luôn cùng tính âm dương", () => {
  // Bất biến của chu kỳ 60: Can chẵn luôn ghép Chi chẵn.
  for (let i = 0; i < 400; i += 7) {
    const date = new Date(Date.UTC(1950, 0, 1 + i * 11));
    const c = chart(date.toISOString().slice(0, 10), "14:00", i % 2 ? "Nam" : "Nữ");
    for (const p of c.pillars) {
      assert.equal(
        stems.indexOf(p.stem) % 2,
        branches.indexOf(p.branch) % 2,
        `${p.label} ${p.stem} ${p.branch} lệch âm dương`,
      );
    }
    for (const lp of c.luck.pillars) {
      assert.equal(stems.indexOf(lp.stem) % 2, branches.indexOf(lp.branch) % 2);
    }
  }
});

test("không rõ giờ thì chỉ lập 3 trụ và nói rõ giới hạn", () => {
  const c = batTuChart({ birthDate: "1995-08-21", birthTime: null, gender: "Nữ" });
  assert.equal(c.hourKnown, false);
  assert.equal(c.pillars.length, 3);
  assert.equal(pillar(c, "Giờ"), undefined);
  assert.match(c.notes.join(" "), /Chưa có giờ sinh/);
  // 3 trụ còn lại vẫn phải khớp với khi biết giờ.
  const withHour = chart("1995-08-21", "09:00", "Nữ");
  for (const label of ["Năm", "Tháng", "Ngày"]) {
    assert.equal(text(c, label), text(withHour, label));
  }
});

test("đếm ngũ hành khớp số chữ thực có trên lá số", () => {
  const c = chart("1999-01-11", "17:00");
  const total = Object.values(c.elementCount).reduce((a, b) => a + b, 0);
  assert.equal(total, 8); // 4 Can + 4 Chi
  for (const e of c.missingElements) assert.equal(c.elementCount[e], 0);
  const threePillar = batTuChart({ birthDate: "1999-01-11", birthTime: null, gender: "Nam" });
  assert.equal(Object.values(threePillar.elementCount).reduce((a, b) => a + b, 0), 6);
});

test("bảng tiết khí phủ đủ dải năm và tăng đều", () => {
  for (const y of [1900, 1950, 2000, 2024, 2100]) {
    const terms = solarTermMinutes[y];
    assert.equal(terms.length, 12, `thiếu tiết cho năm ${y}`);
    for (let i = 1; i < 12; i += 1) {
      const gap = (terms[i] - terms[i - 1]) / 1440;
      assert.ok(gap > 28 && gap < 33, `năm ${y} tiết ${i}: cách ${gap.toFixed(1)} ngày`);
    }
  }
});
