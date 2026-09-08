import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal, Kicker } from "@/components/Motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/blogs`)
      .then((r) => setBlogs(r.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="blogs-page">
      <section className="pt-40 md:pt-56 pb-16 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Kicker>Journal</Kicker>
          <h1 className="font-display fs-page_heading mt-6 tracking-tight leading-[1.02]">Blogs</h1>
        </div>
      </section>

      <section className="pb-28 md:pb-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          {loading ? (
            <p className="text-[#2b2320]/50 font-display text-2xl text-center py-24">Gathering the journal…</p>
          ) : blogs.length === 0 ? (
            <p className="text-[#2b2320]/50 font-display text-2xl text-center py-24">No stories published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {blogs.map((b, i) => (
                <Reveal key={b.id} delay={(i % 3) * 0.06}>
                  <Link to={`/blog/${b.id}`} data-testid={`blog-card-${b.id}`} className="group block">
                    <div className="relative overflow-hidden rounded-sm aspect-[4/3] bg-[#ece3d4]">
                      {b.cover_image ? (
                        <img src={b.cover_image} alt={b.title} className="h-full w-full object-cover transition-all duration-[900ms] group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#5c3e2b]/30 font-display text-3xl">Vanalume</div>
                      )}
                      <div className="absolute inset-0 ring-1 ring-inset ring-[#2b2320]/10" />
                    </div>
                    <h2 className="font-display fs-blog_card_title mt-5 leading-tight">{b.title}</h2>
                    {b.excerpt && <p className="text-[#5c3e2b]/75 mt-3 leading-relaxed line-clamp-2 fs-blog_card_excerpt">{b.excerpt}</p>}
                    <span className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#395439] mt-4">
                      Read <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
