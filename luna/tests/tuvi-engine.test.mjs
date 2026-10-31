import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { tuViEngine, solarToLunar } from "../src/lib/tuvi-engine.ts";

// 78 lá số lấy từ huyenminh.com.vn/api/tuvi (48 để rút quy tắc, 30 để kiểm chéo),
// gồm tháng nhuận, giao thừa và giờ Tý muộn. Engine phải ra đúng từng sao.
const charts = JSON.parse(await readFile(new URL("./fixtures/tuvi-huyenminh.json", import.meta.url), "utf8"));
const hoa = (list) => list.map(({ hoa, sao, vi_tri, cung }) => [hoa, sao, vi_tri, cung]);

for (const { params: p, expected: e } of charts) {
  test(`lá số ${p.d}/${p.m}/${p.y} ${p.h}h${p.p} ${p.gt}, xem năm ${p.nam}`, () => {
    const g = tuViEngine({ day: p.d, month: p.m, year: p.y, hour: p.h, minute: p.p, gender: p.gt, readingYear: p.nam });
    assert.deepEqual(g.am_lich, e.am_lich);
    assert.deepEqual(g.bat_tu.tu_tru, e.tu_tru);
    assert.equal(g.cuc, e.cuc);
    assert.equal(g.am_duong_nam_sinh, e.am_duong_nam_sinh);
    assert.equal(g.ban_menh, e.ban_menh);
    assert.equal(g.cung_than, e.cung_than);
    for (const expected of e.cung) {
      const { hoa: _hoa, tuan_triet, ...palace } = g.cung.find((c) => c.ten === expected.ten);
      const { tuan_triet: expectedBarriers, ...rest } = expected;
      assert.deepEqual(palace, rest, `cung ${expected.ten}`);
      assert.deepEqual([...tuan_triet].sort(), [...expectedBarriers].sort(), `Tuần/Triệt cung ${expected.ten}`);
    }
    assert.deepEqual(g.dai_van, e.dai_van);
    assert.deepEqual(hoa(g.tu_hoa_van_han.nguyen_cuc), e.tu_hoa_goc);
    for (const [palace, [stem, list]] of Object.entries(e.tu_hoa_dai_van)) {
      const period = g.tu_hoa_van_han.dai_van.find((d) => d.cung_dai_van === palace);
      assert.equal(period.can_cung, stem);
      assert.deepEqual(hoa(period.hoa), list);
    }
    const ln = g.luu_nien;
    assert.equal(ln.tuoi_ta, e.luu_nien.tuoi_ta);
    // Huyền Minh trả null khi chưa tới đại vận đầu; engine trả đại vận đầu để route vẫn lập được lá số.
    if (e.luu_nien.dai_van_cung) {
      assert.equal(ln.dai_van.cung, e.luu_nien.dai_van_cung);
      assert.equal(ln.luu_dai_van.cung, e.luu_nien.luu_dai_van_cung);
    } else assert.equal(ln.dai_van.cung, g.dai_van[0].cung);
    assert.deepEqual([ln.tieu_han.cung, ln.tieu_han.chieu], e.luu_nien.tieu_han);
    assert.equal(ln.tu_hoa_luu_nien.can_chi_nam, e.luu_nien.can_chi_nam);
    assert.deepEqual(hoa(ln.tu_hoa_luu_nien.hoa), e.luu_nien.tu_hoa);
  });
}

test("âm lịch: Tết, tháng nhuận và ngày cuối năm", () => {
  assert.deepEqual(solarToLunar(10, 2, 2024), { day: 1, month: 1, year: 2024, leap: false });
  assert.deepEqual(solarToLunar(9, 2, 2024), { day: 30, month: 12, year: 2023, leap: false });
  assert.deepEqual(solarToLunar(24, 5, 2020), { day: 2, month: 4, year: 2020, leap: true });
});
