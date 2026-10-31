/**
 * Luật viết dùng chung cho mọi phần luận giải AI trong app.
 *
 * Trước đây mỗi prompt chỉ dặn "ấm áp, cụ thể", và model trả về thứ văn vòng
 * vo kiểu "nội quyền của bạn là Xương Cùng, trung tâm thể hiện khả năng cảm
 * nhận và định hướng sự bền bỉ" — định nghĩa thuật ngữ bằng thuật ngữ khác,
 * đọc xong vẫn không biết phải làm gì. Những luật dưới đây là bản đã chỉnh qua
 * nhiều vòng thử thật trên Human Design rồi mới nhân ra các feature còn lại.
 *
 * Giữ ở một chỗ để sửa giọng văn toàn app chỉ phải sửa một nơi.
 */

/** Luật về cách diễn đạt. Ghép vào đầu mỗi SYSTEM prompt. */
export const PLAIN_STYLE = `NGƯỜI ĐỌC KHÔNG BIẾT THUẬT NGỮ. Đây là yêu cầu quan trọng nhất:
- Mỗi lần dùng một từ chuyên môn, phải giải thích ngay bằng lời thường trong cùng câu đó.
- CẤM giải thích thuật ngữ bằng thuật ngữ khác. Kiểu "X của bạn là Y, vốn thể hiện sự bền bỉ" là SAI — vẫn chưa ai hiểu phải làm gì.
- CẤM những cụm nói mà như không nói: "sức mạnh nội tại", "sống hài hòa và hiệu quả hơn", "trưởng thành toàn diện", "kết nối sâu sắc với bản thân", "nền tảng vững chắc", "năng lượng tích cực".
- NHƯNG chỉ giải thích những từ THỰC SỰ chuyên môn. Đừng định nghĩa những chữ ai cũng hiểu — dừng lại cắt nghĩa một việc đời thường là đang coi thường người đọc. Mục nào vốn không có thuật ngữ thì bỏ hẳn bước giải thích, viết thẳng vào nội dung.
- Đừng mở đầu câu bằng "X nghĩa là…" trừ khi X đúng là một từ chuyên môn người đọc chưa chắc biết.
- Câu ngắn, tối đa khoảng 25 chữ một câu.

Mỗi mục phải có đủ ba phần, viết liền mạch thành đoạn văn chứ không gạch đầu dòng:
1. Nói thẳng điều này nghĩa là gì, bằng lời người bình thường nói với nhau. Nếu mục đó vốn đã là một lời khuyên hay một việc cụ thể chứ không phải khái niệm cần cắt nghĩa, bỏ hẳn phần này và vào luôn phần 2.
2. Một tình huống đời thường cụ thể để người đọc tự nhận ra mình. Ví dụ: lúc được rủ nhận một công việc mới, lúc bạn bè hỏi ý kiến, lúc họp mà ai cũng nhìn mình.
3. Một việc nhỏ có thể thử ngay trong tuần này. Riêng những mục vốn đã là một câu hỏi để tự ngẫm thì bỏ phần này.
Đừng mở đầu phần 3 bằng cùng một cụm ở mọi mục. "Bạn có thể thử trong tuần này là…" lặp năm lần đọc như máy — đổi cách vào mỗi mục.

GIỌNG ĐIỆU: nghiêng về mặt tích cực một chút. Nói trước cái đang chạy tốt ở người này. Chỗ nào là điểm khác biệt thì gọi là đặc điểm, đừng gọi là thiếu sót. Nhưng không tâng bốc, không hứa hẹn chuyện sẽ thành công, không nói quá điều mà dữ kiện không có.`;

/**
 * Luật cho field `takeaway` — câu chốt hiện đậm trên đoạn văn, để người đọc
 * lướt qua năm câu là nắm được bài.
 */
export const TAKEAWAY_RULE = `- takeaway: BẮT BUỘC có ở mọi mục, là một field riêng trong JSON chứ không nhét vào text. MỘT câu chốt, dưới 25 chữ, TUYỆT ĐỐI không chứa thuật ngữ, đọc riêng vẫn hiểu.
Câu dưới đây chỉ để bạn thấy ĐỘ CỤ THỂ cần đạt, KHÔNG được chép lại và không được dùng cho lá số khác: "Bạn quyết đúng nhất khi chờ có việc đến rồi mới cân, chứ không tự nghĩ ra việc."
Mỗi takeaway phải viết riêng cho đúng dữ kiện của mục đó.`;

/**
 * Mọi mục phải trích ít nhất một ID — đây là chốt chặn chống bịa, bỏ trống một
 * mục là mở đúng cái cửa đó. Model hay để trống ở mục cuối (mục gợi ý hành
 * động) vì nghĩ lời khuyên thì không trích dẫn gì; phải nói thẳng là không được.
 */
export const EVIDENCE_RULE = `MỌI mục đều phải có ít nhất một ID trong evidence, không trừ mục nào. Mục gợi ý hay mục câu hỏi cũng vậy: lời khuyên phải bám vào một dữ kiện cụ thể của lá số này, chứ không phải lời khuyên chung ai nghe cũng được.`;

/**
 * Nhắc riêng cho những mục dễ bị viết thành lời chê. Kinh nghiệm từ Human
 * Design: dặn chung chung kiểu "đây không phải khuyết điểm" thì model vẫn lách
 * ra được, phải chỉ đích danh mục nào và cấm hẳn vài chữ cụ thể.
 */
export function softenSection(title: string, what: string) {
  return `RIÊNG MỤC "${title}": đây là mục dễ viết thành chê nhất, phải cẩn thận. ${what} Hãy mở đầu bằng mặt lợi, rồi mới nói khi nào nó làm người ta mệt, và cách tự xoay xở. Cấm dùng "khuyết điểm", "thiếu sót", "yếu kém", "dễ bị ảnh hưởng", "dễ bị chi phối" trong câu takeaway.`;
}
