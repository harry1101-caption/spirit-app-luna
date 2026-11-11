/**
 * Trang tra cứu "Nằm mơ thấy …" (/giac-mo/[slug]) — nội dung SEO dài hơn từ điển
 * biểu tượng trong src/lib/giac-mo.ts, mỗi trang trả lời đúng một câu người ta hay gõ.
 *
 * Giọng văn theo luật chung của Lunara: dễ hiểu, hơi tích cực, KHÔNG coi giấc mơ là
 * điềm báo, không đoán tương lai, không gắn số đề. Thêm trang mới: thêm một mục vào
 * DREAM_ARTICLES là đủ (route, sitemap, danh sách liên kết tự cập nhật).
 */

export type DreamArticle = {
  slug: string;
  /** Tên ngắn của biểu tượng, dùng trong danh sách liên kết */
  name: string;
  /** H1, đúng câu người ta tìm */
  title: string;
  /** Mô tả meta, ~150 ký tự */
  description: string;
  intro: string[];
  situations: { title: string; text: string }[];
  /** Cảm xúc khi tỉnh dậy đổi nghĩa ra sao */
  feelings: string;
  questions: string[];
  related: string[];
};

export const DREAM_ARTICLES: DreamArticle[] = [
  {
    slug: "nam-mo-thay-ran",
    name: "Rắn",
    title: "Nằm mơ thấy rắn có ý nghĩa gì?",
    description: "Mơ thấy rắn cắn, rắn đuổi, nhiều rắn hay rắn trong nhà nói gì về bạn? Cách đọc giấc mơ thấy rắn theo tình huống và cảm xúc khi tỉnh dậy.",
    intro: [
      "Rắn là một trong những hình ảnh xuất hiện trong mơ nhiều nhất, và cũng khiến người ta lo nhất. Nhưng trong hầu hết cách đọc giấc mơ, rắn không phải điềm dữ. Nó thường gắn với sự thay đổi: con rắn lột da để lớn lên.",
      "Rắn cũng có thể là hình ảnh của một nỗi sợ bạn đang phải đối mặt, hoặc một người, một chuyện khiến bạn thấy bất an. Muốn hiểu giấc mơ, hãy nhớ lại con rắn ở đâu, làm gì, và bạn phản ứng thế nào.",
    ],
    situations: [
      { title: "Mơ thấy rắn cắn", text: "Thường là một chuyện bạn đã né lâu giờ \"chạm\" tới mình: một cuộc nói chuyện khó, một lời nhận xét làm bạn đau. Vết cắn ở tay hay chân hay gợi tới việc bạn đang làm hoặc hướng mình đang đi." },
      { title: "Mơ thấy rắn đuổi", text: "Bạn đang chạy khỏi một điều gì đó trong đời thật. Thử tự hỏi: mình đang trì hoãn việc gì, hay đang tránh mặt ai?" },
      { title: "Mơ thấy nhiều rắn", text: "Hay xuất hiện khi có nhiều mối lo cùng lúc, mỗi thứ một chút. Đây là lúc nên viết chúng ra để thấy cái nào thật sự cần xử lý trước." },
      { title: "Mơ thấy rắn trong nhà", text: "Ngôi nhà trong mơ thường là đời sống riêng của bạn. Rắn trong nhà gợi tới một căng thẳng gần gũi: gia đình, người ở chung, hay chính thói quen của bạn." },
      { title: "Mơ thấy giết rắn hoặc rắn bỏ đi", text: "Thường là dấu hiệu bạn đang lấy lại cảm giác kiểm soát, hoặc một nỗi lo đang dần qua." },
    ],
    feelings: "Nếu trong mơ bạn bình tĩnh nhìn con rắn, giấc mơ nghiêng về sự thay đổi bạn đã sẵn sàng đón. Nếu bạn hoảng sợ, nó nghiêng về nỗi lo chưa được gọi tên. Cùng một con rắn, cảm xúc của bạn mới là chìa khoá.",
    questions: ["Gần đây có thay đổi nào khiến mình vừa mong vừa sợ không?", "Có ai hay chuyện gì làm mình thấy bất an mà chưa nói ra?", "Nếu con rắn là một phần của mình, nó đang muốn \"lột da\" khỏi điều gì?"],
    related: ["nam-mo-bi-duoi", "nam-mo-thay-meo", "nam-mo-thay-cho"],
  },
  {
    slug: "nam-mo-rung-rang",
    name: "Rụng răng",
    title: "Nằm mơ rụng răng có ý nghĩa gì?",
    description: "Mơ rụng răng, gãy răng, răng lung lay là một trong những giấc mơ phổ biến nhất. Ý nghĩa thật sự và vì sao bạn hay mơ thấy nó.",
    intro: [
      "Mơ rụng răng là giấc mơ rất nhiều người từng gặp, ở mọi lứa tuổi. Dân gian hay sợ đây là điềm xấu về người thân, nhưng không có gì cho thấy giấc mơ báo trước chuyện như vậy.",
      "Cách hiểu phổ biến hơn: răng gắn với hình ảnh bản thân và lời nói. Mơ rụng răng thường xuất hiện khi bạn lo về vẻ ngoài, sợ mất mặt, sợ nói sai, hoặc đang trải qua một giai đoạn thay đổi khiến mình thấy chênh vênh.",
    ],
    situations: [
      { title: "Răng lung lay rồi rụng", text: "Cảm giác một thứ đang dần tuột khỏi tay: công việc, một mối quan hệ, hay sự tự tin. Nó đến từ từ, đúng như cách bạn đang thấy ngoài đời." },
      { title: "Rụng răng mà không đau", text: "Thường nghiêng về sự thay đổi tự nhiên, như một giai đoạn cũ khép lại. Không đau là dấu hiệu bạn đã phần nào chấp nhận." },
      { title: "Rụng răng chảy máu", text: "Cảm xúc mạnh hơn: có thể là một mất mát bạn chưa kịp buồn cho trọn, hoặc một lời nói làm bạn tổn thương." },
      { title: "Cố giấu việc mất răng", text: "Bạn đang lo người khác nhìn thấy điểm yếu của mình, và cố giữ hình ảnh ổn định trước mọi người." },
    ],
    feelings: "Tỉnh dậy thấy hoảng thường đi cùng áp lực đang dồn lên. Tỉnh dậy thấy nhẹ nhõm thì giấc mơ có thể đang nói về việc buông bỏ một thứ không còn hợp với bạn.",
    questions: ["Gần đây mình có lo bị người khác đánh giá không?", "Có lời nào mình muốn nói mà sợ nói sai?", "Mình đang ở giữa một thay đổi nào khiến mình thấy chênh vênh?"],
    related: ["nam-mo-thi-cu", "nam-mo-khoa-than", "nam-mo-roi-tu-tren-cao"],
  },
  {
    slug: "nam-mo-thay-nguoi-da-mat",
    name: "Người đã mất",
    title: "Nằm mơ thấy người đã mất có ý nghĩa gì?",
    description: "Mơ thấy ông bà, cha mẹ hay người thân đã mất nói chuyện, về thăm nhà. Vì sao bạn mơ thấy họ và nên hiểu giấc mơ này thế nào cho nhẹ lòng.",
    intro: [
      "Mơ thấy người thân đã mất là trải nghiệm rất xúc động. Nhiều người lo đây là điềm báo, nhưng cách hiểu gần gũi hơn là: đó là nỗi nhớ, và những điều bạn còn mang theo về người ấy.",
      "Giấc mơ hay đến vào dịp giỗ, Tết, khi bạn mệt mỏi, hay khi bạn đang cần một lời khuyên mà người ấy từng cho. Nó không báo trước điều gì, nó cho bạn một chỗ để nhớ.",
    ],
    situations: [
      { title: "Người đã mất nói chuyện với mình", text: "Lời họ nói trong mơ thường là điều chính bạn đang cần nghe, hoặc điều bạn tin họ sẽ nói. Hãy nhớ lại lời ấy, nó có thể là lời khuyên từ bên trong bạn." },
      { title: "Người đã mất về thăm nhà", text: "Gắn với cảm giác gia đình, sự đủ đầy hoặc thiếu vắng. Hay đến khi trong nhà có chuyện lớn: cưới hỏi, chuyển nhà, người mới." },
      { title: "Người đã mất vẫn còn sống trong mơ", text: "Phần lòng bạn vẫn chưa quen với sự vắng mặt ấy. Đây là một phần rất bình thường của việc thương nhớ." },
      { title: "Người đã mất buồn hoặc im lặng", text: "Có thể bạn còn điều chưa kịp nói, hoặc đang tự trách. Giấc mơ nhắc bạn nhẹ nhàng với chính mình." },
    ],
    feelings: "Tỉnh dậy ấm lòng thường là bạn đang dần bình yên với mất mát. Tỉnh dậy buồn hay day dứt cho thấy nỗi nhớ vẫn cần thêm thời gian, và điều đó không sao cả.",
    questions: ["Có điều gì mình muốn nói với người ấy mà chưa kịp nói?", "Gần đây mình có đang cần lời khuyên mà người ấy từng cho?", "Mình có thể làm gì nhỏ để nhớ về họ, như nấu một món họ thích?"],
    related: ["nam-mo-thay-minh-chet", "nam-mo-ve-nha-cu", "nam-mo-thay-dam-cuoi"],
  },
  {
    slug: "nam-mo-thay-minh-chet",
    name: "Mình chết",
    title: "Nằm mơ thấy mình chết có ý nghĩa gì?",
    description: "Mơ thấy mình chết, mơ thấy người khác chết có phải điềm xấu? Giấc mơ về cái chết thường nói về sự kết thúc và khởi đầu, không phải nghĩa đen.",
    intro: [
      "Mơ thấy mình chết nghe rất đáng sợ, nhưng giấc mơ này gần như không mang nghĩa đen. Trong cách đọc giấc mơ, cái chết thường tượng trưng cho một điều đang kết thúc: một giai đoạn, một vai trò, một thói quen.",
      "Có kết thúc thì mới có khởi đầu. Nhiều người mơ thấy mình chết ngay trước khi ra trường, đổi việc, chia tay, hay chuyển tới nơi ở mới.",
    ],
    situations: [
      { title: "Mơ thấy mình chết rồi sống lại", text: "Hình ảnh rất rõ của việc làm lại từ đầu. Bạn có thể đang bước sang một chặng mới sau một thời gian khó." },
      { title: "Mơ thấy người thân chết", text: "Thường nói về nỗi sợ mất họ, hoặc sự thay đổi trong mối quan hệ, ví dụ con lớn lên và rời nhà. Không phải điềm báo." },
      { title: "Mơ thấy đám tang của mình", text: "Bạn đang nhìn lại cách người khác thấy mình, hoặc muốn khép lại một hình ảnh cũ của bản thân." },
      { title: "Mơ thấy mình sắp chết, cố chạy thoát", text: "Gắn với áp lực lớn và cảm giác bị dồn vào thế bí. Đây là lúc nên giảm tải cho mình." },
    ],
    feelings: "Nếu trong mơ bạn bình thản, giấc mơ nghiêng về một sự chuyển tiếp bạn đã sẵn sàng. Nếu bạn sợ hãi, nó nói về nỗi lo trước thay đổi, chứ không phải về điều sẽ xảy ra.",
    questions: ["Điều gì trong đời mình đang dần khép lại?", "Mình đang sợ mất đi điều gì?", "Nếu được bắt đầu lại một việc, mình muốn đó là việc gì?"],
    related: ["nam-mo-thay-nguoi-da-mat", "nam-mo-roi-tu-tren-cao", "nam-mo-thay-ma"],
  },
  {
    slug: "nam-mo-bi-duoi",
    name: "Bị đuổi",
    title: "Nằm mơ bị đuổi, bị rượt có ý nghĩa gì?",
    description: "Mơ bị người lạ đuổi, bị ma đuổi, chạy mãi không thoát. Giấc mơ bị đuổi thường nói về điều bạn đang né tránh trong đời thật.",
    intro: [
      "Mơ bị đuổi là giấc mơ rất phổ biến, nhất là khi căng thẳng. Cảm giác chạy mà chân không nhấc lên nổi khiến nhiều người tỉnh dậy còn tim đập mạnh.",
      "Cách hiểu thường gặp: thứ đang đuổi bạn là thứ bạn đang né. Có thể là một trách nhiệm, một quyết định, một cảm xúc, hay một cuộc nói chuyện bạn chưa dám mở lời.",
    ],
    situations: [
      { title: "Bị người lạ đuổi", text: "Áp lực chưa rõ hình dạng, một nỗi lo mơ hồ. Thử viết ra những việc đang treo lơ lửng, người lạ đó có thể là một trong số chúng." },
      { title: "Bị người quen đuổi", text: "Có thể có căng thẳng chưa nói ra với chính người ấy, hoặc người ấy đại diện cho một phần tính cách bạn đang né." },
      { title: "Bị con vật đuổi", text: "Thường gắn với bản năng và cảm xúc mạnh như giận dữ, ham muốn hay sợ hãi mà bạn đang cố kìm." },
      { title: "Chạy mãi không thoát", text: "Cảm giác bế tắc. Đôi khi giấc mơ chỉ dừng khi bạn quay lại nhìn thẳng vào thứ đang đuổi mình, ngoài đời cũng vậy." },
    ],
    feelings: "Sợ hãi tột độ cho thấy chuyện bạn né đang nặng dần. Nếu trong mơ bạn đã quay lại đối mặt, đó là dấu hiệu bạn đang sẵn sàng xử lý nó.",
    questions: ["Mình đang trì hoãn việc gì lâu nhất?", "Có cuộc nói chuyện nào mình đang tránh?", "Nếu dừng lại và quay đầu, mình nghĩ sẽ thấy gì?"],
    related: ["nam-mo-thay-ran", "nam-mo-thay-ma", "nam-mo-lac-duong"],
  },
  {
    slug: "nam-mo-roi-tu-tren-cao",
    name: "Rơi từ trên cao",
    title: "Nằm mơ rơi từ trên cao có ý nghĩa gì?",
    description: "Mơ rơi từ trên cao, rơi xuống vực, giật mình tỉnh giấc. Giấc mơ này thường nói về cảm giác mất kiểm soát và thiếu điểm tựa.",
    intro: [
      "Mơ thấy mình rơi, rồi giật mình tỉnh dậy, là trải nghiệm gần như ai cũng từng có. Một phần là phản xạ tự nhiên khi cơ thể chìm vào giấc ngủ.",
      "Khi giấc mơ rơi lặp lại hoặc rất rõ, nó thường gắn với cảm giác mất kiểm soát: công việc chao đảo, một mối quan hệ không chắc chắn, hay đơn giản là bạn đang ôm quá nhiều việc.",
    ],
    situations: [
      { title: "Rơi xuống vực sâu", text: "Nỗi sợ một điều tệ có thể xảy ra mà bạn không chặn được. Thường đến trong giai đoạn nhiều bất định." },
      { title: "Rơi từ nhà cao tầng", text: "Hay gắn với áp lực ở nơi làm việc, sợ đánh mất vị trí hoặc sự công nhận." },
      { title: "Rơi nhưng nhẹ nhàng, không sợ", text: "Đây có thể là cảm giác buông bỏ: bạn đang thả lỏng một thứ mình bám quá chặt." },
      { title: "Có người đẩy mình rơi", text: "Bạn có thể đang thấy bị người khác đặt vào thế khó, hoặc chưa tin tưởng một ai đó." },
    ],
    feelings: "Giật mình hoảng sợ đi với lo lắng và mệt mỏi. Rơi mà bình thản lại nghiêng về chấp nhận và buông bớt.",
    questions: ["Mình đang thấy mất kiểm soát ở đâu?", "Điểm tựa của mình lúc này là gì, là ai?", "Có việc nào mình có thể buông bớt tuần này?"],
    related: ["nam-mo-bay", "nam-mo-thay-minh-chet", "nam-mo-rung-rang"],
  },
  {
    slug: "nam-mo-bay",
    name: "Bay",
    title: "Nằm mơ thấy mình bay có ý nghĩa gì?",
    description: "Mơ thấy mình bay lượn trên trời, bay cao, bay không lên được. Giấc mơ bay thường nói về khát khao tự do và cảm giác vượt qua giới hạn.",
    intro: [
      "Mơ thấy mình bay thường là giấc mơ dễ chịu. Nó gắn với cảm giác tự do, nhẹ nhõm, và mong muốn thoát khỏi những giới hạn hiện tại.",
      "Nhưng cách bạn bay mới quan trọng: bay cao và vui khác hẳn bay chập chờn, sợ rơi, hay muốn bay mà không cất cánh nổi.",
    ],
    situations: [
      { title: "Bay cao, thấy mọi thứ bên dưới", text: "Bạn đang có góc nhìn rộng hơn về một chuyện, hoặc vừa vượt qua một khó khăn và thấy tự tin." },
      { title: "Muốn bay mà không lên được", text: "Có điều gì đang níu bạn lại: trách nhiệm, nỗi sợ, hay sự thiếu tự tin." },
      { title: "Bay rồi sợ rơi", text: "Bạn đang làm tốt nhưng chưa tin là mình xứng đáng, sợ thành công này không bền." },
      { title: "Bay cùng người khác", text: "Mối quan hệ đó cho bạn cảm giác được nâng đỡ và tự do." },
    ],
    feelings: "Bay mà vui là dấu hiệu bạn đang ở trạng thái khá tốt. Bay mà lo thì giấc mơ đang nói về áp lực đi kèm với mong muốn vươn lên.",
    questions: ["Mình đang muốn thoát khỏi điều gì?", "Gần đây mình vượt qua được chuyện gì đáng tự hào?", "Điều gì đang níu mình lại?"],
    related: ["nam-mo-roi-tu-tren-cao", "nam-mo-thi-cu", "nam-mo-lac-duong"],
  },
  {
    slug: "nam-mo-thay-nuoc",
    name: "Nước, lũ lụt",
    title: "Nằm mơ thấy nước, lũ lụt có ý nghĩa gì?",
    description: "Mơ thấy nước trong, nước đục, nước ngập nhà hay lũ cuốn. Nước trong giấc mơ thường phản chiếu cảm xúc của bạn.",
    intro: [
      "Nước là hình ảnh của cảm xúc trong rất nhiều cách đọc giấc mơ. Trạng thái của nước thường giống trạng thái trong lòng bạn.",
      "Nước trong và lặng đi với tâm trạng ổn định. Nước đục, sóng lớn hay lũ dâng thường đi với lo lắng, áp lực, hoặc cảm xúc đang dồn nén.",
    ],
    situations: [
      { title: "Nước trong, lặng", text: "Bạn đang khá bình yên, hoặc đang cần sự yên tĩnh đó. Một giấc mơ dễ chịu." },
      { title: "Nước ngập nhà", text: "Cảm xúc đang tràn vào đời sống riêng: chuyện gia đình, chuyện tình cảm, hay căng thẳng bạn mang về nhà." },
      { title: "Bị lũ cuốn, chết đuối", text: "Cảm giác bị nhấn chìm bởi công việc hay cảm xúc. Đây là lúc nên tìm chỗ dựa, đừng cố bơi một mình." },
      { title: "Bơi giỏi trong nước", text: "Bạn đang xoay xở tốt với cảm xúc của mình, kể cả khi hoàn cảnh không dễ." },
    ],
    feelings: "Cảm giác khi ở trong nước rất quan trọng: thoải mái là bạn ổn với cảm xúc, ngộp thở là bạn đang ôm quá nhiều.",
    questions: ["Gần đây cảm xúc nào đang dâng lên trong mình?", "Mình có đang mang chuyện ngoài về nhà quá nhiều không?", "Ai là người mình có thể kể chuyện lúc này?"],
    related: ["nam-mo-thay-chay-nha", "nam-mo-thay-ca", "nam-mo-ve-nha-cu"],
  },
  {
    slug: "nam-mo-thay-chay-nha",
    name: "Cháy nhà, lửa",
    title: "Nằm mơ thấy cháy nhà, thấy lửa có ý nghĩa gì?",
    description: "Mơ thấy cháy nhà, lửa lớn, dập lửa hay bị bỏng. Lửa trong mơ thường nói về năng lượng mạnh: đam mê, giận dữ hoặc một sự kết thúc.",
    intro: [
      "Lửa là hình ảnh của năng lượng mạnh. Nó có thể là đam mê, sự hứng khởi, nhưng cũng có thể là giận dữ hay một áp lực đang \"nóng\" lên.",
      "Mơ thấy cháy nhà không phải điềm báo hoả hoạn. Ngôi nhà trong mơ thường là đời sống riêng của bạn, nên lửa trong nhà gợi tới một chuyện đang làm xáo trộn bên trong.",
    ],
    situations: [
      { title: "Nhà mình bị cháy", text: "Một thay đổi lớn đang diễn ra trong đời sống riêng, hoặc căng thẳng gia đình đang lên cao." },
      { title: "Đứng xem đám cháy", text: "Bạn đang chứng kiến một chuyện vượt khỏi tầm tay, hoặc đang kìm nén cơn giận." },
      { title: "Dập được lửa", text: "Bạn đang lấy lại kiểm soát, xử lý được một chuyện nóng." },
      { title: "Ngọn lửa ấm, bếp lửa", text: "Hình ảnh của sự ấm áp, gắn kết, và năng lượng tích cực trong gia đình." },
    ],
    feelings: "Sợ hãi trước lửa thường là căng thẳng. Thấy ấm áp, thích thú trước ngọn lửa lại là đam mê và động lực.",
    questions: ["Gần đây điều gì làm mình nóng giận?", "Có điều gì mình đang say mê muốn theo đuổi?", "Trong nhà mình có chuyện gì cần hạ nhiệt?"],
    related: ["nam-mo-thay-nuoc", "nam-mo-ve-nha-cu", "nam-mo-bi-duoi"],
  },
  {
    slug: "nam-mo-thay-em-be",
    name: "Em bé",
    title: "Nằm mơ thấy em bé có ý nghĩa gì?",
    description: "Mơ thấy em bé, bế em bé, em bé khóc hay em bé cười. Giấc mơ thấy em bé thường nói về một khởi đầu mới hoặc phần non nớt trong bạn.",
    intro: [
      "Em bé trong mơ thường là hình ảnh của một khởi đầu mới: một dự định, một mối quan hệ, một ý tưởng vừa \"chào đời\".",
      "Nó cũng có thể là phần non nớt, dễ tổn thương trong bạn, đang cần được chăm sóc và che chở.",
    ],
    situations: [
      { title: "Bế em bé", text: "Bạn đang nhận một trách nhiệm mới, hoặc đang nâng niu một điều quan trọng với mình." },
      { title: "Em bé khóc", text: "Có một nhu cầu của chính bạn đang bị bỏ quên: nghỉ ngơi, được quan tâm, được lắng nghe." },
      { title: "Em bé cười", text: "Một giấc mơ dễ chịu, gắn với niềm vui giản dị và cảm giác mọi thứ đang lớn lên tốt đẹp." },
      { title: "Làm rơi hoặc quên em bé", text: "Lo mình không đủ sức lo cho một việc mới, hoặc sợ bỏ lỡ điều quan trọng." },
    ],
    feelings: "Thấy dịu dàng, ấm áp là bạn đang trân trọng một khởi đầu. Thấy lo lắng là bạn đang tự hỏi mình có đủ sẵn sàng không.",
    questions: ["Điều gì mới đang bắt đầu trong đời mình?", "Phần nào trong mình đang cần được chăm hơn?", "Mình có đang ôm quá nhiều trách nhiệm cùng lúc?"],
    related: ["nam-mo-mang-thai", "nam-mo-thay-dam-cuoi", "nam-mo-thay-nguoi-da-mat"],
  },
  {
    slug: "nam-mo-mang-thai",
    name: "Mang thai",
    title: "Nằm mơ thấy mình mang thai có ý nghĩa gì?",
    description: "Mơ thấy mình có bầu, mơ người khác mang thai, kể cả khi bạn là nam. Giấc mơ mang thai thường nói về một điều đang dần thành hình.",
    intro: [
      "Mơ thấy mình mang thai, kể cả với nam giới hay người chưa nghĩ tới chuyện con cái, là giấc mơ khá phổ biến. Nó hiếm khi nói về chuyện có con thật.",
      "Cách hiểu thường gặp: bạn đang \"ấp ủ\" một điều gì đó: một dự định, một thay đổi, một phiên bản mới của chính mình, đang lớn dần bên trong.",
    ],
    situations: [
      { title: "Mình mang thai và vui", text: "Bạn đang hào hứng với một việc đang chuẩn bị, và tin nó sẽ thành hình." },
      { title: "Mình mang thai và lo", text: "Một trách nhiệm mới làm bạn lo mình chưa đủ sẵn sàng." },
      { title: "Người khác mang thai", text: "Bạn thấy ở người đó một sự thay đổi, hoặc chính bạn mong có được điều họ đang có." },
      { title: "Sắp sinh", text: "Một việc bạn ấp ủ sắp đến lúc ra mắt: nộp đơn, bắt đầu dự án, nói ra một điều." },
    ],
    feelings: "Vui mừng là bạn đang mong chờ. Hoảng sợ thì giấc mơ đang nói về áp lực trước một bước lớn.",
    questions: ["Mình đang ấp ủ dự định nào?", "Điều gì cần thêm thời gian để chín?", "Mình có đang đặt áp lực phải xong quá sớm?"],
    related: ["nam-mo-thay-em-be", "nam-mo-thay-dam-cuoi", "nam-mo-bay"],
  },
  {
    slug: "nam-mo-thay-dam-cuoi",
    name: "Đám cưới",
    title: "Nằm mơ thấy đám cưới có ý nghĩa gì?",
    description: "Mơ thấy mình cưới, mơ đám cưới người yêu cũ hay đám cưới người lạ. Giấc mơ đám cưới thường nói về cam kết và một sự kết hợp mới.",
    intro: [
      "Đám cưới trong mơ thường là hình ảnh của sự cam kết và kết hợp. Nó không nhất thiết nói về chuyện hôn nhân thật.",
      "Bạn có thể đang cam kết với một công việc, một quyết định, hoặc đang hoà hợp hai phần khác nhau trong chính mình.",
    ],
    situations: [
      { title: "Mình là cô dâu, chú rể", text: "Bạn đang bước vào một cam kết mới, hoặc đang nghiêm túc nghĩ về tương lai của một mối quan hệ." },
      { title: "Cưới người lạ", text: "Thường là bạn đang làm quen với một phần mới của bản thân, hoặc một vai trò mới." },
      { title: "Đám cưới của người yêu cũ", text: "Có thể là bạn đang khép lại chuyện cũ, hoặc vẫn còn một chút tiếc nuối cần được nhìn nhận." },
      { title: "Đám cưới bị huỷ, trục trặc", text: "Lo lắng trước một quyết định lớn, sợ mọi thứ không như kế hoạch." },
    ],
    feelings: "Vui vẻ trong đám cưới là bạn đang yên tâm với lựa chọn của mình. Bồn chồn, muốn bỏ chạy là bạn còn phân vân.",
    questions: ["Mình đang chuẩn bị cam kết với điều gì?", "Có lựa chọn nào mình còn phân vân?", "Chuyện cũ nào mình cần khép lại cho gọn?"],
    related: ["nam-mo-thay-nguoi-yeu-cu", "nam-mo-mang-thai", "nam-mo-thay-em-be"],
  },
  {
    slug: "nam-mo-thay-nguoi-yeu-cu",
    name: "Người yêu cũ",
    title: "Nằm mơ thấy người yêu cũ có ý nghĩa gì?",
    description: "Mơ thấy người yêu cũ quay lại, nói chuyện hay có người mới. Giấc mơ này thường nói về bạn của hiện tại hơn là về người ấy.",
    intro: [
      "Mơ thấy người yêu cũ không có nghĩa là bạn còn muốn quay lại, và cũng không báo trước người ấy sẽ liên lạc.",
      "Thường thì người yêu cũ trong mơ đại diện cho một cảm xúc hay một giai đoạn của bạn: cảm giác được yêu, một bài học chưa học xong, hay nỗi sợ lặp lại chuyện cũ trong mối quan hệ hiện tại.",
    ],
    situations: [
      { title: "Người yêu cũ quay lại", text: "Bạn có thể đang thiếu một cảm giác mà mối quan hệ cũ từng cho, chứ chưa chắc là thiếu chính người đó." },
      { title: "Cãi nhau với người yêu cũ", text: "Còn điều chưa nói ra, hoặc cơn giận cũ chưa được giải toả." },
      { title: "Người yêu cũ có người mới", text: "Bạn đang tập chấp nhận rằng chuyện đã qua. Đây thường là một bước của sự buông bỏ." },
      { title: "Mơ về người yêu cũ khi đang có người mới", text: "Hay đến khi mối quan hệ hiện tại có điểm gợi lại chuyện xưa. Không phải dấu hiệu bạn hết thương người hiện tại." },
    ],
    feelings: "Tỉnh dậy nhẹ tênh là bạn đã gần như bình yên với quá khứ. Tỉnh dậy buồn là vẫn còn một chút cần thời gian.",
    questions: ["Mình nhớ người ấy, hay nhớ con người mình thời đó?", "Có bài học nào từ chuyện cũ mình đang áp dụng?", "Điều gì mình muốn có trong mối quan hệ tiếp theo?"],
    related: ["nam-mo-thay-dam-cuoi", "nam-mo-bi-duoi", "nam-mo-ve-nha-cu"],
  },
  {
    slug: "nam-mo-thay-meo",
    name: "Mèo",
    title: "Nằm mơ thấy mèo có ý nghĩa gì?",
    description: "Mơ thấy mèo đen, mèo trắng, mèo cào hay nhiều mèo. Mèo trong giấc mơ thường gắn với trực giác, sự độc lập và ranh giới riêng.",
    intro: [
      "Mèo là con vật độc lập, nhạy bén và biết giữ khoảng cách. Trong mơ, mèo thường gắn với trực giác của bạn, nhu cầu có không gian riêng, và cách bạn đặt ranh giới với người khác.",
      "Mèo đen hay bị gắn với điềm xui trong dân gian, nhưng trong cách đọc giấc mơ, màu lông không quyết định điều gì sẽ xảy ra.",
    ],
    situations: [
      { title: "Mèo thân thiện, quấn quýt", text: "Bạn đang thoải mái với bản thân, và có thể nên tin vào cảm nhận của mình hơn." },
      { title: "Bị mèo cào", text: "Có người hay chuyện gì đang làm bạn khó chịu một cách âm ỉ, hoặc bạn đang thấy ranh giới của mình bị xâm phạm." },
      { title: "Nhiều mèo", text: "Nhiều việc nhỏ đòi bạn để ý cùng lúc, hoặc bạn đang cần nhiều thời gian riêng hơn." },
      { title: "Mèo bị lạc, bị bệnh", text: "Bạn có thể đang bỏ quên trực giác hoặc nhu cầu nghỉ ngơi của chính mình." },
    ],
    feelings: "Thấy dễ chịu với con mèo là bạn đang ổn với sự độc lập của mình. Thấy sợ hay bị làm phiền là có ranh giới đang cần được giữ.",
    questions: ["Mình có đang cần thêm không gian riêng?", "Có lúc nào gần đây mình bỏ qua cảm nhận của chính mình?", "Ai đang vượt qua ranh giới của mình?"],
    related: ["nam-mo-thay-cho", "nam-mo-thay-ran", "nam-mo-thay-ca"],
  },
  {
    slug: "nam-mo-thay-cho",
    name: "Chó",
    title: "Nằm mơ thấy chó có ý nghĩa gì?",
    description: "Mơ thấy chó cắn, chó đuổi, chó hiền hay chó con. Chó trong giấc mơ thường gắn với tình bạn, lòng trung thành và cảm giác an toàn.",
    intro: [
      "Chó là hình ảnh quen thuộc của sự trung thành và tình bạn. Trong mơ, chó thường phản ánh cảm giác của bạn với những người xung quanh: bạn có thấy an toàn và được bảo vệ không.",
      "Chó hiền hay chó dữ, chó lạ hay chó quen, mỗi chi tiết nghiêng giấc mơ về một hướng khác nhau.",
    ],
    situations: [
      { title: "Chó hiền, quấn chân", text: "Bạn có những người đáng tin bên cạnh, hoặc đang mong có thêm sự gắn bó như vậy." },
      { title: "Bị chó cắn", text: "Có thể bạn thấy bị tổn thương bởi một người mình tin, hoặc đang lo một mối quan hệ không còn như trước." },
      { title: "Bị chó đuổi", text: "Một mâu thuẫn trong nhóm bạn bè hay nơi làm việc đang khiến bạn muốn né." },
      { title: "Chó con", text: "Một tình bạn mới, hoặc một trách nhiệm nhỏ đáng yêu đang đến." },
    ],
    feelings: "An tâm bên con chó là bạn tin vào những mối quan hệ của mình. Sợ hãi là có một sự tin tưởng đang lung lay.",
    questions: ["Ai là người mình thấy an toàn nhất lúc này?", "Có mối quan hệ nào đang làm mình chông chênh?", "Mình đã cảm ơn người luôn ở bên mình chưa?"],
    related: ["nam-mo-thay-meo", "nam-mo-bi-duoi", "nam-mo-thay-ran"],
  },
  {
    slug: "nam-mo-thay-ca",
    name: "Cá",
    title: "Nằm mơ thấy cá có ý nghĩa gì?",
    description: "Mơ thấy cá bơi, bắt được cá, cá chết hay cá to. Cá trong giấc mơ thường gắn với những gì đang chuyển động dưới bề mặt cảm xúc.",
    intro: [
      "Cá sống dưới nước, nên trong mơ cá thường gắn với những điều đang chuyển động bên dưới bề mặt: cảm xúc, ý tưởng, trực giác chưa thành lời.",
      "Trong văn hoá Việt, cá còn gắn với sự đủ đầy. Giấc mơ thấy cá vì thế hay mang sắc thái dễ chịu, dù nó không hứa hẹn điều gì cụ thể.",
    ],
    situations: [
      { title: "Cá bơi trong nước trong", text: "Ý tưởng và cảm xúc của bạn đang thông suốt. Một giấc mơ khá nhẹ nhàng." },
      { title: "Bắt được cá", text: "Bạn vừa nắm được một ý tưởng, một cơ hội, hoặc vừa hiểu ra điều gì đó về mình." },
      { title: "Cá chết", text: "Một dự định hay cảm xúc bị bỏ quên lâu. Đây là lời nhắc xem lại điều mình từng quan tâm." },
      { title: "Cá to, cá vàng", text: "Một điều có giá trị đang ở gần, có thể là một mối quan hệ, cũng có thể là sức lực của chính bạn." },
    ],
    feelings: "Thích thú khi thấy cá là bạn đang mở lòng với điều mới. Thấy tiếc hay buồn là có điều bạn muốn quay lại chăm sóc.",
    questions: ["Ý tưởng nào mình đang để dành mà chưa làm?", "Cảm xúc nào mình chưa nói thành lời?", "Mình đang có những nguồn lực nào chưa dùng tới?"],
    related: ["nam-mo-thay-nuoc", "nam-mo-thay-tien", "nam-mo-thay-meo"],
  },
  {
    slug: "nam-mo-thay-tien",
    name: "Tiền",
    title: "Nằm mơ thấy tiền có ý nghĩa gì?",
    description: "Mơ nhặt được tiền, mất tiền, được cho tiền hay đếm tiền. Tiền trong giấc mơ thường nói về giá trị bản thân và cảm giác an toàn.",
    intro: [
      "Mơ thấy tiền không phải dấu hiệu sắp giàu hay sắp mất của. Trong cách đọc giấc mơ, tiền thường tượng trưng cho giá trị: bạn thấy mình đáng giá thế nào, và bạn đang thấy an toàn hay bấp bênh.",
      "Giấc mơ về tiền hay đến khi bạn đang lo chuyện tài chính, đang được hay mất sự công nhận, hoặc đang cân nhắc một quyết định lớn.",
    ],
    situations: [
      { title: "Nhặt được tiền", text: "Bạn vừa nhận ra một điểm mạnh của mình, hoặc đang mong một cơ hội bất ngờ." },
      { title: "Mất tiền", text: "Lo mất đi điều có giá trị: thời gian, công sức, sự tin tưởng, không chỉ là tiền thật." },
      { title: "Được người khác cho tiền", text: "Bạn đang cần được ghi nhận, hoặc được giúp đỡ mà chưa dám nói." },
      { title: "Đếm tiền mãi không xong", text: "Bạn đang tính toán quá nhiều cho một chuyện, có thể là lúc nên chốt lại." },
    ],
    feelings: "Vui khi có tiền là bạn đang thấy mình có giá trị. Lo khi mất tiền là cảm giác an toàn đang lung lay.",
    questions: ["Mình đang thấy mình đáng giá ở điểm nào?", "Điều gì làm mình thấy bấp bênh lúc này?", "Có quyết định nào mình tính toán mãi chưa chốt?"],
    related: ["nam-mo-thay-ca", "nam-mo-thi-cu", "nam-mo-lac-duong"],
  },
  {
    slug: "nam-mo-thi-cu",
    name: "Thi cử",
    title: "Nằm mơ thấy đi thi có ý nghĩa gì?",
    description: "Mơ đi thi không làm được bài, trễ giờ thi, quên học bài, kể cả khi đã ra trường lâu. Giấc mơ thi cử thường nói về cảm giác bị đánh giá.",
    intro: [
      "Nhiều người đã đi làm cả chục năm vẫn mơ thấy mình đi thi, không làm được bài hay quên học. Giấc mơ này hiếm khi nói về học hành.",
      "Nó thường đến khi bạn thấy mình đang bị đánh giá: một buổi phỏng vấn, một dự án quan trọng, hay chính kỳ vọng bạn tự đặt lên mình.",
    ],
    situations: [
      { title: "Không làm được bài", text: "Sợ mình chưa đủ giỏi cho một việc đang làm, hoặc thấy chưa chuẩn bị kỹ." },
      { title: "Trễ giờ thi", text: "Cảm giác chậm hơn người khác, sợ bỏ lỡ cơ hội." },
      { title: "Quên học bài", text: "Bạn đang ôm quá nhiều việc, sợ để sót một thứ quan trọng." },
      { title: "Thi đậu, làm bài tốt", text: "Bạn đang tự tin hơn vào khả năng của mình, một giấc mơ khá tích cực." },
    ],
    feelings: "Hoảng loạn trong phòng thi là áp lực thật đang nặng. Bình tĩnh làm bài là bạn đang nhận ra mình đủ sức hơn mình nghĩ.",
    questions: ["Mình đang thấy bị đánh giá ở đâu?", "Kỳ vọng nào là của mình, kỳ vọng nào là của người khác?", "Lần gần nhất mình làm tốt một việc khó là khi nào?"],
    related: ["nam-mo-rung-rang", "nam-mo-lac-duong", "nam-mo-khoa-than"],
  },
  {
    slug: "nam-mo-thay-ma",
    name: "Ma",
    title: "Nằm mơ thấy ma có ý nghĩa gì?",
    description: "Mơ thấy ma, bị ma đè, bị ma đuổi. Vì sao bạn mơ thấy ma và nên hiểu giấc mơ này thế nào để bớt sợ.",
    intro: [
      "Mơ thấy ma là giấc mơ đáng sợ, nhưng cách hiểu phổ biến là: \"con ma\" thường là một ký ức, một nỗi sợ, hay một chuyện cũ chưa khép lại vẫn còn đeo bám bạn.",
      "Cảm giác \"ma đè\", tỉnh mà không cử động được, là hiện tượng tê liệt khi ngủ khá phổ biến, hay gặp khi thiếu ngủ hoặc căng thẳng, và không nguy hiểm.",
    ],
    situations: [
      { title: "Thấy ma trong nhà", text: "Một chuyện cũ vẫn còn ảnh hưởng đến đời sống hiện tại của bạn." },
      { title: "Bị ma đuổi", text: "Bạn đang né một nỗi sợ hay một ký ức không dễ chịu." },
      { title: "Ma là người quen", text: "Còn điều chưa nói, chưa giải quyết với người đó hoặc với một giai đoạn có người đó." },
      { title: "Bị ma đè", text: "Thường là dấu hiệu cơ thể cần nghỉ ngơi. Ngủ đủ giấc và giảm căng thẳng sẽ giúp bớt gặp lại." },
    ],
    feelings: "Sợ hãi là có điều cũ cần được nhìn thẳng. Nếu bạn bình tĩnh nói chuyện với \"con ma\" trong mơ, đó là dấu hiệu bạn đang sẵn sàng buông nó.",
    questions: ["Chuyện cũ nào vẫn còn đeo bám mình?", "Dạo này mình có ngủ đủ không?", "Mình đang sợ điều gì mà chưa nói với ai?"],
    related: ["nam-mo-bi-duoi", "nam-mo-thay-nguoi-da-mat", "nam-mo-thay-minh-chet"],
  },
  {
    slug: "nam-mo-khoa-than",
    name: "Khoả thân",
    title: "Nằm mơ thấy mình khoả thân có ý nghĩa gì?",
    description: "Mơ thấy mình không mặc quần áo giữa chỗ đông người. Giấc mơ khoả thân thường nói về nỗi sợ bị phơi bày và bị đánh giá.",
    intro: [
      "Mơ thấy mình khoả thân giữa chỗ đông người là giấc mơ ngượng ngùng mà rất nhiều người từng gặp.",
      "Nó thường gắn với cảm giác bị phơi bày: sợ người khác thấy phần mình chưa sẵn sàng cho thấy, sợ bị đánh giá, hay đang ở một vị trí mới mà mình thấy chưa đủ \"áo giáp\".",
    ],
    situations: [
      { title: "Khoả thân nơi công cộng, xấu hổ", text: "Lo lắng về hình ảnh bản thân, sợ mắc lỗi trước mọi người." },
      { title: "Khoả thân mà không ai để ý", text: "Bạn đang lo quá mức. Giấc mơ nhắc rằng người khác không soi mình kỹ như mình nghĩ." },
      { title: "Khoả thân mà thấy thoải mái", text: "Bạn đang dần chấp nhận con người thật của mình, không cần che giấu." },
      { title: "Cố tìm quần áo", text: "Bạn đang tìm cách bảo vệ mình trong một hoàn cảnh mới." },
    ],
    feelings: "Xấu hổ là bạn đang sợ bị nhìn thấu. Thoải mái là bạn đang tự tin hơn với chính mình.",
    questions: ["Mình đang sợ người khác thấy điều gì ở mình?", "Ở đâu mình thấy phải gồng lên nhiều nhất?", "Nếu bớt sợ bị đánh giá, mình sẽ làm gì khác?"],
    related: ["nam-mo-thi-cu", "nam-mo-rung-rang", "nam-mo-lac-duong"],
  },
  {
    slug: "nam-mo-lac-duong",
    name: "Lạc đường",
    title: "Nằm mơ bị lạc đường có ý nghĩa gì?",
    description: "Mơ bị lạc đường, không tìm được nhà, đi mãi không tới nơi. Giấc mơ lạc đường thường nói về cảm giác mất phương hướng.",
    intro: [
      "Mơ bị lạc, đi mãi không tới, hay không tìm thấy đường về nhà thường gắn với cảm giác mất phương hướng trong đời thật.",
      "Nó hay đến khi bạn đang đứng giữa nhiều lựa chọn, vừa có thay đổi lớn, hoặc đang làm một việc mà chưa rõ mình muốn đi tới đâu.",
    ],
    situations: [
      { title: "Lạc ở nơi lạ", text: "Bạn đang ở một môi trường mới, chưa quen, chưa biết bám vào đâu." },
      { title: "Không tìm được đường về nhà", text: "Bạn thấy xa rời với chính mình hoặc với những điều từng làm bạn thấy an toàn." },
      { title: "Hỏi đường mà không ai chỉ", text: "Cảm giác thiếu người hướng dẫn, phải tự xoay xở một mình." },
      { title: "Cuối cùng tìm được đường", text: "Bạn đang dần rõ hướng đi, dù quá trình có hơi vòng vèo." },
    ],
    feelings: "Lo lắng khi lạc là bạn đang cần một định hướng rõ hơn. Tò mò khám phá thì giấc mơ lại nghiêng về sự mở lòng với điều mới.",
    questions: ["Mình đang thật sự muốn đi tới đâu?", "Ai có thể cho mình lời khuyên lúc này?", "Bước nhỏ tiếp theo mình chắc chắn được là gì?"],
    related: ["nam-mo-ve-nha-cu", "nam-mo-thi-cu", "nam-mo-bay"],
  },
  {
    slug: "nam-mo-ve-nha-cu",
    name: "Nhà cũ",
    title: "Nằm mơ thấy nhà cũ có ý nghĩa gì?",
    description: "Mơ về ngôi nhà cũ, nhà thời thơ ấu, nhà ông bà. Giấc mơ về nhà cũ thường nói về quá khứ, ký ức và những điều chưa gỡ.",
    intro: [
      "Ngôi nhà trong mơ thường là hình ảnh của chính bạn. Mơ về nhà cũ, đặc biệt là nhà thời thơ ấu, thường đưa bạn về với ký ức và con người bạn ngày trước.",
      "Giấc mơ này hay đến khi bạn đang nhớ nhà, đang đối mặt với điều gì đó gợi lại tuổi thơ, hoặc đang tìm lại cảm giác an toàn mình từng có.",
    ],
    situations: [
      { title: "Về nhà thời thơ ấu", text: "Bạn đang nhớ cảm giác được che chở, hoặc một phần tuổi thơ còn ảnh hưởng đến bạn bây giờ." },
      { title: "Nhà cũ bị đổ nát", text: "Một giai đoạn đã qua thật sự khép lại, hoặc bạn đang thấy thói quen cũ không còn hợp." },
      { title: "Phát hiện căn phòng lạ trong nhà cũ", text: "Bạn đang khám phá ra điều mới về chính mình, một khả năng hay mong muốn chưa từng để ý." },
      { title: "Không vào được nhà cũ", text: "Cảm giác không thể quay lại, và đang học cách bước tiếp." },
    ],
    feelings: "Ấm áp khi về nhà cũ là bạn đang trân trọng nơi mình lớn lên. Buồn hay bứt rứt là có chuyện cũ cần được gỡ cho nhẹ.",
    questions: ["Mình đang nhớ cảm giác gì của ngày xưa?", "Điều gì từ tuổi thơ vẫn còn ảnh hưởng đến mình?", "Mình có thể gọi về nhà hay thăm ai trong tuần này?"],
    related: ["nam-mo-thay-nguoi-da-mat", "nam-mo-lac-duong", "nam-mo-thay-chay-nha"],
  },
];

export function dreamArticle(slug: string) {
  return DREAM_ARTICLES.find((a) => a.slug === slug) ?? null;
}
