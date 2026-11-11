/**
 * Trang "Tử vi 2027 tuổi …" (/tu-vi-2027/[slug]): 12 trang cho 12 con giáp,
 * cùng một trang tổng /tu-vi-2027.
 *
 * Phần TÍNH được (can chi, nạp âm, năm sinh, quan hệ của tuổi với năm Mùi)
 * lấy từ bảng tra trong tuvi-engine. Phần CHỮ viết tay theo luật giọng văn
 * chung (lib/interpretation-style.ts): dễ hiểu, hơi tích cực, không doạ,
 * không phán sự kiện. "Xung thái tuế" hay "năm tuổi" được giải thích là năm
 * nhiều chuyển động, không phải năm xui.
 *
 * Tử vi theo con giáp là lời chung cho cả một tuổi; trang luôn dẫn về /tu-vi
 * để lập lá số riêng theo ngày giờ sinh.
 */

import { BRANCHES, STEMS, napAm } from "@/lib/tuvi-engine";

export const YEAR = 2027;
export const YEAR_CAN_CHI = "Đinh Mùi";
/** Mùng 1 Tết Đinh Mùi và ngày cuối năm âm, đã đối chiếu với solarToLunar. */
export const YEAR_START = "6/2/2027";
export const YEAR_END = "25/1/2028";
export const YEAR_NAP_AM = napAm(3, 7); // Thiên Hà Thủy

/** Quan hệ giữa chi của tuổi với chi Mùi của năm. */
export type Relation = "same" | "clash" | "punish" | "harm" | "pair" | "trio" | "neutral";

export const RELATION_INFO: Record<Relation, { label: string; text: string }> = {
  same: {
    label: "Năm tuổi",
    text: "2027 là năm Mùi, trùng con giáp của bạn, dân gian gọi là năm tuổi. Năm tuổi không phải năm xui. Nó giống một mốc tròn: việc cũ khép lại, việc mới mở ra, nên thường nhiều thay đổi hơn mọi năm.",
  },
  clash: {
    label: "Xung với năm",
    text: "Sửu và Mùi đứng đối diện nhau trên vòng 12 con giáp, sách xưa gọi là xung. Hiểu đơn giản: năm nay hay có chuyển động, đổi chỗ, đổi việc, đổi cách nghĩ. Người chủ động đón thay đổi thường thấy năm xung là năm bứt lên.",
  },
  punish: {
    label: "Hình với năm",
    text: "Tuất và Mùi nằm trong nhóm \"tam hình\" Sửu – Tuất – Mùi. Chữ hình ở đây chỉ những va chạm nhỏ trong giao tiếp, kiểu nói thẳng quá mà người nghe phật lòng. Để ý lời ăn tiếng nói là phần lớn đã ổn.",
  },
  harm: {
    label: "Hại với năm",
    text: "Tý và Mùi là cặp \"lục hại\" trong sách cổ, nghĩa là dễ lệch ý nhau ở những chuyện nhỏ. Năm nay nên nói rõ mong muốn của mình, đừng để người khác phải đoán.",
  },
  pair: {
    label: "Lục hợp với năm",
    text: "Ngọ và Mùi là một cặp \"lục hợp\", tức hai con giáp bổ trợ nhau. Năm Mùi thường mang lại người giúp đỡ và những cái gật đầu dễ dàng hơn cho tuổi Ngọ.",
  },
  trio: {
    label: "Tam hợp với năm",
    text: "Hợi, Mão và Mùi là một nhóm \"tam hợp\", ba con giáp cùng nhịp với nhau. Năm Mùi vì thế khá thuận cho bạn, nhất là những việc cần làm cùng người khác.",
  },
  neutral: {
    label: "Bình hoà với năm",
    text: "Con giáp của bạn không xung, không hợp đặc biệt với năm Mùi. Đây là kiểu năm \"tự mình quyết\": kết quả phụ thuộc nhiều vào cách bạn sắp xếp hơn là vào vận năm.",
  },
};

