import { test } from "node:test";
import assert from "node:assert/strict";
import { giacMoChart, detectSymbols, normalize, dreamSymbols } from "../src/lib/giac-mo.ts";

const keys = (text) => detectSymbols(text).map((s) => s.key);

test("bỏ dấu và dọn ký tự để so khớp không phụ thuộc cách gõ", () => {
  assert.equal(normalize("Tôi mơ thấy RẮN!!!"), "toi mo thay ran");
  assert.equal(normalize("Đi   lạc  đường..."), "di lac duong");
  assert.equal(normalize("bị đuổi"), "bi duoi");
});

test("dò được biểu tượng dù gõ có dấu hay không", () => {
  assert.deepEqual(keys("tôi mơ thấy con rắn"), ["ran"]);
  assert.deepEqual(keys("toi mo thay con ran"), ["ran"]);
  assert.deepEqual(keys("Mơ thấy RẮN"), ["ran"]);
});

test("khớp theo cụm trọn vẹn, không dính nhầm trong từ khác", () => {
  // "chó" không được khớp từ "cho rằng"
  assert.equal(keys("tôi cho rằng mình đang bay").includes("cho"), false);
  assert.ok(keys("tôi cho rằng mình đang bay").includes("bay"));
  // "nuoc" không khớp từ "nuoc ngoai"? — vẫn khớp vì là cụm riêng, đó là chấp nhận được
  assert.ok(keys("nước dâng cao").includes("nuoc"));
});

test("alias dài được ưu tiên để không bị alias ngắn chiếm chỗ", () => {
  const found = detectSymbols("tôi bị đuổi theo trong giấc mơ");
  const duoi = found.find((s) => s.key === "duoi");
  assert.ok(duoi, "phải nhận ra biểu tượng bị đuổi");
  assert.ok(duoi.matched.includes(" "), `phải khớp cụm nhiều từ, nhận được "${duoi.matched}"`);
});

test("nhiều biểu tượng trong một giấc mơ đều được nhận ra", () => {
  const k = keys("tôi đang bay trên biển thì rơi xuống, có con rắn và một ngôi nhà");
  for (const want of ["bay", "bien", "roi", "ran", "nha"]) assert.ok(k.includes(want), `thiếu ${want}`);
});

test("mô tả quá ngắn thì báo lỗi rõ ràng", () => {
  assert.throws(() => giacMoChart({ dream: "mơ" }), /dài hơn/);
  assert.throws(() => giacMoChart({ dream: "   " }), /dài hơn/);
});

test("không nhận ra biểu tượng nào thì nói rõ, không bịa", () => {
  const c = giacMoChart({ dream: "Một buổi chiều rất yên tĩnh và không có gì đặc biệt xảy ra." });
  assert.deepEqual(c.symbols, []);
  assert.deepEqual(c.themes, []);
  assert.match(c.notes.join(" "), /Chưa nhận ra biểu tượng/);
});

test("giấc mơ lặp lại được ghi chú riêng", () => {
  const a = giacMoChart({ dream: "Tôi mơ thấy mình bị đuổi theo khắp nơi.", recurrence: "Lặp lại thường xuyên" });
  assert.match(a.notes.join(" "), /lặp lại/);
  const b = giacMoChart({ dream: "Tôi mơ thấy mình bị đuổi theo khắp nơi.", recurrence: "Lần đầu" });
  assert.equal(b.notes.join(" ").includes("lặp lại"), false);
});

test("chủ đề suy ra từ biểu tượng, không trùng lặp", () => {
  const c = giacMoChart({ dream: "Tôi bơi dưới biển, trời mưa, rồi thấy mặt trăng." });
  assert.deepEqual(c.themes, ["Cảm xúc"]); // cả ba đều thuộc Cảm xúc
  assert.equal(new Set(c.themes).size, c.themes.length);
});

test("input được chuẩn hoá và giữ nguyên các trường tuỳ chọn", () => {
  const c = giacMoChart({
    dream: "  Tôi mơ thấy rụng răng.  ",
    mood: "Lo lắng",
    recurrence: "Đã mơ vài lần",
    context: "  đang đổi việc  ",
  });
  assert.equal(c.input.dream, "Tôi mơ thấy rụng răng.");
  assert.equal(c.input.mood, "Lo lắng");
  assert.equal(c.input.recurrence, "Đã mơ vài lần");
  assert.equal(c.input.context, "đang đổi việc");
  assert.ok(c.wordCount > 0);
});

test("từ điển biểu tượng hợp lệ: key duy nhất, có alias đã bỏ dấu", () => {
  assert.equal(new Set(dreamSymbols.map((s) => s.key)).size, dreamSymbols.length);
  for (const s of dreamSymbols) {
    assert.ok(s.aliases.length, `${s.key} không có alias`);
    assert.ok(s.meaning.length > 40, `${s.key} ý nghĩa quá ngắn`);
    for (const a of s.aliases)
      assert.equal(a, a.toLowerCase(), `alias "${a}" của ${s.key} phải viết thường`);
  }
});
