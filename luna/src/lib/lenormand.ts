export const lenormandCards = [
  ["Kỵ sĩ", "Tin tức và chuyển động", "♘"], ["Cỏ ba lá", "Cơ hội nhỏ", "☘"], ["Con thuyền", "Hành trình và thay đổi", "⛵"],
  ["Ngôi nhà", "Sự ổn định", "⌂"], ["Cái cây", "Sự phát triển", "♧"], ["Đám mây", "Điều chưa rõ", "☁"],
  ["Con rắn", "Điều phức tạp", "♢"], ["Quan tài", "Khép lại một chặng", "▣"], ["Bó hoa", "Niềm vui và lời mời", "✿"],
  ["Lưỡi hái", "Quyết định nhanh", "✦"], ["Cây roi", "Sự lặp lại", "╳"], ["Chim chóc", "Trò chuyện", "♬"],
  ["Đứa trẻ", "Khởi đầu mới", "✧"], ["Con cáo", "Sự thận trọng", "♧"], ["Con gấu", "Sức mạnh", "♟"],
  ["Ngôi sao", "Hy vọng và định hướng", "☆"], ["Con cò", "Sự dịch chuyển", "♧"], ["Con chó", "Sự đồng hành", "♙"],
  ["Tòa tháp", "Ranh giới", "♜"], ["Khu vườn", "Cộng đồng", "❀"], ["Ngọn núi", "Trở ngại", "△"],
  ["Ngã rẽ", "Lựa chọn", "◇"], ["Chuột", "Điều hao hụt", "♧"], ["Trái tim", "Tình cảm", "♡"],
  ["Chiếc nhẫn", "Cam kết", "◌"], ["Quyển sách", "Điều chưa biết", "▤"], ["Lá thư", "Thông điệp", "✉"],
  ["Người nam", "Một người liên quan", "♙"], ["Người nữ", "Một người liên quan", "♙"], ["Hoa huệ", "Sự bình yên", "⚜"],
  ["Mặt trời", "Sự rõ ràng", "☼"], ["Mặt trăng", "Cảm xúc", "☾"], ["Chìa khóa", "Lối mở", "⚿"],
  ["Đàn cá", "Dòng chảy nguồn lực", "≈"], ["Mỏ neo", "Điểm tựa", "⚓"], ["Thánh giá", "Gánh nặng và ý nghĩa", "✝"],
] as const;

export const lenormandTopics = ["Tình cảm", "Công việc", "Tài chính", "Gia đình", "Bản thân", "Tổng quan"] as const;

export function drawLenormandCards(): number[] {
  const deck = lenormandCards.map((_, index) => index);
  const values = new Uint32Array(deck.length);
  crypto.getRandomValues(values);
  for (let index = deck.length - 1; index > 0; index--) {
    const other = values[index] % (index + 1);
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return deck.slice(0, 3);
}

export function lenormandFallback(topic: string, question: string, ids: number[]) {
  const [left, center, right] = ids.map(id => lenormandCards[id]);
  return {
    summary: `Với câu hỏi “${question}”, ${left[0]} mở đầu bằng ${left[1].toLowerCase()}; ${center[0]} đặt ${center[1].toLowerCase()} ở trọng tâm; ${right[0]} thêm góc nhìn về ${right[1].toLowerCase()}. Hãy đọc ba biểu tượng cùng nhau, trong bối cảnh ${topic.toLowerCase()}, thay vì xem từng lá như một dự báo riêng.`,
    sections: [
      { title: `Điểm khởi đầu · ${left[0]}`, text: `${left[0]} gợi ${left[1].toLowerCase()}. Với câu hỏi của bạn, hãy xem điều này đang xuất hiện qua sự việc hoặc mối liên hệ cụ thể nào.` },
      { title: `Trọng tâm · ${center[0]}`, text: `${center[0]} nằm giữa trải bài, gợi ${center[1].toLowerCase()}. Khi đặt cạnh ${left[0]}, hai lá mời bạn xem ${left[1].toLowerCase()} đang tác động thế nào đến ${center[1].toLowerCase()}.` },
      { title: `Điều cần lưu ý · ${right[0]}`, text: `${right[0]} gợi ${right[1].toLowerCase()}. Ghép với ${center[0]}, hãy cân nhắc liệu ${center[1].toLowerCase()} đang mở ra, làm chậm lại hoặc thay đổi cách bạn nhìn ${right[1].toLowerCase()}.` },
    ],
    reflection: `Trong câu chuyện ${left[0]} – ${center[0]} – ${right[0]}, điều gì gần với hoàn cảnh thật của bạn nhất?`,
  };
}