export type SignArea = { title: "Công việc" | "Tiền bạc" | "Tình cảm" | "Sức khoẻ và nhịp sống"; text: string };

export type YearlySign = {
  slug: string;
  /** Tên chi, khớp với BRANCHES */
  branch: string;
  /** Con vật theo cách gọi Việt */
  animal: string;
  relation: Relation;
  /** Câu chốt cả năm, hiện đậm dưới tiêu đề */
  takeaway: string;
  intro: string;
  areas: SignArea[];
  /** Ba việc nhỏ nên làm trong năm */
  tips: string[];
  question: string;
};

export const SIGNS: YearlySign[] = [
  {
    slug: "tuoi-ty",
    branch: "Tý",
    animal: "Chuột",
    relation: "harm",
    takeaway: "Năm của những cuộc nói chuyện rõ ràng: nói ra điều mình muốn thì việc gì cũng nhẹ hơn.",
    intro: "Người tuổi Tý nhanh nhạy, thấy cơ hội trước người khác. Năm Đinh Mùi vẫn giữ được điểm mạnh đó, chỉ là nhịp năm chậm và mềm hơn nhịp quen của bạn. Thay vì chạy trước rồi giải thích sau, năm nay bạn được việc hơn khi kéo người khác đi cùng từ đầu.",
    areas: [
      { title: "Công việc", text: "Bạn vẫn là người có ý tưởng nhanh nhất phòng. Chỗ cần để ý là khoảng cách giữa điều bạn nghĩ và điều người khác hiểu. Một bản tóm tắt ba dòng gửi sau mỗi buổi họp sẽ cứu bạn khỏi rất nhiều hiểu lầm nhỏ trong năm." },
      { title: "Tiền bạc", text: "Năm hợp với việc gom lại hơn là mở rộng. Nếu có khoản chi lớn, hãy để nó \"ngủ\" một tuần rồi mới quyết. Tách một tài khoản riêng cho tiền tiết kiệm, đừng để chung với tiền tiêu hằng ngày." },
      { title: "Tình cảm", text: "Người tuổi Tý hay nghĩ \"chắc người ta hiểu mà\". Năm nay đừng giả định như vậy. Với người đang có đôi, một câu hỏi thẳng \"anh/em đang cần gì từ mình?\" đáng giá hơn mười lần đoán. Người độc thân dễ gặp ai đó qua bạn bè chung." },
      { title: "Sức khoẻ và nhịp sống", text: "Đầu óc bạn ít khi nghỉ. Thử chọn một buổi tối trong tuần không mở điện thoại sau 9 giờ. Giấc ngủ tốt lên thì sự nhạy bén quen thuộc của bạn cũng quay lại." },
    ],
    tips: ["Viết ra ba mục tiêu của năm và gửi cho một người bạn tin", "Sau mỗi việc quan trọng, nhắn lại một tin tóm tắt cho mọi người cùng hiểu", "Giữ một buổi tối trong tuần không màn hình"],
    question: "Điều gì mình đang mong người khác tự hiểu, mà lẽ ra nên nói thẳng?",
  },
  {
    slug: "tuoi-suu",
    branch: "Sửu",
    animal: "Trâu",
    relation: "clash",
    takeaway: "Năm thay đổi để lớn lên: điều bạn cần không phải giữ chặt, mà là chọn đúng việc để buông.",
    intro: "Người tuổi Sửu bền bỉ, đã nhận việc thì làm tới nơi. 2027 là năm Mùi, đối diện tuổi Sửu trên vòng con giáp, nên năm nay hay có chuyện thúc bạn ra khỏi lối quen. Đó có thể là đổi việc, chuyển nhà, hay chỉ là một cách làm mới. Sự chắc chắn vốn có giúp bạn đi qua thay đổi vững hơn người khác.",
    areas: [
      { title: "Công việc", text: "Có thể có lời mời, vị trí mới hoặc một dự án lạ tay. Bạn hay từ chối vì \"chưa chắc làm tốt\". Năm nay thử đổi câu hỏi thành \"mình cần học thêm gì để làm được\". Người tuổi Sửu học chậm mà chắc, đó là lợi thế khi bắt đầu việc mới." },
      { title: "Tiền bạc", text: "Thay đổi thường kéo theo chi phí: chuyển chỗ, học thêm, sắm sửa. Lập một khoản dự phòng bằng ba tháng chi tiêu trước Tết sẽ giúp bạn quyết mọi việc trong năm thoải mái hơn." },
      { title: "Tình cảm", text: "Bạn thể hiện tình cảm bằng việc làm hơn lời nói. Năm nhiều chuyển động, người bên cạnh cần nghe thêm một chút. Một câu \"dạo này mình bận, nhưng mình vẫn ở đây\" giữ được rất nhiều thứ." },
      { title: "Sức khoẻ và nhịp sống", text: "Khi thay đổi đến dồn dập, bạn hay gồng lên chịu một mình. Giữ một thói quen cố định, như đi bộ buổi sáng hay nấu bữa tối, làm điểm tựa cho những tuần bận rộn." },
    ],
    tips: ["Liệt kê một việc nên kết thúc và một việc nên bắt đầu trong năm", "Để dành quỹ dự phòng trước khi nhận thay đổi lớn", "Giữ một thói quen hằng ngày không đổi dù bận"],
    question: "Mình đang giữ điều gì chỉ vì quen, chứ không còn vì thích?",
  },
  {
    slug: "tuoi-dan",
    branch: "Dần",
    animal: "Hổ",
    relation: "neutral",
    takeaway: "Năm tự mình cầm lái: kế hoạch rõ từ đầu năm sẽ quyết định cả năm.",
    intro: "Người tuổi Dần dám nghĩ dám làm, thích đứng ở vị trí dẫn dắt. Năm Mùi không đẩy cũng không cản tuổi Dần, nên kết quả nằm gần như hoàn toàn trong tay bạn. Đây là năm hợp để chọn ít mục tiêu hơn nhưng theo đến cùng.",
    areas: [
      { title: "Công việc", text: "Bạn có sức kéo người khác theo mình. Năm nay hãy dùng nó cho một hai dự án thật sự quan trọng, đừng rải ra mười việc. Đầu năm, viết rõ việc nào mình làm chính, việc nào nhờ người khác." },
      { title: "Tiền bạc", text: "Tuổi Dần hay chi theo cảm hứng, nhất là cho trải nghiệm. Không cần bỏ thói quen đó, chỉ cần đặt trước một con số mỗi tháng cho \"tiền vui\". Tiêu trong khoản đó thì cứ tự nhiên." },
      { title: "Tình cảm", text: "Bạn thẳng thắn và ấm áp, người ta dễ quý. Năm nay để ý nhịp của người kia: không phải ai cũng muốn đi nhanh như bạn. Người độc thân có thể gặp ai đó qua một hoạt động chung như thể thao hay du lịch." },
      { title: "Sức khoẻ và nhịp sống", text: "Năng lượng của bạn lên xuống theo đợt. Ngủ đủ trong những tuần cao điểm quan trọng hơn bạn nghĩ. Một môn vận động đều đặn giúp bạn xả bớt sự nóng vội." },
    ],
    tips: ["Chọn tối đa ba mục tiêu cho cả năm", "Đặt một ngân sách \"tiền vui\" hằng tháng", "Hỏi người thân \"mình có đang đi nhanh quá không?\""],
    question: "Nếu chỉ được làm tốt một việc trong năm nay, mình chọn việc gì?",
  },
  {
    slug: "tuoi-mao",
    branch: "Mão",
    animal: "Mèo",
    relation: "trio",
    takeaway: "Năm thuận người thuận việc: mở lời nhờ giúp, bạn sẽ ngạc nhiên vì nhiều người sẵn lòng.",
    intro: "Người tuổi Mão tinh tế, khéo cư xử, giỏi giữ hoà khí. Mão cùng nhóm tam hợp với Mùi, nên năm Đinh Mùi khá êm với bạn. Những việc cần phối hợp, cần người đồng ý hay cần sự tin tưởng đều dễ hơn mọi năm.",
    areas: [
      { title: "Công việc", text: "Năm hợp để ra mắt điều bạn đã ấp ủ lâu: một dự án riêng, một đề xuất, một lần xin đổi vị trí. Điểm mạnh của bạn là khiến người khác thấy thoải mái. Hãy dùng nó để mời đúng người cùng làm." },
      { title: "Tiền bạc", text: "Thu nhập có thể đến từ những mối quan hệ. Chỗ cần để ý là bạn ngại từ chối, dễ cho mượn hoặc góp tiền vì nể. Đặt sẵn cho mình một mức \"không quá\" trước khi ai đó hỏi." },
      { title: "Tình cảm", text: "Người đang có đôi có thể bàn những chuyện lớn hơn: sống chung, ra mắt gia đình, kế hoạch chung. Người độc thân dễ được giới thiệu. Đừng chỉ chờ người kia bước trước, một lời rủ đơn giản là đủ." },
      { title: "Sức khoẻ và nhịp sống", text: "Bạn hay ôm cảm xúc của người khác vào mình. Năm nhiều gặp gỡ, nhớ chừa những buổi chỉ có mình với mình để lấy lại sức." },
    ],
    tips: ["Mở lời nhờ một người giúp việc bạn đang làm dở", "Đặt trước mức tiền tối đa có thể cho mượn", "Giữ một buổi cuối tuần cho riêng mình mỗi tháng"],
    question: "Có việc gì mình đang chờ \"đủ chín\" mà thật ra đã có thể bắt đầu?",
  },
  {
    slug: "tuoi-thin",
    branch: "Thìn",
    animal: "Rồng",
    relation: "neutral",
    takeaway: "Năm để xây cho chắc: những gì bạn làm âm thầm năm nay là bệ phóng cho năm sau.",
    intro: "Người tuổi Thìn có tầm nhìn lớn và thích làm những việc có dấu ấn. Năm Mùi bình hoà với tuổi Thìn, không mang tới cú hích lớn nhưng cũng không cản. Đây là năm tốt để củng cố: học thêm, sắp lại việc, chăm những mối quan hệ quan trọng.",
    areas: [
      { title: "Công việc", text: "Bạn có thể thấy năm nay hơi chậm so với mong muốn. Thay vì sốt ruột, hãy dùng thời gian này để làm chắc nền: một kỹ năng mới, một quy trình gọn hơn, một người cộng sự đáng tin. Kết quả sẽ hiện ra rõ hơn về cuối năm." },
      { title: "Tiền bạc", text: "Hợp với tích luỹ đều đặn hơn là đầu tư mạo hiểm. Nếu có ý định lớn, hãy hỏi ý kiến người hiểu chuyện và cho mình thời gian tìm hiểu kỹ." },
      { title: "Tình cảm", text: "Bạn hay đặt kỳ vọng cao, cho mình và cho người khác. Năm nay thử khen nhiều hơn góp ý. Người bên cạnh sẽ thấy nhẹ nhõm và gần bạn hơn." },
      { title: "Sức khoẻ và nhịp sống", text: "Khi có mục tiêu lớn, bạn hay quên nghỉ. Đặt lịch nghỉ phép ngay từ đầu năm, như một cuộc hẹn không được huỷ." },
    ],
    tips: ["Chọn một kỹ năng để học đến nơi đến chốn", "Mỗi tuần khen một người một điều cụ thể", "Đặt lịch nghỉ phép ngay từ tháng Giêng"],
    question: "Nền móng nào mình cần xây kỹ hơn trước khi đi xa?",
  },
  {
    slug: "tuoi-ti",
    branch: "Tỵ",
    animal: "Rắn",
    relation: "neutral",
    takeaway: "Năm nghĩ kỹ rồi làm gọn: sự sâu sắc của bạn được việc nhất khi biến thành hành động.",
    intro: "Người tuổi Tỵ điềm tĩnh, quan sát kỹ và ít khi quyết vội. Năm Mùi bình hoà với tuổi Tỵ. Năm nay bạn không thiếu ý tưởng hay phân tích; điều làm nên khác biệt là bạn có chịu bắt tay vào sớm hơn thường lệ hay không.",
    areas: [
      { title: "Công việc", text: "Bạn nhìn ra vấn đề mà người khác bỏ qua. Năm nay đừng chỉ giữ nhận xét đó trong đầu. Đề xuất một cách sửa cụ thể, dù nhỏ, sẽ giúp bạn được tin giao việc lớn hơn." },
      { title: "Tiền bạc", text: "Bạn vốn cẩn thận với tiền. Năm nay có thể dành một khoản nhỏ để học về đầu tư dài hạn, theo kiểu đều đặn, không chạy theo tin đồn." },
      { title: "Tình cảm", text: "Bạn quan tâm sâu nhưng ít nói ra, người kia đôi khi thấy khó đoán. Một tin nhắn hỏi han giữa ngày, một lời cảm ơn đúng lúc là đủ để người ta thấy được sự ấm áp của bạn." },
      { title: "Sức khoẻ và nhịp sống", text: "Bạn hay nghĩ nhiều vào buổi tối. Viết ra giấy những điều đang lo trước khi ngủ, để đầu óc không phải giữ chúng cả đêm." },
    ],
    tips: ["Mỗi tháng đề xuất một cải tiến nhỏ ở chỗ làm", "Nhắn một lời hỏi han cho người thân giữa tuần", "Viết vài dòng trước khi ngủ để nhẹ đầu"],
    question: "Ý tưởng nào mình đã nghĩ đủ lâu, giờ chỉ còn thiếu bước bắt đầu?",
  },
  {
    slug: "tuoi-ngo",
    branch: "Ngọ",
    animal: "Ngựa",
    relation: "pair",
    takeaway: "Năm có người cùng chạy: hợp tác đúng người, bạn đi xa hơn hẳn đi một mình.",
    intro: "Người tuổi Ngọ nhiệt tình, thích tự do và hay là người khởi động mọi việc. Ngọ và Mùi là cặp lục hợp, nên năm Đinh Mùi thường mang tới người đồng hành hợp ý: một cộng sự, một người thầy, hay một nửa đúng nhịp.",
    areas: [
      { title: "Công việc", text: "Năm hợp để làm chung: lập nhóm, nhận dự án cùng người khác, tìm người hướng dẫn. Bạn giỏi khởi động, người kia có thể giỏi theo đến cùng. Chia rõ vai từ đầu là xong." },
      { title: "Tiền bạc", text: "Có thể có thêm nguồn thu từ việc làm chung. Khi góp vốn hay chia lợi nhuận với ai, hãy ghi ra giấy dù là bạn thân. Rõ ràng từ đầu giữ được cả tiền lẫn tình." },
      { title: "Tình cảm", text: "Một trong những năm thuận nhất cho chuyện tình cảm của tuổi Ngọ. Người độc thân dễ gặp người hợp tính. Người đang có đôi hợp để cùng lên một kế hoạch dài hơi, như một chuyến đi hay một dự định chung." },
      { title: "Sức khoẻ và nhịp sống", text: "Bạn có nhiều năng lượng nhưng dễ ôm việc. Học cách nói \"để mình xem lịch đã\" thay vì nhận ngay mọi lời rủ." },
    ],
    tips: ["Tìm một người cùng làm cho mục tiêu lớn nhất năm", "Ghi lại thoả thuận tiền bạc bằng văn bản", "Trả lời lời rủ sau khi xem lịch, không nhận ngay"],
    question: "Ai là người mình muốn cùng đi một đoạn đường dài trong năm nay?",
  },
  {
    slug: "tuoi-mui",
    branch: "Mùi",
    animal: "Dê",
    relation: "same",
    takeaway: "Năm tuổi là năm làm mới: dọn chỗ cho điều bạn thật sự muốn.",
    intro: "Người tuổi Mùi hiền hoà, chu đáo, giỏi chăm lo cho người khác. 2027 là năm Mùi, tức năm tuổi của bạn. Năm tuổi thường nhiều thay đổi hơn mọi năm, nhưng phần lớn là thay đổi bạn đã chờ lâu. Đây là lúc nghĩ cho mình nhiều hơn một chút.",
    areas: [
      { title: "Công việc", text: "Bạn có thể thấy công việc hiện tại hết thử thách, hoặc có cơ hội rẽ sang hướng khác. Đừng vội quyết trong một tuần. Hãy liệt kê điều mình học được ở chỗ cũ và điều mình muốn ở chỗ mới, rồi chọn." },
      { title: "Tiền bạc", text: "Năm tuổi hợp để dọn dẹp tài chính: trả bớt khoản nợ nhỏ, huỷ những gói đăng ký không dùng, gom các tài khoản lại. Gọn gàng rồi thì mọi quyết định sau dễ hơn." },
      { title: "Tình cảm", text: "Bạn quen nhường. Năm nay thử nói ra điều mình cần, kể cả chuyện nhỏ như muốn đi đâu cuối tuần. Người thương bạn sẽ vui khi được biết." },
      { title: "Sức khoẻ và nhịp sống", text: "Đây là năm đẹp để bắt đầu một thói quen chăm mình: khám sức khoẻ định kỳ, tập đều, ăn uống có giờ. Coi đó là món quà cho năm tuổi." },
    ],
    tips: ["Dọn một góc nhà hoặc một khoản tài chính lộn xộn ngay đầu năm", "Mỗi tuần nói ra một mong muốn nhỏ của mình", "Đặt lịch khám sức khoẻ định kỳ"],
    question: "Năm nay mình muốn sống cho điều gì nhiều hơn?",
  },
  {
    slug: "tuoi-than",
    branch: "Thân",
    animal: "Khỉ",
    relation: "neutral",
    takeaway: "Năm của sự tập trung: bớt mở thêm việc mới, làm cho xong việc đang dở.",
    intro: "Người tuổi Thân thông minh, linh hoạt, học gì cũng nhanh. Năm Mùi bình hoà với tuổi Thân. Bạn không thiếu cơ hội, điều cần là chọn lọc. Năm nay bạn được việc nhất khi biết khép bớt những thứ đang dở dang.",
    areas: [
      { title: "Công việc", text: "Bạn hay nhận nhiều việc cùng lúc vì việc nào cũng thấy hay. Đầu năm, liệt kê mọi thứ đang làm và chọn ra hai ba việc quan trọng nhất. Những việc còn lại, hoặc giao đi, hoặc tạm gác." },
      { title: "Tiền bạc", text: "Bạn giỏi tìm cách kiếm thêm. Năm nay hãy theo dõi chi tiêu ít nhất ba tháng liền. Biết tiền đi đâu là bước đầu để giữ được nó." },
      { title: "Tình cảm", text: "Bạn vui tính, dễ làm người khác cười. Người bên cạnh đôi khi muốn thấy cả mặt nghiêm túc của bạn. Thử dành một buổi nói chuyện thật lòng về những điều cả hai mong." },
      { title: "Sức khoẻ và nhịp sống", text: "Đầu óc bạn chạy nhanh, dễ mất tập trung vì điện thoại. Tắt thông báo không cần thiết là thay đổi nhỏ mà lợi lớn." },
    ],
    tips: ["Viết danh sách việc đang dở và khép bớt ít nhất một việc", "Ghi chi tiêu trong ba tháng đầu năm", "Tắt thông báo của các ứng dụng không cần thiết"],
    question: "Việc dở dang nào mình nên hoàn thành, hoặc thôi hẳn, trước khi nhận thêm việc mới?",
  },
  {
    slug: "tuoi-dau",
    branch: "Dậu",
    animal: "Gà",
    relation: "neutral",
    takeaway: "Năm cho người chăm chỉ: sự kỹ lưỡng của bạn sẽ được nhìn thấy, miễn là bạn cho người khác thấy.",
    intro: "Người tuổi Dậu chỉn chu, đúng giờ, làm việc có trật tự. Năm Mùi bình hoà với tuổi Dậu. Đây là năm sự cẩn thận của bạn được việc, với điều kiện bạn chịu kể ra những gì mình đã làm, thay vì lặng lẽ làm hết.",
    areas: [
      { title: "Công việc", text: "Bạn thường là người lo phần việc không ai thấy. Năm nay ghi lại những việc mình đã xong mỗi tháng và chia sẻ với cấp trên. Đó không phải khoe, đó là giúp người ta biết giao việc gì cho bạn." },
      { title: "Tiền bạc", text: "Bạn quản lý tiền khá tốt. Năm nay thử đặt một mục tiêu tiết kiệm có tên cụ thể, như một khoá học hay một chuyến đi, để việc để dành có thêm niềm vui." },
      { title: "Tình cảm", text: "Bạn để ý từng chi tiết, đôi khi thành ra hay nhắc. Thử đổi một lời nhắc thành một lời cảm ơn. Không khí trong nhà sẽ khác đi thấy rõ." },
      { title: "Sức khoẻ và nhịp sống", text: "Bạn đặt chuẩn cao cho mình nên hay căng. Cho phép mình làm một việc \"tạm ổn\" mỗi tuần, không cần hoàn hảo." },
    ],
    tips: ["Ghi lại việc đã làm được mỗi tháng", "Đặt tên cho mục tiêu tiết kiệm của năm", "Đổi một lời nhắc thành một lời cảm ơn mỗi ngày"],
    question: "Việc tốt nào mình đã làm mà chưa ai biết, kể cả chính mình cũng quên ghi nhận?",
  },
  {
    slug: "tuoi-tuat",
    branch: "Tuất",
    animal: "Chó",
    relation: "punish",
    takeaway: "Năm nói ít mà chắc: giữ lời nói mềm, bạn giữ được cả việc lẫn người.",
    intro: "Người tuổi Tuất trung thành, ngay thẳng và rất trọng chữ tín. Tuất và Mùi nằm trong nhóm tam hình, nên năm nay dễ có va chạm nhỏ trong giao tiếp. Cái gốc tốt của bạn, sự thẳng thắn, chỉ cần thêm chút mềm mỏng là thành điểm mạnh.",
    areas: [
      { title: "Công việc", text: "Bạn hay nói thẳng khi thấy điều chưa đúng. Năm nay hãy giữ nguyên ý, chỉ đổi cách nói: bắt đầu bằng điều đang tốt, rồi mới tới chỗ cần sửa. Những góp ý của bạn sẽ được nghe nhiều hơn." },
      { title: "Tiền bạc", text: "Tránh đứng ra bảo lãnh hay cho mượn số tiền lớn chỉ vì cả nể. Nếu muốn giúp, hãy giúp trong khả năng mất được mà không áy náy." },
      { title: "Tình cảm", text: "Bạn chung thuỷ và che chở người mình thương. Khi giận, hãy đợi một đêm rồi mới nói. Cuộc nói chuyện sáng hôm sau thường nhẹ hơn nhiều." },
      { title: "Sức khoẻ và nhịp sống", text: "Bạn hay lo cho người khác hơn lo cho mình. Dành thời gian cho một sở thích riêng giúp bạn xả bớt căng thẳng tích luỹ." },
    ],
    tips: ["Góp ý theo thứ tự: điều tốt trước, điều cần sửa sau", "Đợi qua một đêm trước khi trả lời lúc đang giận", "Chỉ cho mượn số tiền mình có thể mất mà không áy náy"],
    question: "Điều mình muốn nói, có cách nào nói để người kia dễ nghe hơn không?",
  },
  {
    slug: "tuoi-hoi",
    branch: "Hợi",
    animal: "Lợn",
    relation: "trio",
    takeaway: "Năm được nâng đỡ: lòng tốt bạn trao đi những năm trước bắt đầu quay về.",
    intro: "Người tuổi Hợi rộng lượng, chân thành, sống tình cảm. Hợi cùng nhóm tam hợp với Mùi, nên năm Đinh Mùi khá thuận cho bạn. Người quen cũ, mối quan hệ cũ có thể mang tới những cơ hội mới.",
    areas: [
      { title: "Công việc", text: "Hãy nối lại liên lạc với đồng nghiệp cũ, thầy cô cũ, khách hàng cũ. Một lời hỏi thăm có thể mở ra một việc hợp với bạn. Năm nay cũng hợp để nhận vai trò lớn hơn trong nhóm." },
      { title: "Tiền bạc", text: "Bạn hào phóng, hay chi cho người khác. Không cần thay đổi điều đó, chỉ cần để riêng một khoản tiết kiệm tự động mỗi tháng trước khi tiêu." },
      { title: "Tình cảm", text: "Năm ấm áp cho chuyện tình cảm. Người độc thân có thể gặp ai đó qua người quen giới thiệu. Người đang có đôi hợp để cùng làm một việc ý nghĩa, như chăm sóc gia đình hai bên." },
      { title: "Sức khoẻ và nhịp sống", text: "Bạn thích ăn ngon và gặp gỡ, năm nhiều tiệc tùng. Giữ ngủ đủ và uống đủ nước là đủ để vui mà không mệt." },
    ],
    tips: ["Nhắn hỏi thăm ba người quen cũ trong tháng đầu năm", "Cài khoản tiết kiệm tự động mỗi tháng", "Giữ giờ ngủ cố định trong mùa lễ Tết"],
    question: "Ai trong quá khứ mình muốn liên lạc lại năm nay?",
  },
];

