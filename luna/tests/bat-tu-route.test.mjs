import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Nạp route thật với alias đã thay, để kiểm đúng handler chứ không phải bản chép lại.
const urlFor = async (path, imports = {}) => {
  let code = ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [name, url] of Object.entries(imports)) code = code.replaceAll(`from "${name}"`, `from "${url}"`);
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
};
const termsUrl = await urlFor("../src/lib/solar-terms.ts");
const libUrl = await urlFor("../src/lib/bat-tu.ts", { "./solar-terms.ts": termsUrl });
const styleUrl = await urlFor("../src/lib/interpretation-style.ts");
const apiUrl = await urlFor("../src/lib/bat-tu-api.ts", {
  "./bat-tu.ts": libUrl,
  "./interpretation-style.ts": styleUrl,
  zod: import.meta.resolve("zod"),
});
const { batTuTopics } = await import(apiUrl);
// Lá số và luận giải nay là hai endpoint riêng.
const { POST: CHART } = await import(
  await urlFor("../src/app/api/bat-tu/route.ts", { "@/lib/bat-tu-api": apiUrl })
);
const { POST: INTERPRET } = await import(
  await urlFor("../src/app/api/bat-tu/interpret/route.ts", { "@/lib/bat-tu-api": apiUrl })
);
const post = (fn, body) =>
  fn(new Request("http://localhost/x", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }));

const input = { name: "Người Thử", birthDate: "1995-08-21", birthTime: "09:30", gender: "Nữ" };
const body = (text, evidence) => ({
  title: "", // đặt sau
  text,
  evidence,
});
const longText = "Đây là phần luận giải dài đủ để vượt ngưỡng tối thiểu của schema, nói về Nhật Chủ và sự cân bằng ngũ hành trong lá số này một cách cụ thể.";

function aiPayload(evidencePerSection, { shuffle = false } = {}) {
  const sections = batTuTopics.map((title, i) => ({
    ...body(`${longText} Mục ${i + 1}.`, evidencePerSection),
    title,
  }));
  return { summary: `${longText} Tổng quan toàn cục.`, sections: shuffle ? [...sections].reverse() : sections };
}

async function run(t, ai, { captureBody } = {}) {
  const oldKey = process.env.AI_API_KEY;
  if (ai) process.env.AI_API_KEY = "test-key";
  else delete process.env.AI_API_KEY;
  t.after(() => {
    if (oldKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = oldKey;
  });
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    captureBody?.(JSON.parse(options.body));
    return Response.json({ choices: [{ message: { content: JSON.stringify(ai) } }] });
  });
  const response = await post(INTERPRET, input);
  assert.equal(response.status, 200);
  return response.json();
}

test("endpoint lá số trả về ngay, không chạm tới AI", async (t) => {
  // Nếu có gọi fetch là sai — lá số phải thuần toán lịch.
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("endpoint lá số không được gọi mạng");
  });
  const response = await post(CHART, input);
  assert.equal(response.status, 200);
  const { chart, interpretation } = await response.json();
  assert.equal(interpretation, undefined);
  assert.equal(chart.pillars.length, 4);
  assert.equal(chart.dayMaster.stem, "Giáp");
  assert.equal(chart.luck.direction, "Thuận");
});

test("không có khóa AI thì trả nhánh guide rỗng, không dựng nội dung giả", async (t) => {
  const { interpretation } = await run(t, null);
  assert.equal(interpretation.source, "guide");
  assert.deepEqual(interpretation.sections, []);
});

test("luận giải hợp lệ được giữ lại và sắp theo đúng thứ tự chủ đề", async (t) => {
  const { interpretation } = await run(t, aiPayload(["master", "elements"], { shuffle: true }));
  assert.equal(interpretation.source, "ai");
  assert.deepEqual(
    interpretation.sections.map((s) => s.title),
    [...batTuTopics],
  );
});

test("trích dẫn dữ kiện không có thật thì loại cả bài luận", async (t) => {
  const { interpretation } = await run(t, aiPayload(["pillar:Không tồn tại"]));
  assert.equal(interpretation.source, "guide");
  assert.deepEqual(interpretation.sections, []);
});

test("thiếu chủ đề thì cũng loại, không hiển thị nửa vời", async (t) => {
  const payload = aiPayload(["master"]);
  payload.sections = payload.sections.slice(0, 4);
  const { interpretation } = await run(t, payload);
  assert.equal(interpretation.source, "guide");
});

test("prompt chỉ gửi dữ kiện lá số, không gửi tên người dùng", async (t) => {
  let sent;
  await run(t, aiPayload(["master"]), { captureBody: (b) => (sent = b) });
  const payload = JSON.parse(sent.messages[1].content);
  assert.ok(Array.isArray(payload.evidenceKeys));
  assert.ok(payload.evidenceKeys.includes("pillar:Ngày"));
  assert.equal(JSON.stringify(payload).includes("Người Thử"), false);
});

test("ngày ngoài phạm vi bảng tiết khí bị từ chối rõ ràng", async () => {
  const response = await post(CHART, { birthDate: "1850-05-05", birthTime: "09:00", gender: "Nam" });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /tiết khí/);
});
