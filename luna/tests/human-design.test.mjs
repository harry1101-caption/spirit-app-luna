import { test } from "node:test";
import assert from "node:assert/strict";
import {
  humanDesignChart, toGate, channels, gateCenter, centers, bodies,
} from "../src/lib/human-design.ts";

const chart = (d, t, tz = 420) => humanDesignChart({ birthDate: d, birthTime: t, tzOffset: tz });

test("dữ liệu nền hợp lệ: 64 cổng, 36 kênh, 9 trung tâm", () => {
  assert.equal(Object.keys(gateCenter).length, 64);
  assert.equal(centers.length, 9);
  assert.equal(channels.length, 36);
  assert.equal(new Set(channels.map((c) => c.join("-"))).size, 36, "có kênh trùng");
  // mọi cổng 1..64 đều thuộc đúng một trung tâm
  for (let g = 1; g <= 64; g += 1) assert.ok(gateCenter[g], `cổng ${g} chưa có trung tâm`);
});

test("mỗi kênh nối hai trung tâm KHÁC nhau", () => {
  for (const [a, b] of channels) {
    assert.notEqual(gateCenter[a], gateCenter[b], `kênh ${a}-${b} nối cùng một trung tâm`);
  }
});

test("bánh xe cổng: 41 mở đầu tại 302°, mỗi cổng 5.625°", () => {
  assert.deepEqual(toGate(302), { gate: 41, line: 1 });
  assert.equal(toGate(302 + 5.624).gate, 41);
  assert.equal(toGate(302 + 5.626).gate, 19); // cổng kế tiếp trên bánh xe
  // 64 cổng × 5.625° = 360°, quay đủ vòng về lại 41
  assert.equal(toGate(302 + 360).gate, 41);
});

test("mỗi cổng có đúng 6 hào, chia đều 0.9375°", () => {
  for (let line = 1; line <= 6; line += 1) {
    const deg = 302 + (line - 1) * 0.9375 + 0.4;
    assert.equal(toGate(deg).line, line, `sai hào tại ${deg}°`);
  }
  // quét toàn vòng: hào luôn trong 1..6, cổng luôn trong 1..64
  for (let d = 0; d < 360; d += 0.37) {
    const { gate, line } = toGate(d);
    assert.ok(gate >= 1 && gate <= 64, `cổng ${gate} ngoài khoảng tại ${d}°`);
    assert.ok(line >= 1 && line <= 6, `hào ${line} ngoài khoảng tại ${d}°`);
  }
});

test("quét toàn vòng phủ đúng 64 cổng, không thiếu không thừa", () => {
  const seen = new Set();
  for (let d = 0; d < 360; d += 0.5) seen.add(toGate(d).gate);
  assert.equal(seen.size, 64);
});

test("Design cách Personality đúng 88 độ cung Mặt Trời", () => {
  const c = chart("1995-08-21", "09:30");
  const pSun = c.personality[0].longitude;
  const dSun = c.design[0].longitude;
  let diff = ((pSun - dSun) % 360 + 360) % 360;
  assert.ok(Math.abs(diff - 88) < 0.001, `lệch ${diff.toFixed(4)}°, phải là 88°`);
  // và rơi vào khoảng ~88 ngày trước
  assert.match(c.designAt, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$/);
});

test("đủ 13 thiên thể ở cả hai bảng, Trái Đất đối xứng Mặt Trời", () => {
  const c = chart("1995-08-21", "09:30");
  assert.equal(c.personality.length, bodies.length);
  assert.equal(c.design.length, bodies.length);
  for (const side of [c.personality, c.design]) {
    const sun = side.find((a) => a.body === "Mặt Trời").longitude;
    const earth = side.find((a) => a.body === "Trái Đất").longitude;
    assert.ok(Math.abs((((earth - sun) % 360) + 360) % 360 - 180) < 1e-6);
    const nn = side.find((a) => a.body === "Bắc Giao Điểm").longitude;
    const sn = side.find((a) => a.body === "Nam Giao Điểm").longitude;
    assert.ok(Math.abs((((sn - nn) % 360) + 360) % 360 - 180) < 1e-6);
  }
});

test("Type suy ra đúng theo luật Xương Cùng và động cơ tới Cổ Họng", () => {
  const seen = new Set();
  for (const d of ["1980-03-07", "1988-11-29", "1995-08-21", "2001-05-14", "2010-09-02", "1973-01-19"]) {
    for (const t of ["03:15", "09:30", "18:45"]) {
      const c = chart(d, t);
      seen.add(c.type);
      const sacral = c.definedCenters.includes("Xương Cùng");
      if (c.type === "Generator" || c.type === "Manifesting Generator")
        assert.ok(sacral, `${d} ${t}: ${c.type} phải có Xương Cùng`);
      if (c.type === "Manifestor" || c.type === "Projector")
        assert.ok(!sacral, `${d} ${t}: ${c.type} không được có Xương Cùng`);
      if (c.type === "Reflector") assert.equal(c.definedCenters.length, 0);
      assert.ok(c.strategy.length > 5);
    }
  }
  assert.ok(seen.size >= 2, `chỉ ra được ${[...seen]} — nghi ngờ logic Type`);
});

test("trung tâm được định nghĩa phải có ít nhất một kênh chạm vào", () => {
  for (const d of ["1980-03-07", "1995-08-21", "2010-09-02"]) {
    const c = chart(d, "11:11");
    for (const center of c.definedCenters) {
      assert.ok(
        c.activeChannels.some((ch) => ch.centers.includes(center)),
        `${d}: trung tâm ${center} được định nghĩa mà không có kênh nào`,
      );
    }
    // định nghĩa và mở phải bù nhau, không chồng lấn
    assert.equal(c.definedCenters.length + c.openCenters.length, 9);
    assert.equal(c.definedCenters.filter((x) => c.openCenters.includes(x)).length, 0);
  }
});

test("Authority theo đúng thứ tự ưu tiên", () => {
  for (const d of ["1980-03-07", "1988-11-29", "1995-08-21", "2001-05-14"]) {
    const c = chart(d, "07:07");
    const has = (x) => c.definedCenters.includes(x);
    if (has("Tùng")) assert.match(c.authority, /Cảm xúc/);
    else if (has("Xương Cùng")) assert.match(c.authority, /Xương Cùng/);
    else if (has("Lá Lách")) assert.match(c.authority, /Lá Lách/);
  }
});

test("Profile là hào Mặt Trời Personality trên hào Mặt Trời Design", () => {
  const c = chart("1995-08-21", "09:30");
  assert.equal(c.profile, `${c.personality[0].line}/${c.design[0].line}`);
  assert.match(c.profile, /^[1-6]\/[1-6]$/);
});

test("múi giờ đổi thì biểu đồ đổi theo", () => {
  const vn = chart("1995-08-21", "09:30", 420);
  const utc = chart("1995-08-21", "09:30", 0);
  assert.notEqual(vn.personality[0].longitude, utc.personality[0].longitude);
});

test("đầu vào sai bị từ chối rõ ràng", () => {
  assert.throws(() => chart("", "09:30"), /chưa hợp lệ/);
  assert.throws(() => chart("1850-01-01", "09:30"), /1900/);
});
