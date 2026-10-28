# Luna — một khoảng nhỏ cho chính mình

Website ưu tiên desktop, responsive cho người Việt, xây bằng Next.js App Router, TypeScript, Tailwind CSS và **shadcn/ui (Base UI)**. Áp dụng Vercel React Best Practices: lazy-load GSAP, tính điểm thuần, cập nhật theo sự kiện, không gửi nội dung riêng tư vào telemetry.

## Chạy tại máy

Yêu cầu Node.js 22.16+ và npm.

```sh
npm install
npm run dev
```

Mở http://localhost:3000. Production: `npm run build` rồi `npm start`.

## Đã triển khai

- Trang chủ thiên thể theo ảnh tham chiếu Diffui, header kính nổi sticky và menu thu gọn trên mobile; không dùng bottom navigation.
- Onboarding 2 bước theo nhu cầu, gợi ý phương pháp theo quy tắc, bỏ qua hoặc đổi lựa chọn.
- Tarot 1/3 lá: bộ 78 lá (22 Ẩn chính và 56 Ẩn phụ), rút ngẫu nhiên không trùng, lật từng lá, giữ nguyên lá khi tạo báo cáo.
- Chiêm tinh phương Tây: chọn một trong 12 cung hoặc nhập ngày sinh, tính cung theo ngày; cache theo cung và ngày Việt Nam. Không gọi đây là Tử Vi Việt Nam.
- Bài tự khám phá 15 câu, 5 chiều tính cách, điểm cố định theo nhóm câu hỏi, biểu đồ và báo cáo. Đây không phải bài đo tâm lý đã kiểm định.
- Báo cáo có lưu, chia sẻ qua Web Share/clipboard, feedback. Lịch sử trên thiết bị có đọc lại và xóa từng kết quả.
- Quản lý sở thích, xóa dữ liệu và opt-in analytics. Sự kiện phát dưới dạng CustomEvent `luna:analytics`; chưa kết nối dịch vụ analytics bên ngoài.
- Motion GSAP cho entrance và section reveals; Lenis là smooth-scroll engine duy nhất; CSS cho hiệu ứng hover và lật bài. Chế độ giảm chuyển động bỏ qua Lenis/GSAP và hiển thị trạng thái tĩnh. Hero dùng artwork có phản hồi theo con trỏ, không WebGL.

## AI phía server

Sao chép `.env.example` thành `.env.local` và cấu hình tại máy:

```
AI_API_KEY=...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

API dùng giao thức OpenAI-compatible `chat/completions` với JSON response. Khóa chỉ được đọc phía server, không đưa vào client bundle. Khi không có khóa, provider lỗi, timeout 15 giây hoặc JSON sai schema, app dùng diễn giải dự phòng và ghi rõ trên báo cáo. Bản chạy tại máy chưa cấu hình khóa nên dùng fallback.

`POST /api/interpret` kiểm tra Zod, giới hạn payload 8KB và giới hạn 30 request/10 phút/IP trong một process. Giới hạn/caching trong memory phù hợp demo một instance; trước production nhiều instance cần Redis/KV và proxy tin cậy. Nội dung ngày còn được cache trong trình duyệt để refresh không đổi báo cáo.

Câu hỏi Tarot được gửi tới backend và, nếu đã cấu hình, tới AI provider để diễn giải; chỉ lưu lịch sử nếu người dùng chủ động bấm lưu. Ngày sinh và các câu trả lời quiz không được lưu. Báo cáo ngày cache trên thiết bị không chứa ngày sinh. Không có đăng ký, tài khoản, đồng bộ, thanh toán hay chatbot.

## Cấu trúc

- `src/components/luna-app.tsx`: navigation, dashboard, onboarding, local history, preferences.
- `src/components/experiences.tsx`: ba trải nghiệm và trình bày báo cáo.
- `src/components/ui/`: components do shadcn CLI tạo, được tùy chỉnh theo thiết kế Luna.
- `src/lib/engine.ts`: dữ liệu bài, zodiac, routing, chấm điểm, nội dung fallback.
- `src/app/api/interpret/route.ts`: validation, throttling, provider, cache và fallback.
- `src/lib/analytics.ts`: sự kiện opt-in không chứa dữ liệu nhạy cảm.

## Kiểm tra

```sh
npm test
npm run lint
npm run build
```

Tests bao phủ các mốc đổi cung, uniqueness của bài, điểm theo chiều và biên, daily consistency, giữ nguyên spread và routing theo nhu cầu. Kiểm tra trình duyệt: daily → save, trải 3 lá → reveal → report, 15 câu quiz → chart/report; responsive desktop/mobile.

## Artwork và phạm vi

Artwork thiên thể mới được tạo bằng Diffui theo ảnh tham chiếu do người dùng cung cấp; tải về và phục vụ từ project. Xem `public/images/PROVENANCE.md`. Tarot sử dụng đủ 78 bản quét Rider–Waite–Smith lưu tại `public/images/tarot/`. Có tùy chọn lá ngược mặc định tắt, ý nghĩa riêng cho từng lá, ảnh đúng lá khi lật và báo cáo, và thao tác phóng to ảnh. ID 0–21 được giữ nguyên để tương thích lịch sử cũ. Ghi công và nguồn bản quét tại `public/images/tarot/CREDITS.md`, nguồn từng file tại `sources.json`. Không có dữ liệu người dùng mẫu, testimonials hay số liệu tương tác giả.

Định hướng thiết kế tại `DESIGN.md`. Tử Vi truyền thống, thần số học, chỉ tay, marketplace và cộng đồng nằm ngoài MVP. Bản này phát triển local trong workspace, chưa triển khai hosting công khai.

## Bản redesign theo Diffui

Trang chủ có hero toàn chiều rộng, thẻ thông điệp hai cột, ba trải nghiệm, chọn theo nhu cầu và bộ sưu tập cá nhân. Trải nghiệm mở thành trang rộng; Tarot dùng quạt 9 lá để chọn, báo cáo chia cột; thư viện có bộ lọc. Tất cả artwork nằm local, không hotlink URL chứa token. Theo yêu cầu của người dùng, không chạy thêm testing hoặc build validation cho bản chỉnh cuối.

## Tarot 78 lá

Mỗi lá có tên Anh/Việt, nhóm, chủ đề, ý nghĩa xuôi/ngược và ảnh. Các ý nghĩa tiếng Việt là nội dung chiêm nghiệm do dự án biên soạn, không sao chép mô tả từ website Tarot hiện đại. 56 lá Ẩn phụ gồm Gậy, Cốc, Kiếm và Tiền. Ba lá đọc theo Hiện tại → Điều tác động → Góc nhìn. Nội dung dự phòng liên kết chủ đề trải bài và nhu cầu đã chọn; AI nếu được cấu hình chỉ diễn giải dữ kiện cố định.

Ảnh gốc là tác phẩm của Pamela Colman Smith. Do Wikimedia giới hạn tải hàng loạt, bản quét Pam-A được lấy từ bản lưu trên TarotCards (nguồn quét Steve P.), với metadata public domain. Không dùng bản tô màu thương mại hiện đại. Xem ghi công để phân biệt nguồn quét thực tế với Commons tham chiếu tác phẩm gốc. Khôi phục file thiếu bằng `python3 scripts/download-tarot.py`.
