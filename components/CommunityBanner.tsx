import Link from "next/link";

export default function CommunityBanner() {
  return (
    <section className="py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-accent rounded-2xl px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-playfair text-2xl text-white mb-1">
              Join 940+ skill builders worldwide
            </h2>
            <p className="font-dm text-sm text-white/80">
              Share your skills, get feedback, and collaborate with the community.
            </p>
          </div>
          <Link
            href="/submit"
            className="font-dm text-sm font-semibold bg-card text-accent px-6 py-3 rounded-md hover:bg-tagBg transition-colors duration-150 whitespace-nowrap"
          >
            Join Free →
          </Link>
        </div>
      </div>
    </section>
  );
}
