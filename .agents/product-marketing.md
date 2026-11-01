# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-11-01

> Bản nháp tự soạn từ codebase (`luna/`), README, DESIGN.md, nội dung trang chủ và các quyết định trong phiên làm việc ngày 2026-10-31 → 2026-11-01.
> Những chỗ ghi **[CẦN XÁC NHẬN]** là phỏng đoán hoặc chưa có dữ liệu — cần chủ sản phẩm điền.

## Product Overview
**One-liner:** Lunara — cả thế giới tâm linh trong một ứng dụng: Tarot cùng AI, Tử Vi, Thần số học và hơn chục cách soi chiếu bản thân, giải thích bằng lời thường.
**What it does:** Web app (ưu tiên desktop, responsive mobile) cho người Việt, gom các phương pháp luận giải tâm linh quen thuộc vào một chỗ. Người dùng nhập câu hỏi hoặc thông tin (ngày sinh, họ tên…), nhận kết quả được AI diễn giải dễ hiểu, theo hướng chiêm nghiệm chứ không phán định tương lai.
**Product category:** Ứng dụng xem bói / tâm linh / chiêm nghiệm bản thân (người dùng tìm: "xem tarot online", "xem tử vi", "thần số học", "xin xăm online", "giải mã giấc mơ").
**Product type:** Web app B2C (Next.js, deploy Vercel). Hiện chạy ở `lunara-dev.vercel.app`.
**Business model:** Freemium. Hiện tại miễn phí, không cần tài khoản. Tính năng trả phí đầu tiên đã thiết kế: **chân dung "Người thật"** trong *Phác hoạ người ấy* (đang khoá, đo nhu cầu qua sự kiện `phac_hoa_premium_click`). Chưa có cổng thanh toán. **[CẦN XÁC NHẬN: giá, gói, lộ trình trả phí]**

**Danh sách tính năng (theo `tool-groups.ts`):**
- Bói bài: Tarot cùng AI (3 lá, có đào sâu 5 câu hỏi — hiện ẩn nút), Lenormand, Lá bài hôm nay, Bói bài Tây *(sắp ra mắt)*
- Lá số & Ngày sinh: Tử Vi (lá số 12 cung), Bát Tự, Thần số học, Chiêm tinh, Human Design
- Soi tướng & Hình ảnh: **Phác hoạ người ấy** (mới, AI vẽ chì + đọc tướng từ ảnh), Xem chỉ tay, Giải mã giấc mơ, Nhân tướng học *(sắp ra mắt)*, Khuôn mặt kiếp trước *(sắp ra mắt)*
- Gieo quẻ & Lễ Việt: Xin Xăm Quan Âm, Kinh Dịch, Cung mặt trăng *(sắp ra mắt)*, Trắc nghiệm tính cách

## Target Audience
**Target users:** Người Việt trẻ (ước đoán 18–35, nghiêng về nữ) thích xem bói, tarot, cung hoàng đạo, thần số học như một cách hiểu mình và giải trí. **[CẦN XÁC NHẬN bằng analytics/PostHog]**
**Decision-makers:** Chính người dùng (B2C, tự quyết).
**Primary use case:** Đang phân vân về tình cảm, công việc, một quyết định — muốn một góc nhìn để lắng nghe bản thân, nhanh, riêng tư, không phải đi xem thầy.
**Jobs to be done:**
- "Giúp tôi nhìn rõ hơn chuyện tình cảm/công việc mình đang rối" (Tarot, Lenormand, Xin xăm, Kinh Dịch)
- "Cho tôi biết mình là người thế nào" (Thần số học, Tử Vi, Bát Tự, Human Design, Tính cách)
- "Cho tôi chút tò mò, vui vẻ về người ấy / định mệnh" (Phác hoạ người ấy, Lá bài hôm nay)
**Use cases:**
- Rút 3 lá Tarot cho câu hỏi "tôi cần lưu ý gì trong chuyện tình cảm 3 tháng tới?"
- Tra 6 con số thần số học từ họ tên + ngày sinh
- Lập lá số Tử Vi 12 cung xem vận hạn năm
- Phác hoạ chân dung người yêu tương lai, tải ảnh về chia sẻ

## Personas
B2C — không có nhiều vai mua hàng. Hai nhóm người dùng chính (giả thuyết):
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Người tò mò / giải trí | Vui, đẹp, chia sẻ được | App bói tràn quảng cáo, giao diện rẻ tiền | Trải nghiệm đẹp, nhanh, kết quả có ảnh/nội dung đáng chia sẻ |
| Người đang chiêm nghiệm | Hiểu mình, quyết định đúng | Bói truyền thống phán xét, hù doạ; thuật ngữ khó | Diễn giải dễ hiểu, không phán xét, gợi một việc nhỏ làm được ngay |

