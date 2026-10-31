/**
 * Giải mã giấc mơ — phần tại chỗ là TỪ ĐIỂN BIỂU TƯỢNG, không phải phép tính.
 *
 * Khác với Bát Tự hay Thần số học, giấc mơ không có gì để tính ra con số. Thứ
 * làm được tại chỗ là dò các biểu tượng quen thuộc trong mô tả rồi trả về ý
 * nghĩa đã biên sẵn. AI chỉ diễn giải trên những biểu tượng đó, không tự thêm.
 *
 * Ý nghĩa ở đây là nội dung chiêm nghiệm do dự án biên soạn, không phải kết
 * luận tâm lý học. Giấc mơ không có bảng tra đúng sai.
 */

export type DreamSymbol = {
  key: string;
  label: string;
  theme: "Cảm xúc" | "Chuyển động" | "Con người" | "Nơi chốn" | "Thử thách";
  meaning: string;
  /** Các cách viết thường gặp, đã bỏ dấu sẵn khi so khớp. */
  aliases: string[];
};

export const dreamSymbols: DreamSymbol[] = [
  { key: "ran", label: "Rắn", theme: "Thử thách", aliases: ["rắn", "con rắn"],
    meaning: "Thường gắn với chuyển đổi và lột xác, cũng có thể là nỗi sợ đang được nhìn thẳng. Chú ý con rắn ở gần hay xa, bạn sợ hay bình tĩnh." },
  { key: "nuoc", label: "Nước", theme: "Cảm xúc", aliases: ["nước", "dòng nước", "hồ nước"],
    meaning: "Hình ảnh của cảm xúc. Nước trong và lặng thường đi với tâm trạng ổn; nước đục, dâng cao hay sóng lớn đi với lo lắng và áp lực." },
  { key: "bien", label: "Biển", theme: "Cảm xúc", aliases: ["biển", "đại dương", "sóng biển"],
    meaning: "Phần sâu nhất của cảm xúc, nơi bạn chưa chạm tới hết. Biển lặng khác biển động, hãy nhớ lại bạn đứng trên bờ hay đang ở giữa." },
  { key: "mua", label: "Mưa", theme: "Cảm xúc", aliases: ["mưa", "cơn mưa", "trời mưa"],
    meaning: "Gột rửa và giải toả. Đôi khi là nỗi buồn cần được chảy ra cho hết thay vì giữ lại." },
  { key: "lua", label: "Lửa", theme: "Cảm xúc", aliases: ["lửa", "đám cháy", "cháy nhà"],
    meaning: "Năng lượng mạnh: đam mê, giận dữ, hoặc một thứ đang cần kết thúc để dọn chỗ. Để ý bạn đang đốt hay đang bị cháy." },
  { key: "bay", label: "Bay lượn", theme: "Chuyển động", aliases: ["bay", "bay lượn", "biết bay"],
    meaning: "Khát vọng tự do và muốn vượt khỏi giới hạn hiện tại. Bay cao nhẹ nhõm khác hẳn bay mà sợ rơi." },
  { key: "roi", label: "Rơi xuống", theme: "Chuyển động", aliases: ["rơi", "rơi xuống", "ngã xuống", "té xuống"],
    meaning: "Cảm giác mất kiểm soát hoặc thiếu điểm tựa. Hay xuất hiện giữa giai đoạn áp lực hoặc trước một thay đổi lớn." },
  { key: "duoi", label: "Bị đuổi theo", theme: "Thử thách", aliases: ["bị đuổi", "đuổi theo", "chạy trốn", "bị rượt"],
    meaning: "Thường là điều bạn đang né: một trách nhiệm, một cảm xúc, hay một cuộc trò chuyện chưa dám mở. Thứ đuổi bạn là gì cũng quan trọng." },
  { key: "lac", label: "Lạc đường", theme: "Thử thách", aliases: ["lạc đường", "bị lạc", "không tìm được đường"],
    meaning: "Mất phương hướng trong một việc ở đời thực. Hỏi xem bạn đang cố tới đâu mà chưa thấy lối." },
  { key: "muon", label: "Trễ giờ", theme: "Thử thách", aliases: ["trễ giờ", "muộn giờ", "trễ hẹn", "lỡ chuyến"],
    meaning: "Lo không kịp, sợ bỏ lỡ. Thường đi cùng cảm giác mình đang chậm hơn người khác." },
  { key: "thi", label: "Thi cử", theme: "Thử thách", aliases: ["thi cử", "đi thi", "làm bài thi", "kiểm tra"],
    meaning: "Cảm giác bị đánh giá, hoặc tự đặt lên mình một kỳ vọng phải đạt. Không nhất thiết liên quan tới học hành." },
  { key: "rang", label: "Rụng răng", theme: "Thử thách", aliases: ["rụng răng", "gãy răng", "mất răng"],
    meaning: "Một trong những giấc mơ phổ biến nhất. Hay gắn với lo về hình ảnh bản thân, sợ mất mát hoặc sợ nói sai điều gì đó." },
  { key: "khoathan", label: "Khoả thân", theme: "Thử thách", aliases: ["khoả thân", "khỏa thân", "không mặc gì", "quên mặc quần áo"],
    meaning: "Sợ bị phơi bày, sợ người khác thấy phần mình chưa sẵn sàng cho thấy." },
  { key: "nha", label: "Ngôi nhà", theme: "Nơi chốn", aliases: ["ngôi nhà", "căn nhà", "về nhà"],
    meaning: "Hình ảnh của chính bạn và đời sống bên trong. Nhà mới là khởi đầu; nhà cũ là quá khứ và những điều chưa gỡ." },
  { key: "cau", label: "Cây cầu", theme: "Nơi chốn", aliases: ["cây cầu", "qua cầu"],
    meaning: "Một chặng chuyển tiếp. Bạn đang ở đầu cầu, giữa cầu hay đã qua bờ bên kia đều mang ý khác nhau." },
  { key: "nui", label: "Ngọn núi", theme: "Nơi chốn", aliases: ["ngọn núi", "leo núi", "trên núi"],
    meaning: "Mục tiêu lớn hoặc trở ngại đang chắn trước mặt. Leo lên hay đứng nhìn là hai trạng thái khác nhau." },
  { key: "thangmay", label: "Thang máy, cầu thang", theme: "Nơi chốn", aliases: ["thang máy", "cầu thang", "leo thang"],
    meaning: "Những bước lên xuống trong đời. Đi lên thường gắn với tiến triển, đi xuống với việc quay vào bên trong." },
  { key: "xe", label: "Xe cộ", theme: "Chuyển động", aliases: ["lái xe", "xe hơi", "ô tô", "xe máy", "chiếc xe"],
    meaning: "Hành trình và quyền chủ động. Ai đang cầm lái trong giấc mơ là chi tiết đáng chú ý nhất." },
  { key: "guong", label: "Tấm gương", theme: "Con người", aliases: ["tấm gương", "soi gương"],
    meaning: "Tự nhìn lại mình. Hình trong gương khác với mình thật thường nói về khoảng cách giữa bạn và cách bạn tự thấy." },
  { key: "embe", label: "Em bé", theme: "Con người", aliases: ["em bé", "trẻ sơ sinh", "đứa bé"],
    meaning: "Một khởi đầu mới, hoặc phần non nớt trong bạn đang cần được chăm." },
  { key: "nguoimat", label: "Người đã mất", theme: "Con người", aliases: ["người đã mất", "người chết", "ông bà đã mất", "người thân đã mất"],
    meaning: "Thường là nỗi nhớ và những điều chưa kịp nói. Không nên đọc như một điềm báo." },
  { key: "chet", label: "Cái chết", theme: "Chuyển động", aliases: ["cái chết", "mình chết", "chết"],
    meaning: "Hầu như không mang nghĩa đen. Thường là một chặng, một vai trò hoặc một thói quen đang kết thúc." },
  { key: "cuoi", label: "Đám cưới", theme: "Con người", aliases: ["đám cưới", "kết hôn"],
    meaning: "Sự cam kết hoặc hợp nhất hai phần trong bạn. Không nhất thiết nói về chuyện hôn nhân thật." },
  { key: "meo", label: "Mèo", theme: "Con người", aliases: ["con mèo", "chú mèo"],
    meaning: "Độc lập, trực giác và ranh giới riêng. Có thể là lúc bạn nên tin cảm nhận của mình hơn." },
  { key: "cho", label: "Chó", theme: "Con người", aliases: ["con chó", "chú chó"],
    meaning: "Sự trung thành và tình bạn. Chó hiền hay dữ phản ánh cảm giác an toàn của bạn với người xung quanh." },
  { key: "chim", label: "Chim", theme: "Chuyển động", aliases: ["con chim", "đàn chim"],
    meaning: "Tin tức đang tới hoặc mong muốn được nhẹ đi. Chim bay đi và chim đậu lại mang hai sắc thái khác nhau." },
  { key: "ca", label: "Cá", theme: "Cảm xúc", aliases: ["con cá", "đàn cá", "cá bơi"],
    meaning: "Những gì đang chuyển động dưới bề mặt, chưa thành lời. Đôi khi gắn với nguồn lực đang tới." },
  { key: "trang", label: "Mặt trăng", theme: "Cảm xúc", aliases: ["mặt trăng", "trăng tròn", "ánh trăng"],
    meaning: "Thế giới cảm xúc và trực giác. Trăng sáng rõ thường đi với tâm trạng ổn định." },
  { key: "mattroi", label: "Mặt trời", theme: "Cảm xúc", aliases: ["mặt trời", "nắng"],
    meaning: "Sự sáng rõ và sinh lực. Một điều mơ hồ đang dần lộ ra." },
  { key: "tien", label: "Tiền", theme: "Thử thách", aliases: ["tiền", "nhặt được tiền", "mất tiền"],
    meaning: "Giá trị và cảm giác an toàn, không chỉ nói về tài chính. Nhặt được hay đánh mất đều đáng để ý." },
];

