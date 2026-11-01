"use client";

import { useState } from "react";
import { ArrowRight, Check, Compass, Heart, Leaf, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { drawLenormandCards, lenormandCards, lenormandTopics } from "@/lib/lenormand";
import { ReadingSetup } from "@/components/reading-setup";
import type { InterpretationInput } from "@/lib/engine";

const topicChips = lenormandTopics.map(label => ({ label, icon: Compass }));

const suggestions: Record<string, string[]> = {
  "Tình cảm": ["Điều gì đang ảnh hưởng đến mối quan hệ của tôi?", "Tôi có thể làm gì để kết nối chân thành hơn?"],
  "Công việc": ["Điều gì đang mở ra trong công việc của tôi?", "Tôi cần chú ý điều gì trước lựa chọn sắp tới?"],
  "Tài chính": ["Tôi nên nhìn lại thói quen tài chính nào?", "Điều gì giúp tôi quản lý nguồn lực tốt hơn?"],
  "Gia đình": ["Điều gì cần được lắng nghe trong gia đình tôi?", "Tôi có thể tạo thêm sự thấu hiểu bằng cách nào?"],
  "Bản thân": ["Điều gì đang tác động đến tâm trạng của tôi?", "Tôi cần dành sự quan tâm cho điều gì lúc này?"],
  "Tổng quan": ["Điều gì nổi bật trong giai đoạn hiện tại?", "Tôi nên chú ý điều gì trong những ngày tới?"],
};
export function LenormandFlow({ onSubmit, loading }: { onSubmit: (input: InterpretationInput) => void; loading: boolean }) {
  const [topic, setTopic] = useState("Tổng quan");
  const [question, setQuestion] = useState("");
  const [started, setStarted] = useState(false);
  const [drawn, setDrawn] = useState<number[]>([]);

  return <div className={`flow-body lenormand-reading-flow ${started ? "has-started" : "is-configuring"}`}>
    {!started ? <div className="tarot-setup-panel">
      <ReadingSetup
        fieldLabel="Điều bạn muốn tìm hiểu"
        topics={topicChips}
        topicColumns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        topic={topic}
        onTopicChange={setTopic}
        questionId="lenormand-question"
        question={question}
        onQuestionChange={setQuestion}
        placeholder="Bạn muốn nhìn rõ điều gì trong hoàn cảnh hiện tại?"
        suggestionsLabel={`Thử một câu hỏi về ${topic.toLowerCase()}`}
        suggestions={suggestions[topic]}
        submitLabel="Bắt đầu trải bài"
        onSubmit={() => setStarted(true)}
      />
    </div> : <div className="tarot-selection-panel lenormand-selection-panel">
      <div className="tarot-selection-summary"><span><Heart size={15}/>{topic}</span><span>3 lá bài</span><button onClick={() => { setStarted(false); setDrawn([]); }}><RotateCcw size={13}/> Chọn lại</button></div>
      <div className="deck-instruction"><span>{drawn.length ? "Ba biểu tượng dành cho bạn" : "Chậm lại và mở ba lá bài"}</span><p>{drawn.length ? "Đọc từng lá và nhìn cách các biểu tượng kết nối với câu hỏi của bạn." : "Lenormand gợi ý nghĩa qua sự kết hợp giữa các lá."}</p></div>
      {!drawn.length ? <div className="lenormand-card-row">{[0, 1, 2].map(index => <button key={index} className="lenormand-card lenormand-card-back" onClick={() => setDrawn(drawLenormandCards())} aria-label={`Mở trải bài ba lá, bắt đầu từ lá ${index + 1}`}><span>✦</span><small>LENORMAND</small></button>)}</div> : <><div className="lenormand-card-row">{drawn.map((id, index) => { const [name, meaning, symbol] = lenormandCards[id]; return <article className="lenormand-card lenormand-card-face" key={`${name}-${index}`}><span>{symbol}</span><strong>{name}</strong><small>{meaning}</small></article>; })}</div><p className="lenormand-reading-note">Hãy đọc ba lá từ trái sang phải như một câu chuyện. Các ý nghĩa trên là gợi mở để bạn chiêm nghiệm, không phải lời khẳng định về tương lai.</p><Button variant="outline" className="lenormand-redraw" disabled={loading} onClick={() => setDrawn(drawLenormandCards())}>Rút lại ba lá <RotateCcw size={15}/></Button><Button className="lenormand-interpret" disabled={loading} onClick={() => onSubmit({ type: "lenormand", topic, question: question.trim(), cards: drawn })}>{loading ? "Đang luận giải…" : "Luận giải ba lá"}<ArrowRight size={16}/></Button></>}
    </div>}
    {!started ? <section className="tarot-introduction" aria-label="Tìm hiểu về Lenormand"><div className="tarot-introduction-body"><div className="tarot-introduction-context"><section><h2>Lenormand là gì?</h2><p>Lenormand là bộ 36 lá với những hình ảnh gần gũi như ngôi nhà, con đường hay chìa khóa. Ý nghĩa thường hiện ra khi đọc các lá cạnh nhau, như ghép các mảnh của một câu chuyện.</p></section><section><h2>Khi nào nên dùng?</h2><p>Khi bạn muốn soi chiếu một tình huống cụ thể, tìm thêm góc nhìn về các mối liên hệ hoặc nhận ra điều mình cần chú ý trong hiện tại.</p></section></div><section className="tarot-introduction-steps"><h2>Trải bài sao cho phù hợp?</h2><ol><li><strong>Chọn một chủ đề</strong><span>Tập trung vào điều đang diễn ra.</span></li><li><strong>Đặt câu hỏi rõ</strong><span>Hỏi về điều bạn có thể quan sát hoặc chủ động.</span></li><li><strong>Mở ba lá</strong><span>Đọc từng biểu tượng từ trái sang phải.</span></li><li><strong>Ghép ý nghĩa</strong><span>Nhìn mối liên hệ giữa các lá và hoàn cảnh của bạn.</span></li></ol></section></div></section> : null}
    <div className="tarot-afterword"><h3>Lắng nghe câu chuyện từ những lá bài</h3></div>
    <div className="tarot-principles"><div><span><Leaf size={28} strokeWidth={1.2}/></span><div><h4>Một góc nhìn gợi mở</h4><p>Biểu tượng giúp bạn đặt câu hỏi mới cho hiện tại.</p></div></div><div><span><Compass size={28} strokeWidth={1.2}/></span><div><h4>Đọc theo mối liên hệ</h4><p>Ý nghĩa rõ hơn khi các lá được đặt cạnh nhau.</p></div></div><div><span><Check size={28} strokeWidth={1.2}/></span><div><h4>Quyết định vẫn ở bạn</h4><p>Giữ lại điều hữu ích và tự chọn bước tiếp theo.</p></div></div></div>
  </div>;
}