## Problems & Pain Points
**Core problem:** Muốn có một góc nhìn cho chuyện đang bận lòng nhưng các lựa chọn hiện có hoặc rời rạc, hoặc khó hiểu, hoặc mang tính phán xét/doạ dẫm.
**Why alternatives fall short:**
- Mỗi app/website chỉ làm một môn (chỉ tarot, chỉ tử vi) → phải dùng nhiều nơi
- Nhiều thuật ngữ (Hán Việt, chiêm tinh) không giải thích
- Nội dung "điềm xấu", phán định tương lai gây lo lắng
- Web bói tràn quảng cáo, giao diện kém tin cậy
**What it costs them:** Thời gian tra nhiều nơi; lo lắng thêm vì kết quả tiêu cực; tiền nếu đi xem trực tiếp.
**Emotional tension:** Bối rối, cần được lắng nghe, sợ "bị phán", muốn riêng tư.

## Competitive Landscape
**[CẦN XÁC NHẬN tên đối thủ cụ thể]**
**Direct:** Web/app xem tarot, tử vi, thần số học tiếng Việt — thường chỉ một môn, nhiều quảng cáo, diễn giải kiểu văn mẫu.
**Secondary:** Hội nhóm Facebook/TikTok "xem bài", reader tarot online trả phí — chậm, tốn tiền, chất lượng không đều.
**Indirect:** Hỏi thẳng ChatGPT; tâm sự với bạn bè; đi xem thầy — thiếu nghi thức/trải nghiệm, hoặc tốn kém.

## Differentiation
**Key differentiators:**
- Hơn 15 phương pháp trong một app (Tarot, Tử Vi, Bát Tự, Thần số học, Chiêm tinh, Human Design, Xin xăm, Kinh Dịch, Chỉ tay, Giấc mơ…)
- Diễn giải bằng AI bám vào dữ liệu thật (lá bài, lá số) và lời thường, không thuật ngữ
- Không phán xét, không doạ "điềm xấu"; luôn kết bằng một câu hỏi chiêm nghiệm / một việc nhỏ làm được
- Riêng tư: không cần tài khoản, ngày sinh/câu trả lời không lưu trên máy chủ
- Thẩm mỹ cao cấp: tông lavender–vàng ánh trăng, minh hoạ đồng bộ
- Lá số Tử Vi tính ngay trong app (không gửi ngày giờ sinh ra dịch vụ ngoài)
**How we do it differently:** Engine tính toán thuần (bài, lá số, số học) + AI chỉ diễn giải trên dữ liệu đó, có bản dự phòng khi AI lỗi.
**Why that's better:** Kết quả nhất quán, giải thích được, nhanh, không bịa.
**Why customers choose us:** **[CẦN XÁC NHẬN qua phản hồi người dùng]**

## Objections
| Objection | Response |
|-----------|----------|
| "Bói AI có chính xác không?" | Lunara không đoán tương lai; dùng như góc nhìn để chiêm nghiệm. Phép tính (lá số, con số) hiện rõ từng bước. |
| "Có lấy dữ liệu cá nhân của tôi không?" | Không cần tài khoản; họ tên, ngày sinh, ảnh chỉ dùng để tính/vẽ, không lưu trên máy chủ. |
| "Có mất phí không?" | Các tính năng hiện miễn phí; chỉ chân dung "Người thật" là trả phí (sắp mở). |

**Anti-persona:** Người cần lời khuyên chuyên môn (y tế, pháp lý, tài chính, tâm lý trị liệu) hoặc tin bói toán để ra quyết định lớn thay mình; người tìm "bùa ngải", trấn yểm.

## Switching Dynamics
**Push:** App bói hiện tại nhiều quảng cáo, khó hiểu, doạ dẫm; phải dùng nhiều app.
**Pull:** Đẹp, nhiều môn một chỗ, diễn giải dễ hiểu, riêng tư, có tính năng mới lạ (Phác hoạ người ấy).
**Habit:** Đã quen một reader/hội nhóm; quen xem trên TikTok.
**Anxiety:** "AI có hiểu văn hoá Việt không?", "kết quả có bịa không?", "có bị lưu ảnh/ngày sinh không?"

## Customer Language
**[CẦN BỔ SUNG từ phản hồi thật — feedback "Có, cảm ơn Luna ♡ / Chưa phù hợp", comment Facebook]**
**How they describe the problem (giả thuyết, từ câu hỏi gợi ý trong app):**
- "Tôi cần lưu ý điều gì trong chuyện tình cảm của mình trong 3 tháng tới?"
- "Tôi có thể làm gì để cải thiện sự kết nối trong mối quan hệ hiện tại?"
**How they describe us:** chưa có.
**Words to use:** lắng nghe, soi chiếu, chiêm nghiệm, góc nhìn, hành trình nội tâm, khám phá, người ấy / người thương, gợi mở
**Words to avoid:** điềm xấu, vận đen, chắc chắn sẽ, tiên tri, phán, giải hạn, "100% chính xác"; tránh hứa hẹn kết quả (cũng để qua kiểm duyệt quảng cáo Meta)
**Glossary:**
| Term | Meaning |
|------|---------|
| Trải bài | Rút và đặt các lá Tarot/Lenormand theo vị trí (Quá khứ · Hiện tại · Tương lai) |
| Lá xuôi / lá ngược | Hướng lá bài; lá ngược không đồng nghĩa điểm xấu |
| Lá số | Bản đồ 12 cung Tử Vi lập từ ngày giờ sinh |
| Số chủ đạo / Đường Đời | Con số chính trong Thần số học, tính từ ngày sinh |
| Phác hoạ người ấy | Tính năng AI vẽ chân dung người dành cho bạn (bút chì miễn phí, người thật trả phí) |