/** Bỏ dấu và hạ chữ thường để so khớp không phụ thuộc cách gõ. */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type DetectedSymbol = DreamSymbol & { matched: string };

/** Hạ chữ thường, đổi dấu câu thành khoảng trắng, GIỮ NGUYÊN dấu tiếng Việt. */
function soften(text: string) {
  return ` ${text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim()} `;
}

/**
 * Dò biểu tượng, khớp hai tầng để tránh đồng âm khi bỏ dấu.
 *
 * Bỏ dấu tiếng Việt sinh ra rất nhiều va chạm: "chó"→"cho" đụng "cho rằng",
 * "mưa"→"mua" đụng "mua", "cầu"→"cau" đụng "cau", "tiền"→"tien" đụng "tiên".
 * Nên alias MỘT TỪ bắt buộc khớp có dấu; chỉ alias NHIỀU TỪ mới được khớp ở
 * dạng bỏ dấu, vì cụm dài gần như không va chạm. Sai sót thừa khó chịu hơn
 * sai sót thiếu: bảo người ta mơ thấy chó trong khi họ viết "cho rằng" là lỗi
 * nhìn thấy ngay, còn bỏ sót một biểu tượng thì không ai biết.
 */
export function detectSymbols(text: string): DetectedSymbol[] {
  const accented = soften(text);
  const plain = ` ${normalize(text)} `;
  const found: DetectedSymbol[] = [];
  for (const symbol of dreamSymbols) {
    // Alias dài xét trước để "bị đuổi theo" không bị "bị đuổi" chiếm chỗ.
    const hit = [...symbol.aliases]
      .sort((a, b) => b.length - a.length)
      .find(
        (alias) =>
          accented.includes(` ${alias.toLowerCase()} `) ||
          (alias.includes(" ") && plain.includes(` ${normalize(alias)} `)),
      );
    if (hit) found.push({ ...symbol, matched: hit });
  }
  return found;
}

