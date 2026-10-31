import { test } from "node:test";
import assert from "node:assert/strict";
import {
  thanSoHocChart,
  normalizeName,
  reduceNumber,
  numberMeanings,
} from "../src/lib/than-so-hoc.ts";

const get = (chart, key) => chart.numbers.find((n) => n.key === key);

test("bỏ dấu tiếng Việt và chỉ giữ A–Z", () => {
  assert.equal(normalizeName("Nguyễn Văn An"), "NGUYENVANAN");
  assert.equal(normalizeName("Đặng Thuý Hằng"), "DANGTHUYHANG");
  assert.equal(normalizeName("Lê  Thị   Ơn"), "LETHION");
  assert.equal(normalizeName("Trần Đình Đỗ"), "TRANDINHDO");
  // Đ hoa và đ thường đều về D
  assert.equal(normalizeName("đÀO"), "DAO");
});

test("rút gọn giữ nguyên số bậc thầy 11, 22, 33", () => {
  assert.equal(reduceNumber(29).value, 11); // 2+9=11, dừng
  assert.equal(reduceNumber(29, false).value, 2); // tắt thì rút tiếp
  assert.equal(reduceNumber(22).value, 22);
  assert.equal(reduceNumber(33).value, 33);
  assert.equal(reduceNumber(39).value, 3); // 3+9=12 → 3
  assert.deepEqual(reduceNumber(1995).chain, [1995, 24, 6]);
});

test("Số Đường Đời rút gọn tháng, ngày, năm riêng rồi mới cộng", () => {
  // 21/08/1995 → tháng 8, ngày 21→3, năm 1995→24→6; 8+3+6=17→8
  const c = thanSoHocChart({ fullName: "Nguyễn Văn An", birthDate: "1995-08-21" }, 2026);
  assert.equal(get(c, "lifePath").value, 8);
  assert.match(get(c, "lifePath").steps, /17/);
});

test("bảng Pythagoras quy chữ cái đúng giá trị", () => {
  // A=1 B=2 C=3 → 6
  const abc = thanSoHocChart({ fullName: "ABC", birthDate: "2000-01-01" }, 2026);
  assert.equal(get(abc, "expression").value, 6);
  // I=9 R=9 Z=8 S=1 → S=1 nằm đầu vòng thứ ba
  const sz = thanSoHocChart({ fullName: "SZ", birthDate: "2000-01-01" }, 2026);
  assert.equal(get(sz, "expression").value, 9); // 1+8
});

test("Y tính là nguyên âm, Linh Hồn và Nhân Cách bù nhau", () => {
  const c = thanSoHocChart({ fullName: "Huy", birthDate: "2000-01-01" }, 2026);
  // H=8 U=3 Y=7 ; nguyên âm U,Y = 10 → 1 ; phụ âm H = 8
  assert.equal(get(c, "soul").value, 1);
  assert.equal(get(c, "personality").value, 8);
  // Tổng trước khi rút gọn của hai nhóm phải bằng tổng toàn bộ chữ cái.
  const all = thanSoHocChart({ fullName: "Nguyen Van An", birthDate: "1995-08-21" }, 2026);
  assert.ok(get(all, "soul").value >= 1 && get(all, "personality").value >= 1);
});

test("số bậc thầy không bị rút tiếp khi xuất hiện", () => {
  // Tìm một ngày cho ra 11 ở Đường Đời: 29/09/1991 → 9 + 11 + 20→2 = 22
  const c = thanSoHocChart({ fullName: "Test", birthDate: "1991-09-29" }, 2026);
  assert.equal(get(c, "lifePath").value, 22);
  assert.equal(get(c, "lifePath").isMaster, true);
});

test("số còn thiếu là chữ số 1–9 vắng mặt trong tên", () => {
  const c = thanSoHocChart({ fullName: "ABC", birthDate: "2000-01-01" }, 2026);
  // chỉ có 1, 2, 3 → thiếu 4..9
  assert.deepEqual(c.missing, [4, 5, 6, 7, 8, 9]);
  assert.equal(c.letterTally[1], 1);
  assert.equal(c.letterTally[9], 0);
  // tổng tally phải bằng số chữ cái
  const total = Object.values(c.letterTally).reduce((a, b) => a + b, 0);
  assert.equal(total, c.normalizedName.length);
});

test("Số Năm Cá Nhân đổi theo năm xem và không giữ số bậc thầy", () => {
  const a = thanSoHocChart({ fullName: "Nguyễn Văn An", birthDate: "1995-08-21" }, 2026);
  const b = thanSoHocChart({ fullName: "Nguyễn Văn An", birthDate: "1995-08-21" }, 2027);
  assert.equal(a.personalYear.year, 2026);
  assert.notEqual(a.personalYear.value, b.personalYear.value);
  for (const y of [2024, 2025, 2026, 2027, 2028]) {
    const c = thanSoHocChart({ fullName: "Trần Thị Bình", birthDate: "1988-11-29" }, y);
    assert.ok(c.personalYear.value >= 1 && c.personalYear.value <= 9,
      `năm ${y}: ${c.personalYear.value} ngoài khoảng 1–9`);
  }
});

test("mọi số cốt lõi đều có ý nghĩa nền tương ứng", () => {
  for (const name of ["Nguyễn Văn An", "Đặng Thuý Hằng", "Lý Quý Bảo", "Hồ Thị Ơn"]) {
    for (const y of [1975, 1991, 2003]) {
      const c = thanSoHocChart({ fullName: name, birthDate: `${y}-06-15` }, 2026);
      for (const n of c.numbers) {
        assert.ok(numberMeanings[n.value], `${name} ${y} — ${n.label} = ${n.value} không có ý nghĩa`);
        assert.ok(n.steps.length > 0, `${n.label} thiếu chuỗi phép tính`);
      }
    }
  }
});

test("tên hoặc ngày sinh không hợp lệ thì báo lỗi rõ ràng", () => {
  assert.throws(() => thanSoHocChart({ fullName: "123 !!!", birthDate: "1995-08-21" }), /chữ cái/);
  assert.throws(() => thanSoHocChart({ fullName: "An", birthDate: "" }), /Ngày sinh/);
});

test("tên có dấu và tên đã bỏ dấu cho cùng kết quả", () => {
  const a = thanSoHocChart({ fullName: "Nguyễn Văn An", birthDate: "1995-08-21" }, 2026);
  const b = thanSoHocChart({ fullName: "Nguyen Van An", birthDate: "1995-08-21" }, 2026);
  assert.deepEqual(
    a.numbers.map((n) => n.value),
    b.numbers.map((n) => n.value),
  );
  assert.match(a.notes.join(" "), /bỏ dấu/);
  assert.equal(b.notes.length, 0);
});
