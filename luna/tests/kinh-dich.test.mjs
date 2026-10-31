import { test } from "node:test";
import assert from "node:assert/strict";

const { hexagrams, hexagramOf, castHexagram, checkQuestion, trigrams } = await import("../src/lib/kinh-dich.ts");
const { evidenceOf, interpretCast, kinhDichTopics } = await import("../src/lib/kinh-dich-api.ts");

const bits = (lines) => lines.map(Number).join("");

test("đủ 64 quẻ theo thứ tự Văn Vương, không quẻ nào trùng hào", () => {
  assert.equal(hexagrams.length, 64);
  hexagrams.forEach((h, i) => assert.equal(h.so, i + 1));
  assert.equal(new Set(hexagrams.map((h) => bits(h.lines))).size, 64);
  for (const h of hexagrams) assert.ok(trigrams[h.tren] && trigrams[h.duoi], `quẻ ${h.so} sai tên quẻ đơn`);
});

test("cấu trúc và tên các quẻ mốc", () => {
  // Hào viết từ dưới lên: Thái là Càn dưới Khôn trên, Bĩ thì ngược lại.
  const cases = [[1, "111111", "Thuần Càn"], [2, "000000", "Thuần Khôn"], [3, "100010", "Thủy Lôi Truân"],
    [11, "111000", "Địa Thiên Thái"], [12, "000111", "Thiên Địa Bĩ"], [63, "101010", "Thủy Hỏa Ký Tế"], [64, "010101", "Hỏa Thủy Vị Tế"]];
  for (const [so, lines, name] of cases) {
    const h = hexagrams[so - 1];
    assert.equal(bits(h.lines), lines, `quẻ ${so}`);
    assert.equal(h.tenDayDu, name);
  }
});

test("cùng câu hỏi + thiết bị + ngày thì ra cùng quẻ, bỏ dấu cũng vậy", () => {
  const a = castHexagram("Tôi có nên đổi việc không?", "may-A", "2026-10-31");
  const b = castHexagram("  toi co nen doi viec khong ", "may-A", "2026-10-31");
  assert.deepEqual(a.tosses, b.tosses);
  const khacNgay = castHexagram("Tôi có nên đổi việc không?", "may-A", "2026-11-01");
  assert.notDeepEqual(a.tosses, khacNgay.tosses);
});

test("đồng xu ra đúng tỷ lệ của ba đồng xu thật: 1/8, 3/8, 3/8, 1/8", () => {
  const dem = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let i = 0; i < 3000; i++) for (const t of castHexagram(`cau hoi ${i}`, "may", "2026-10-31").tosses) dem[t.value]++;
  const total = 18000;
  for (const [value, expected] of [[6, 1 / 8], [7, 3 / 8], [8, 3 / 8], [9, 1 / 8]]) {
    assert.ok(Math.abs(dem[value] / total - expected) < 0.02, `giá trị ${value}: ${(dem[value] / total).toFixed(3)}`);
  }
});

test("mặt đồng xu khớp với giá trị hào; quẻ hỗ và quẻ biến dựng đúng", () => {
  for (let i = 0; i < 300; i++) {
    const c = castHexagram(`kiem tra quan he ${i}`, "may", "2026-10-31");
    for (const t of c.tosses) assert.equal(t.coins.reduce((s, f) => s + (f === "ngửa" ? 3 : 2), 0), t.value);
    const yang = c.lines.map((l) => l.yang);
    assert.equal(c.primary, hexagramOf(yang));
    assert.equal(bits(c.nuclear.lines), bits([...yang.slice(1, 4), ...yang.slice(2, 5)]));
    assert.deepEqual(c.movingLines, c.tosses.flatMap((t, j) => (t.value === 6 || t.value === 9 ? [j + 1] : [])));
    if (c.movingLines.length) assert.equal(bits(c.changed.lines), bits(c.lines.map((l) => (l.moving ? !l.yang : l.yang))));
    else assert.equal(c.changed, null);
  }
});

test("câu hỏi quá ngắn hoặc chỉ có dấu câu bị chặn", () => {
  assert.equal(checkQuestion("ngắn").ok, false);
  assert.equal(checkQuestion("?!?!?!?!?!").ok, false);
  assert.equal(checkQuestion("Tôi nên chú ý điều gì trong công việc?").ok, true);
});

test("dữ kiện cho AI có hào động và quẻ biến khi có, và không có khi không", () => {
  let moving, still;
  for (let i = 0; i < 200 && !(moving && still); i++) {
    const c = castHexagram(`tim que ${i}`, "may", "2026-10-31");
    if (c.movingLines.length) moving ??= c; else still ??= c;
  }
  const m = evidenceOf(moving);
  assert.ok(m.changed && moving.movingLines.every((n) => m[`line:${n}`]));
  const s = evidenceOf(still);
  assert.equal(s.changed, undefined);
  assert.match(s.moving, /Không có hào động/);
});

test("không có AI key thì trả guide, AI bịa evidence thì cũng trả guide", async (t) => {
  const cast = castHexagram("Tôi nên chú ý điều gì trong công việc?", "may", "2026-10-31");
  const old = process.env.AI_API_KEY;
  t.after(() => { if (old === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = old; });
  delete process.env.AI_API_KEY;
  assert.equal((await interpretCast(cast)).source, "guide");

  process.env.AI_API_KEY = "test";
  const section = (title, evidence = ["primary"]) => ({ title, text: "Đoạn luận giải đủ dài để qua kiểm tra độ dài tối thiểu của mục, gắn vào quẻ chủ đã gieo.", evidence });
  const reply = (sections) => t.mock.method(globalThis, "fetch", async () => Response.json({ choices: [{ message: { content: JSON.stringify({ summary: "Tóm tắt quẻ này ứng vào câu hỏi về công việc, đủ dài để qua kiểm tra độ dài tối thiểu của phần tóm tắt.", sections }) } }] }));
  reply(kinhDichTopics.map((title) => section(title, ["kinh-van-bia"])));
  assert.equal((await interpretCast(cast)).source, "guide");
  reply([...kinhDichTopics].reverse().map((title) => section(title)));
  const ok = await interpretCast(cast);
  assert.equal(ok.source, "ai");
  assert.deepEqual(ok.sections.map((s) => s.title), [...kinhDichTopics]);
});