## Brand Voice
| Attribute | Means | Doesn't mean | Example line (từ app) |
|-----------|-------|--------------|----------------------|
| Dịu dàng | Nói chậm, ấm, như một người bạn | Sến, uỷ mị | "Chậm lại một nhịp. Ba lá bài đang mở ra câu chuyện của bạn." |
| Không phán xét | Gợi mở, trao quyền lựa chọn | Mơ hồ, né tránh | "Những lá bài chỉ soi đường, bạn mới là người lựa chọn." |
| Dễ hiểu | Lời thường, giải thích thuật ngữ | Hời hợt, bỏ chiều sâu | "Khái niệm và biểu tượng đều được giải thích bằng lời thường, gần gũi và dễ áp dụng ngay." |
| Huyền bí, thơ | Hình ảnh trăng, sao, nhịp chậm | Rùng rợn, doạ | "Đôi khi, câu trả lời không nằm ở việc tìm kiếm, mà ở việc lắng nghe." |

**Tone by context:**
- Support / lỗi: nhẹ nhàng, chỉ cách làm tiếp ("Không nhìn rõ khuôn mặt trong ảnh. Hãy thử ảnh chính diện, đủ sáng — hoặc bỏ ảnh đi cũng được.")
- Launch / social: tò mò, gợi chuyện, câu hỏi mở; **không dùng emoji/icon kiểu "AI"** (người dùng đã yêu cầu bỏ)
- Ads: huyền bí, nhịp mạnh; tránh hứa kết quả
**Terms we own:** "Hành trình nội tâm", "Khám phá thế giới bên trong bạn", "Phác hoạ người ấy"
**Never use (and why):** "chắc chắn", "điềm báo", "giải hạn" — trái nguyên tắc không phán định, dễ bị từ chối khi chạy ads; emoji trang trí — cảm giác văn bản AI.

## Proof Points
**Metrics:** chưa có. **[CẦN: số lượt trải nghiệm, tỉ lệ "hữu ích", lượt quan tâm gói trả phí — có trong PostHog]**
**Customers:** —
**Testimonials:** — (phần feedback trên trang chủ hiện là nội dung minh hoạ, không dùng làm testimonial thật)
**Value themes:**
| Theme | Proof |
|-------|-------|
| Nhiều phương pháp một nơi | 16 công cụ trong `tool-groups.ts` |
| Riêng tư | Không tài khoản; dữ liệu nhập không lưu server (README) |
| Minh bạch | Thần số học hiện từng bước tính; Tử Vi tính tại chỗ |

## Goals
**Business goal:** Thu hút người dùng đầu tiên, lấy phản hồi; kiểm chứng nhu cầu trả phí (chân dung người thật). **[CẦN XÁC NHẬN]**
**Conversion action:** Hoàn thành một trải nghiệm (`experience_complete`); với Phác hoạ: tải ảnh (`phac_hoa_download`), quan tâm trả phí (`phac_hoa_premium_click`).
**Current metrics:** chưa có trong tài liệu.

## Paid Ads (optional)
Đang chuẩn bị chạy ads với video quảng cáo 30s (`lunara-promo-v3.mp4`, nhạc "Arab Nights" — Mixkit). Ngân sách, CPA mục tiêu, tracking: **[CẦN XÁC NHẬN]**
**Agent may:** read, compare, flag, draft, recommend
**Agent may not (without approval):** change budgets or bids, pause or launch, edit tracking, publish ads

## Learnings
*Decisions and tested lessons. Newest first. Keep it to about 20 active entries.*
| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| 2026-11-01 | Copy cho bài đăng/ads không dùng emoji/icon trang trí — người dùng thấy giống AI viết | Yêu cầu trực tiếp của chủ sản phẩm | social, ad-creative, copywriting | active |
| 2026-11-01 | Kết quả trải nghiệm hiển thị trên trang (không modal), tối giản: bỏ nút lưu/chia sẻ/feedback ở cuối kết quả Tarot | Quyết định của chủ sản phẩm | cro, onboarding | active |
| 2026-11-01 | Video ads: nền tối tím–vàng huyền bí, nhạc nhịp mạnh, 30s; khoe tính năng bằng quay màn hình thật + phần tử bay ra 3D | Quyết định của chủ sản phẩm khi làm video | video, ad-creative | active |

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-11-01) — Initial context, tự soạn từ codebase và các quyết định trong phiên làm video/tính năng Phác hoạ người ấy.
