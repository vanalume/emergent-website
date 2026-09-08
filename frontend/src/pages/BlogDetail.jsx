import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RichText from "@/components/RichText";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    setBlog(null);
    axios
      .get(`${API}/blogs/${slug}`)
      .then((r) => {
        setBlog(r.data);
        setStatus("ok");
      })
      .catch(() => setStatus("notfound"));
  }, [slug]);

  return (
    <div data-testid="blog-detail-page">
      <section className="pt-40 md:pt-56 pb-12 md:pb-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#5c3e2b] hover:text-[#2b2320] transition-colors">
            <ArrowLeft size={14} /> All stories
          </Link>
          {status === "ok" && (
            <>
              <h1 className="font-display fs-blog_title mt-10 tracking-tight leading-[1.05] max-w-4xl">{blog.title}</h1>
              {blog.author && <p className="text-sm tracking-[0.14em] uppercase text-[#5c3e2b] mt-6">By {blog.author}</p>}
            </>
          )}
        </div>
      </section>

      {status === "loading" && <p className="text-center py-24 font-display text-2xl text-[#2b2320]/50">Opening the story…</p>}
      {status === "notfound" && <p className="text-center py-24 font-display text-2xl text-[#2b2320]/50">This story could not be found.</p>}

      {status === "ok" && (
        <section className="pb-32 md:pb-44">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            {blog.cover_image && (
              <div className="max-w-3xl mx-auto mb-14 overflow-hidden rounded-sm">
                <img src={blog.cover_image} alt={blog.title} className="w-full aspect-[16/9] object-cover" />
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <RichText html={blog.content} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