export function yearlySign(slug: string) {
  return SIGNS.find((s) => s.slug === slug);
}

/** Năm sinh dương lịch của một con giáp, kèm can chi và mệnh nạp âm. */
export function birthYears(branch: string, from = 1948, to = 2019) {
  const b = BRANCHES.indexOf(branch);
  const years: { year: number; canChi: string; napAm: string }[] = [];
  for (let y = from; y <= to; y++) {
    const yb = (((y - 4) % 12) + 12) % 12;
    if (yb !== b) continue;
    const ys = (((y - 4) % 10) + 10) % 10;
    years.push({ year: y, canChi: `${STEMS[ys]} ${BRANCHES[yb]}`, napAm: napAm(ys, yb) });
  }
  return years;
}

export function signTitle(s: YearlySign) {
  return `Tử vi ${YEAR} tuổi ${s.branch}: công việc, tiền bạc, tình cảm năm ${YEAR_CAN_CHI}`;
}

export function signDescription(s: YearlySign) {
  const ys = birthYears(s.branch).map((y) => y.year).filter((y) => y >= 1960 && y <= 2008);
  return `Tử vi năm ${YEAR_CAN_CHI} cho tuổi ${s.branch} (sinh năm ${ys.join(", ")}): ${RELATION_INFO[s.relation].label.toLowerCase()}, công việc, tiền bạc, tình cảm và việc nên làm.`;
}
