/** Chèn dữ liệu có cấu trúc (schema.org) vào HTML render từ server. */
export function JsonLd({ data }: { data: object }) {
  const script = (
    <script
      type="application/ld+json"
      // `<` được thoát để chuỗi trong dữ liệu không thể đóng thẻ script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
  // Bọc trong <div hidden>: PostHog chèn script của nó trước `body > script` đầu tiên.
  // Nếu thẻ này đứng trực tiếp dưới <body>, DOM bị đổi trước khi React hydrate → mismatch.
  return <div hidden>{script}</div>;
}
