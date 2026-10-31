import { test } from "node:test";
import assert from "node:assert/strict";

const {
  STICK_COUNT, castKeo, checkQuestion, drawStick, gradeMeaning, grades, keoMeaning, keoResults,
} = await import("../src/lib/xin-xam.ts");

test("quẻ luôn nằm trong 1..100", () => {
  for (let i = 0; i < 500; i++) {
    const { stick } = drawStick(`câu hỏi số ${i} dài đủ`, "thiet-bi", "2026-10-31");
    assert.ok(Number.isInteger(stick) && stick >= 1 && stick <= STICK_COUNT, `quẻ ${stick} ngoài khoảng`);
  }
});

test("cùng câu hỏi + thiết bị + ngày thì ra cùng quẻ", () => {
  const a = drawStick("Tôi có nên đổi việc không?", "may-A", "2026-10-31");
  const b = drawStick("Tôi có nên đổi việc không?", "may-A", "2026-10-31");
  assert.equal(a.stick, b.stick);
});

test("bỏ dấu và khác hoa thường vẫn ra cùng quẻ", () => {
  const a = drawStick("Tôi có nên đổi việc không?", "may-A", "2026-10-31");
  const b = drawStick("  toi co nen doi viec khong  ", "may-A", "2026-10-31");
  assert.equal(a.stick, b.stick, "chuẩn hoá câu hỏi chưa gom được hai dạng viết");
});

test("khác ngày thì khác quẻ, khác máy cũng vậy", () => {
  const base = drawStick("Tôi có nên đổi việc không?", "may-A", "2026-10-31");
  const ngayKhac = drawStick("Tôi có nên đổi việc không?", "may-A", "2026-11-01");
  const mayKhac = drawStick("Tôi có nên đổi việc không?", "may-B", "2026-10-31");
  assert.notEqual(base.stick, ngayKhac.stick);
  assert.notEqual(base.stick, mayKhac.stick);
});

test("ngày liên tiếp không dồn vào một nhóm quẻ", () => {
  // Chính là lỗi đã gặp ở Lá bài hôm nay: FNV-1a trần làm hai ngày cạnh nhau
  // rơi vào cùng một lá. Ở đây kiểm bước trộn murmur3 có thật sự tán đều không.
  const sticks = [];
  for (let d = 1; d <= 28; d++) {
    const day = `2026-11-${String(d).padStart(2, "0")}`;
    sticks.push(drawStick("Tôi có nên đổi việc không?", "may-A", day).stick);
  }
  const gan = sticks.slice(1).filter((s, i) => Math.abs(s - sticks[i]) <= 3).length;
  assert.ok(gan <= 6, `${gan}/27 cặp ngày liên tiếp ra quẻ sát nhau — hash tán chưa đều`);
  assert.ok(new Set(sticks).size >= 20, `chỉ ${new Set(sticks).size}/28 quẻ khác nhau`);
});

test("quẻ trải đều khắp 100 thẻ", () => {
  const seen = new Set();
  for (let i = 0; i < 4000; i++) seen.add(drawStick(`hoi gi do ${i}`, "may-A", "2026-10-31").stick);
  assert.ok(seen.size >= 95, `chỉ chạm ${seen.size}/100 quẻ`);
});

test("gieo keo ra đúng ba kết quả, thánh keo khoảng một nửa", () => {
  const dem = { "thánh": 0, "cười": 0, "âm": 0 };
  for (let i = 0; i < 6000; i++) dem[castKeo().result]++;
  for (const k of keoResults) assert.ok(dem[k] > 0, `không lần nào ra "${k}"`);
  const tyLe = dem["thánh"] / 6000;
  assert.ok(tyLe > 0.45 && tyLe < 0.55, `thánh keo ${(tyLe * 100).toFixed(1)}%, lệch khỏi 50%`);
});

test("hai mặt keo luôn khớp với kết quả", () => {
  for (let i = 0; i < 2000; i++) {
    const { faces: f, result } = castKeo();
    assert.equal(f.length, 2);
    const mong = f[0] !== f[1] ? "thánh" : f[0] === "ngửa" ? "cười" : "âm";
    assert.equal(result, mong, `mặt ${f.join("+")} mà kết quả lại là ${result}`);
  }
});

test("câu hỏi quá ngắn hoặc chỉ dấu câu thì bị chặn", () => {
  assert.equal(checkQuestion("").ok, false);
  assert.equal(checkQuestion("sao?").ok, false);
  assert.equal(checkQuestion("???!!! ...").ok, false);
  assert.equal(checkQuestion("x".repeat(400)).ok, false);
  assert.equal(checkQuestion("Tôi có nên đổi việc không?").ok, true);
});

test("mỗi cấp quẻ đều có lời giải nghĩa", () => {
  for (const g of grades) assert.ok(gradeMeaning[g]?.length > 10, `thiếu nghĩa cho cấp ${g}`);
  for (const k of keoResults) assert.ok(keoMeaning[k]?.length > 10, `thiếu nghĩa cho keo ${k}`);
});
