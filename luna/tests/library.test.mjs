// Link nổi bật trong lib/library.ts được chép tay (để trang chủ không import nội dung bài),
// nên kiểm tra chúng vẫn trỏ tới bài có thật.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LIBRARY_SECTIONS } from "../src/lib/library.ts";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const slugs = (src) => new Set([...src.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]));
const dreams = slugs(read("../src/content/dream-articles.ts"));
const signs = slugs(read("../src/content/yearly-horoscope-2027.ts"));
const sticks = new Set(Array.from({ length: 100 }, (_, i) => `xam-so-${i + 1}`));

const known = { "giac-mo": dreams, "tu-vi-2027": signs, "xin-xam": sticks };

test("mọi link nổi bật trỏ tới bài có thật", () => {
  for (const section of LIBRARY_SECTIONS) {
    for (const { href } of section.featured) {
      const [, kind, slug] = href.split("/");
      assert.ok(known[kind]?.has(slug), `${href} không tồn tại`);
    }
  }
});

test("link trang tổng trỏ tới route có thật", () => {
  for (const section of LIBRARY_SECTIONS) {
    assert.match(section.href, /^\/(tu-vi-2027|tra-cuu#(giac-mo|xin-xam))$/);
  }
});
