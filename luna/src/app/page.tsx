import LunaApp from "@/components/luna-app";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("home");

export default function Page() {
  return <LunaApp />;
}
