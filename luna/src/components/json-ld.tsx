/** Chèn dữ liệu có cấu trúc (schema.org) vào HTML render từ server. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` được thoát để chuỗi trong dữ liệu không thể đóng thẻ script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
