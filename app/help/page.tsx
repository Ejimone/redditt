import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import Link from "next/link";

export const metadata = {
  title: "Help & About",
  description: "About this Reddit clone and how to use it.",
};

export default function HelpPage() {
  return (
    <FeedWithRightRail>
      <main className="space-y-10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help center</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick answers for this demo app.
          </p>
        </div>

        <section id="about" className="scroll-mt-24">
          <h2 className="text-lg font-bold text-foreground">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Reddit is a place for communities, conversations, and shared
            interests. Browse communities, vote on content, and join discussions
            in real time.
          </p>
        </section>

        <section id="faq" className="scroll-mt-24">
          <h2 className="text-lg font-bold text-foreground">FAQ</h2>
          <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
            <li>
              <p className="font-semibold text-foreground">Search</p>
              <p className="mt-1">
                Use the bar at the top; it searches post titles via Strapi.
              </p>
            </li>
            <li>
              <p className="font-semibold text-foreground">Share</p>
              <p className="mt-1">
                On phones, Share uses the system sheet when available; otherwise
                the link is copied.
              </p>
            </li>
            <li>
              <p className="font-semibold text-foreground">Feed tabs</p>
              <p className="mt-1">
                <strong className="text-foreground">Best</strong> and{" "}
                <strong className="text-foreground">Top</strong> sort by score;{" "}
                <strong className="text-foreground">New</strong> by date.
              </p>
            </li>
          </ul>
        </section>

        <p className="text-sm">
          <Link
            href="/"
            className="font-bold text-[#0079d3] hover:underline"
          >
            Back to home
          </Link>
        </p>
      </main>
    </FeedWithRightRail>
  );
}
