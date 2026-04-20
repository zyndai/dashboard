"use client"

import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const blogs = [
    {
        slug: "what-is-zynd",
        title: "What is Zynd? The Trust & Payment Layer for AI Agents",
        description:
            "Zynd Network is the infrastructure layer that lets AI agents discover, trust, and pay each other — turning isolated agents into an economic network.",
        date: "Feb 15, 2025",
        readTime: "5 min read",
        tags: ["Infrastructure", "AI Agents", "Protocol"],
    },
];

export default function BlogList() {
    return (
        <section className="min-h-screen bg-[#020913] text-white selection:bg-[#5b7cfa]/30 antialiased font-sans">
            <div className="mx-auto mt-8 w-full max-w-[1240px] px-6 lg:px-12 pb-24">
                <div className="mb-12 text-center md:text-left">
                     <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 flex items-center justify-center md:justify-start gap-4">
                        Blog
                     </h1>
                     <p className="text-lg text-white/50 max-w-2xl leading-relaxed mx-auto md:mx-0">
                         Insights, updates, and deep dives from the Zynd Protocol team.
                     </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Link href={`/blogs/${blog.slug}`} key={blog.slug} className="group relative flex flex-col rounded-xl border border-white/[0.15] bg-[#0A0E17] p-6 transition-all duration-300 hover:border-white/30 hover:bg-[#0B101A] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5b7cfa]/10">
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <span key={tag} className="inline-flex rounded border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#5b7cfa]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#5b7cfa] transition-transform duration-300 group-hover:translate-x-1">
                                    Read
                                    <ArrowRight className="h-3 w-3" />
                                </div>
                            </div>
                            <h3 className="text-[20px] font-bold tracking-tight text-white mb-3 leading-snug group-hover:text-[#5b7cfa] transition-colors">{blog.title}</h3>
                            <p className="text-[14px] leading-relaxed text-zinc-400 mb-6 flex-1 line-clamp-3">{blog.description}</p>

                            <div className="mt-auto flex items-center justify-between border-t border-white/[0.15] pt-4 text-[12px] font-medium text-zinc-500">
                                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {blog.date}</span>
                                <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {blog.readTime}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
