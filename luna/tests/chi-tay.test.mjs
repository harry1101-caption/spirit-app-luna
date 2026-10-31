import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkImage, sanitizeReading, palmLines, palmLineGuide, MAX_IMAGE_BYTES,
} from "../src/lib/chi-tay.ts";

const dataUrl = (mime, bytes) =>
  `data:${mime};base64,${"A".repeat(Math.ceil((bytes * 4) / 3))}`;

test("chỉ nhận JPEG, PNG, WebP", () => {
  for (const m of ["image/jpeg", "image/png", "image/webp"]) {
    const r = checkImage(dataUrl(m, 50_000));
    assert.equal(r.ok, true, `${m} phải được chấp nhận`);
  }
  for (const bad of ["data:image/gif;base64,AAAA", "data:text/html;base64,AAAA", "https://x/y.jpg", ""]) {
    assert.equal(checkImage(bad).ok, false, `"${bad.slice(0, 30)}" phải bị từ chối`);
  }
});

test("chặn ảnh quá lớn và quá nhỏ", () => {
  assert.equal(checkImage(dataUrl("image/jpeg", MAX_IMAGE_BYTES + 10_000)).ok, false);
  assert.match(checkImage(dataUrl("image/jpeg", MAX_IMAGE_BYTES + 10_000)).error, /quá lớn/);
  assert.equal(checkImage(dataUrl("image/jpeg", 1000)).ok, false);
  assert.match(checkImage(dataUrl("image/jpeg", 1000)).error, /quá nhỏ/);
  assert.equal(checkImage(dataUrl("image/jpeg", 100_000)).ok, true);
});

const line = (name, visibility, observation = "mô tả gì đó", meaning = "diễn giải gì đó") =>
  ({ name, visibility, observation, meaning });

test("đường khai KHÔNG THẤY bị gỡ hết mô tả và diễn giải", () => {
  const { lines } = sanitizeReading([
    line("Sinh Đạo", "rõ"),
    line("Trí Đạo", "không thấy", "đường này dài và sâu", "bạn suy nghĩ rất logic"),
  ]);
  const hidden = lines.find((l) => l.name === "Trí Đạo");
  assert.equal(hidden.meaning, "", "phần diễn giải phải bị gỡ");
  assert.match(hidden.observation, /Không nhìn rõ/);
  // đường thấy rõ thì giữ nguyên
  const kept = lines.find((l) => l.name === "Sinh Đạo");
  assert.equal(kept.meaning, "diễn giải gì đó");
});

test("đếm đúng số đường nhìn được, kể cả đường mờ", () => {
  assert.equal(sanitizeReading([line("Sinh Đạo", "rõ"), line("Trí Đạo", "mờ")]).visibleCount, 2);
  assert.equal(
    sanitizeReading([line("Sinh Đạo", "rõ"), line("Trí Đạo", "không thấy")]).visibleCount, 1);
  assert.equal(sanitizeReading(palmLines.map((n) => line(n, "không thấy"))).visibleCount, 0);
});

test("ghi chú nói rõ đường nào không thấy, đường nào chỉ thấy mờ", () => {
  const { notes } = sanitizeReading([
    line("Sinh Đạo", "rõ"), line("Trí Đạo", "mờ"),
    line("Tâm Đạo", "không thấy"), line("Vận Mệnh", "không thấy"),
  ]);
  const text = notes.join(" ");
  assert.match(text, /Tâm Đạo/);
  assert.match(text, /Vận Mệnh/);
  assert.match(text, /Trí Đạo/);
  assert.match(text, /mờ/);
});

test("bốn đường đều có hướng dẫn quan sát", () => {
  assert.equal(palmLines.length, 4);
  for (const name of palmLines) {
    assert.ok(palmLineGuide[name], `${name} thiếu hướng dẫn`);
    assert.ok(palmLineGuide[name].where.length > 20);
    assert.ok(palmLineGuide[name].about.length > 20);
  }
  // Sinh Đạo phải nói rõ KHÔNG liên quan tuổi thọ — hiểu lầm phổ biến và có hại
  assert.match(palmLineGuide["Sinh Đạo"].about, /KHÔNG phải độ dài cuộc đời/);
  // Vận Mệnh phải nói rõ không có cũng bình thường
  assert.match(palmLineGuide["Vận Mệnh"].where, /Nhiều người không có/);
});

test("hai vai trò tay đều có giải thích, và khác nhau", async () => {
  const { handRoles, handRoleMeaning, hands } = await import("../src/lib/chi-tay.ts");
  assert.deepEqual([...hands], ["Tay trái", "Tay phải"]);
  assert.equal(handRoles.length, 2);
  for (const r of handRoles) assert.ok(handRoleMeaning[r].length > 30, r + " thiếu giải thích");
  assert.notEqual(handRoleMeaning["Tay thuận"], handRoleMeaning["Tay không thuận"]);
});

test("hướng dẫn chụp có nhắc phải đủ hai tay", async () => {
  const { photoTips } = await import("../src/lib/chi-tay.ts");
  assert.ok(photoTips.some((t) => /hai tay/.test(t)), "thiếu nhắc chụp đủ hai tay");
});