export const dreamMoods = [
  "Bình yên",
  "Vui",
  "Lo lắng",
  "Sợ hãi",
  "Buồn",
  "Không nhớ rõ",
] as const;
export type DreamMood = (typeof dreamMoods)[number];

export const dreamRecurrences = ["Lần đầu", "Đã mơ vài lần", "Lặp lại thường xuyên"] as const;
export type DreamRecurrence = (typeof dreamRecurrences)[number];

export type GiacMoInput = {
  dream: string;
  mood?: DreamMood | "";
  recurrence?: DreamRecurrence | "";
  /** Bối cảnh đời sống, tuỳ chọn — giấc mơ chỉ có nghĩa khi đặt cạnh đời thực. */
  context?: string;
};

export type GiacMoChart = {
  input: Required<Pick<GiacMoInput, "dream">> & GiacMoInput;
  symbols: DetectedSymbol[];
  /** Các chủ đề xuất hiện, suy ra từ biểu tượng tìm được. */
  themes: string[];
  wordCount: number;
  notes: string[];
};

export function giacMoChart(input: GiacMoInput): GiacMoChart {
  const dream = input.dream.trim();
  if (dream.length < 10) throw new Error("Hãy kể lại giấc mơ dài hơn một chút để có gì đó để đọc.");
  const symbols = detectSymbols(dream);
  const themes = [...new Set(symbols.map((s) => s.theme))];
  const notes: string[] = [];
  if (!symbols.length)
    notes.push(
      "Chưa nhận ra biểu tượng quen thuộc nào trong mô tả. Phần diễn giải sẽ bám vào chính lời kể của bạn.",
    );
  if (symbols.length > 6)
    notes.push("Giấc mơ có nhiều biểu tượng; hãy chú ý vài hình ảnh đọng lại rõ nhất với bạn.");
  if (input.recurrence === "Lặp lại thường xuyên")
    notes.push("Giấc mơ lặp lại thường chỉ vào một chuyện chưa được gỡ, đáng chú ý hơn nội dung từng chi tiết.");
  return {
    input: {
      dream,
      mood: input.mood || "",
      recurrence: input.recurrence || "",
      context: (input.context || "").trim(),
    },
    symbols,
    themes,
    wordCount: normalize(dream).split(" ").filter(Boolean).length,
    notes,
  };
}
