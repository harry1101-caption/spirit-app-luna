import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cards as deck,
  drawCards,
  zodiacFromDate,
  scoreAnswers,
  fallback,
  recommend,
  intents,
} from "../src/lib/engine.ts";
test("zodiac transitions across year and each month", () => {
  assert.equal(zodiacFromDate("2000-01-19"), "Ma Kết");
  assert.equal(zodiacFromDate("2000-01-20"), "Bảo Bình");
  assert.equal(zodiacFromDate("2000-03-20"), "Song Ngư");
  assert.equal(zodiacFromDate("2000-03-21"), "Bạch Dương");
  assert.equal(zodiacFromDate("2000-12-22"), "Ma Kết");
});
test("three-card draws never duplicate or exceed the deck", () => {
  for (let i = 0; i < 100; i++) {
    const cards = drawCards(3);
    assert.equal(new Set(cards).size, 3);
    assert.ok(cards.every((v) => v >= 0 && v < deck.length));
  }
});
test("assessment uses deterministic dimension grouping and score endpoints", () => {
  assert.deepEqual(scoreAnswers(Array(15).fill(1)), [0, 0, 0, 0, 0]);
  assert.deepEqual(scoreAnswers(Array(15).fill(5)), [100, 100, 100, 100, 100]);
  assert.deepEqual(
    scoreAnswers([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]),
    [0, 25, 50, 75, 100],
  );
});
test("daily fallback is stable within the same sign and Vietnam day", () => {
  assert.deepEqual(
    fallback({ type: "daily", sign: "Thiên Bình", day: "2026-10-24" }),
    fallback({ type: "daily", sign: "Thiên Bình", day: "2026-10-24" }),
  );
});
test("tarot report preserves the exact selected cards and spread order", () => {
  const result = fallback({
    type: "tarot",
    cards: [21, 17, 13],
    topic: "Tình yêu",
  });
  assert.deepEqual(result.cards, [21, 17, 13]);
  assert.equal(result.sections.length, 3);
  assert.ok(result.sections[0].text.includes("The World"));
  assert.ok(result.sections[2].text.includes("Death"));
});
test("need routing requires no AI selection", () => {
  assert.equal(recommend(intents[0]), "daily");
  assert.equal(recommend(intents[1]), "tarot");
  assert.equal(recommend(intents[2]), "tarot");
  assert.equal(recommend(intents[3]), "personality");
});

test("deep reading preserves five questions and initial context", () => {
  const initial = fallback({type:"tarot",topic:"Công việc",question:"Tôi nên phát triển thế nào?",cards:[0,1,2]});
  assert.equal(initial.sections.length,3);
  assert.match(initial.sections[0].title,/Quá khứ/);
  assert.equal(initial.followUpQuestions.length,5);
  const deepQuestions = ["Tôi nên ưu tiên gì?", "Tôi gặp cản trở nào?", "Tôi bỏ qua điều gì?", "Tôi có thể làm gì?", "Tôi cần chuẩn bị gì?"];
  const previousReading = {question:initial.context, summary:initial.summary, sections:initial.sections, cards:initial.cards, reversed:initial.reversed};
  const report = fallback({type:"tarot",cards:[3,4,5],deepQuestions,previousReading});
  assert.deepEqual(report.sections.map(section=>section.title),deepQuestions);
  assert.deepEqual(report.previousReading,previousReading);
  assert.equal(report.source,"fallback");
  assert.equal(report.followUpQuestions,undefined);
});
