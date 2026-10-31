import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Load the Next route with its TS aliases resolved, exercising the real handler.
const urlFor = async (path, imports = {}) => {
  let code = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [name, url] of Object.entries(imports)) code = code.replaceAll(`from "${name}"`, `from "${url}"`);
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
};
const tuviUrl = await urlFor('../src/lib/tuvi.ts');
const readingUrl = await urlFor('../src/lib/tuvi-reading.ts', { './tuvi.ts': tuviUrl });
const { tuViPalaceOrder } = await import(tuviUrl);
const { tuViReadingTopics, tuViPalaceRelations } = await import(readingUrl);
const styleUrl = await urlFor('../src/lib/interpretation-style.ts');
const { POST } = await import(await urlFor('../src/app/api/tuvi/route.ts', { '@/lib/tuvi': tuviUrl, '@/lib/tuvi-reading': readingUrl, '@/lib/interpretation-style': styleUrl, zod: import.meta.resolve('zod') }));
const branches = ['Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi','Tý','Sửu','Dần'];
const input = { fullName: 'Test Person', birthDate: '1999-01-11', birthTime: '17h – 17h30', gender: 'Nam', readingYear: 2028, showDecadeFortune: true, showAnnualFortune: true, occupation: 'Đi làm', relationship: 'Độc thân' };
const provider = {
  cuc: 'Thủy nhị cục', ban_menh: 'Thành Đầu Thổ', cung_than: 'Thân cư Thiên Di', am_duong_nam_sinh: 'duong_nam',
  cung: tuViPalaceOrder.map((ten, i) => ({ten, vi_tri: branches[i], chinh_tinh: i === 0 ? [{ten:'Thiên Phủ',trang_thai:'đắc'}] : [], phu_tinh_tot: [], phu_tinh_xau: [], vong_trang_sinh:'Dưỡng', vong_thai_tue:'Thiếu Dương', vong_loc_ton:'Phục Binh', hoa:[], tuan_triet:i===6?['Tuần']:[], la_cung_than:i===6})),
  dai_van: tuViPalaceOrder.map((cung,i)=>({cung,tuoi_bat_dau:2+i*10,tuoi_ket_thuc:11+i*10})),
  tu_hoa_van_han:{nguyen_cuc:[{hoa:'Hóa Lộc',sao:'Tham Lang',vi_tri:'Tỵ',cung:'Phúc Đức'}],dai_van:tuViPalaceOrder.map((cung_dai_van,i)=>({cung_dai_van,can_cung:'Ất',hoa:i===2?[{hoa:'Hóa Kỵ',sao:'Cự Môn',vi_tri:'Ngọ',cung:'Điền Trạch'}]:i===3?[{hoa:'Hóa Kỵ',sao:'Thiên Cơ',vi_tri:'Tý',cung:'Tử Tức'}]:[]}))},
  am_lich:{ngay:24,thang:11,nam:1998,nhuan:false},
  bat_tu:{tu_tru:{nam:'Mậu Dần',thang:'Giáp Tý',ngay:'Quý Hợi',gio:'Tân Dậu'}},
  luu_nien:{tuoi_ta:31,dai_van:{tuoi_bat_dau:22,tuoi_ket_thuc:31,cung:'Phúc Đức',tu_hoa:[]},luu_dai_van:{tuoi:31,cung:'Mệnh',cung_dai_van:'Phúc Đức'},tieu_han:{tuoi:31,cung:'Nô Bộc',chieu:'thuận'},tu_hoa_luu_nien:{can_chi_nam:'Mậu Thân',hoa:[]}},
};
const section = title => ({ title, text: `Luận giải riêng cho ${title}. Phân tích này dựa trên những cung và sao đã được cung cấp trong dữ liệu lá số.`, evidence:['palace:Mệnh'] });
async function run(t, ai) {
  const oldKey = process.env.AI_API_KEY;
  if (ai) process.env.AI_API_KEY = 'test-key'; else delete process.env.AI_API_KEY;
  t.after(() => { if (oldKey === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = oldKey; });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (String(url).includes('huyenminh')) {
      assert.equal(new URL(url).searchParams.get('nam'), '2028');
      assert.ok(!String(url).includes('Test'));
      return Response.json(provider);
    }
    const body = JSON.parse(options.body);
    assert.ok(!options.body.includes('Test Person'));
    assert.equal(JSON.parse(body.messages[1].content).year, 2028);
    return Response.json({choices:[{message:{content:JSON.stringify(ai)}}]});
  });
  const response = await POST(new Request('http://localhost/api/tuvi', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}));
  assert.equal(response.status,200);
  return response.json();
}
test('chart preserves real period bounds, cycle stars and natal transformations when AI is unavailable', async t => {
  const chart = await run(t);
  assert.equal(chart.decadeFortune.age,22);
  assert.equal(chart.decadeFortune.endAge,31);
  assert.equal(chart.periods.find(p=>p.start===22).transformations[0].star,'Cự Môn');
  assert.equal(chart.periods.find(p=>p.start===32).transformations[0].star,'Thiên Cơ');
  assert.equal(chart.palaces[0].annualCycleStar,'Thiếu Dương');
  assert.ok(chart.palaces[2].transformations.includes('Hóa Lộc'));
  assert.equal(chart.interpretation.source,'guide');
  assert.deepEqual(chart.interpretation.sections,[]);
  assert.deepEqual(tuViPalaceRelations(chart,'Mão'),{trine:['Quan Lộc','Tài Bạch'],opposite:'Thiên Di'});
});
test('AI sections are matched by exact title rather than response position', async t => {
  const chart = await run(t,{summary:'Tổng quan riêng của lá số, phân tích Mệnh, Thân, Cục và Âm Dương dựa trên dữ liệu thực tế, không áp dụng lá số mẫu cho người khác.', sections:tuViPalaceOrder.map(section).reverse(),topics:tuViReadingTopics.map(section).reverse()});
  assert.equal(chart.interpretation.source,'ai');
  assert.equal(chart.interpretation.sections[0].title,'Mệnh');
  assert.match(chart.interpretation.sections[0].text,/riêng cho Mệnh/);
  assert.equal(chart.interpretation.topics[0].title,tuViReadingTopics[0]);
});
test('fabricated evidence is rejected rather than shown as a personalized reading', async t => {
  const bad = tuViPalaceOrder.map(section);
  bad[0].evidence=['palace:Không tồn tại'];
  const chart = await run(t,{summary:'Tổng quan riêng của lá số, phân tích Mệnh, Thân, Cục và Âm Dương dựa trên dữ liệu thực tế, không áp dụng lá số mẫu cho người khác.',sections:bad,topics:tuViReadingTopics.map(section)});
  assert.equal(chart.interpretation.source,'guide');
  assert.deepEqual(chart.interpretation.topics,[]);
});
test('fortune references resolve to the current chart rather than rejecting valid AI evidence', async t => {
  const topics = tuViReadingTopics.map(section);
  topics[4].evidence = ['decadeFortune', 'periods'];
  topics[5].evidence = ['annualFortune'];
  const chart = await run(t,{summary:'Tổng quan riêng của lá số, phân tích Mệnh, Thân, Cục và Âm Dương dựa trên dữ liệu thực tế, không áp dụng lá số mẫu cho người khác.',sections:tuViPalaceOrder.map(section),topics});
  assert.equal(chart.interpretation.source,'ai');
  assert.deepEqual(chart.interpretation.topics[4].evidence,['decadeFortune','periods']);
});
