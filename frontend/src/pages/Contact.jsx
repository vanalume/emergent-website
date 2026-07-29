import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Mail, Check } from "lucide-react";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import { BUSINESS_ENQUIRIES } from "@/lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", required: false },
  { name: "company", label: "Company", type: "text", required: false },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [inquiryType, setInquiryType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.message.trim()) e.message = "Please share a few words.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/inquiries`, { ...form, inquiry_type: inquiryType || undefined });
      setSent(true);
      toast.success("Your inquiry has been received.", { description: "We'll be in touch soon." });
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
      setInquiryType("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="pt-40 md:pt-56 pb-16 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Kicker>Contact</Kicker>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mt-6 tracking-tight leading-[1.05] max-w-4xl">
            <MaskLine delay={0.15}>Let&rsquo;s create something</MaskLine>
            <MaskLine delay={0.32}>beautiful together</MaskLine>
          </h1>
        </div>
      </section>

      <section className="pb-28 md:pb-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="contact-success"
                className="border border-[#395439]/30 rounded-sm p-12 text-center"
              >
                <div className="mx-auto h-14 w-14 rounded-full bg-[#395439] flex items-center justify-center">
                  <Check className="text-[#f8f6f2]" size={26} />
                </div>
                <h3 className="font-display text-3xl mt-6">Thank you.</h3>
                <p className="text-[#2b2823]/70 mt-3">Your message is with us. We&rsquo;ll respond thoughtfully and soon.</p>
                <button onClick={() => setSent(false)} data-testid="contact-reset-btn" className="mt-8 text-sm tracking-[0.16em] uppercase text-[#5c3e2b] vl-link-underline">
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="space-y-9">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                  {FIELDS.map((f) => (
                    <div key={f.name}>
                      <label className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]">{f.label}{f.required && " *"}</label>
                      <input
                        data-testid={`contact-${f.name}`}
                        type={f.type}
                        value={form[f.name]}
                        onChange={(e) => setField(f.name, e.target.value)}
                        className="w-full mt-2 bg-transparent border-b border-[#2b2823]/25 focus:border-[#2b2823] outline-none py-3 text-lg transition-colors"
                      />
                      {errors[f.name] && <p data-testid={`error-${f.name}`} className="text-xs text-[#9a3b2e] mt-2">{errors[f.name]}</p>}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]">Message *</label>
                  <textarea
                    data-testid="contact-message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    className="w-full mt-2 bg-transparent border-b border-[#2b2823]/25 focus:border-[#2b2823] outline-none py-3 text-lg transition-colors resize-none"
                  />
                  {errors.message && <p data-testid="error-message" className="text-xs text-[#9a3b2e] mt-2">{errors.message}</p>}
                </div>

                <div>
                  <label className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]">Nature of enquiry</label>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {BUSINESS_ENQUIRIES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        data-testid={`enquiry-${b.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setInquiryType((v) => (v === b ? "" : b))}
                        className={`text-sm px-5 py-2.5 rounded-full border transition-colors duration-300 ${
                          inquiryType === b
                            ? "bg-[#2b2823] text-[#f8f6f2] border-[#2b2823]"
                            : "border-[#2b2823]/25 text-[#2b2823]/75 hover:border-[#2b2823]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="contact-submit"
                  disabled={loading}
                  className="group inline-flex items-center gap-2 bg-[#2b2823] text-[#f8f6f2] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#395439] transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Inquiry"}
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>

          <aside className="lg:col-span-5">
            <Reveal>
              <Kicker>Business Enquiries</Kicker>
              <ul className="mt-6 space-y-4">
                {BUSINESS_ENQUIRIES.map((b) => (
                  <li key={b} className="font-display text-2xl md:text-3xl text-[#2b2823]/85 border-b border-[#2b2823]/10 pb-3">{b}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <Kicker>Elsewhere</Kicker>
              <div className="mt-5 flex items-center gap-4">
                {[
                  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                  { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                  { Icon: Mail, href: "mailto:hello@vanalume.com", label: "Email" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="h-12 w-12 rounded-full border border-[#2b2823]/20 flex items-center justify-center text-[#2b2823] hover:bg-[#2b2823] hover:text-[#f8f6f2] transition-colors duration-300"
                  >
                    <Icon size={18} />
                  </a>
                ))}
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest" className="h-12 w-12 rounded-full border border-[#2b2823]/20 flex items-center justify-center text-[#2b2823] text-sm hover:bg-[#2b2823] hover:text-[#f8f6f2] transition-colors duration-300">Pin</a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </div>
  );
}
