"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BLOG_POSTS_DETAIL } from "@/data/blog-posts";

export function BlogDetailPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? BLOG_POSTS_DETAIL[slug] : null;

  if (!post) {
    return (
      <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h1>Post not found</h1>
          <Link href="/blogs" style={{ color: "#6366F1" }}>Back to Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="page-w"
style={{ backgroundColor: "#000" }}
    >
      <Navbar />
      <div className="page-cont-w" style={{ backgroundColor: "#000", color: "#fff" }}>
        <article style={{ padding: "80px 48px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Back Link */}
            <Link
              href="/blogs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#a1a1aa",
                textDecoration: "none",
                marginBottom: "32px",
                fontSize: "14px",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Blog
            </Link>

            {/* Header */}
            <header style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: "rgba(99,102,241,0.2)",
                      color: "#a5b4fc"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: "16px",
                color: "#fff"
              }}>
                {post.title}
              </h1>

              <p style={{
                fontSize: "18px",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)",
                marginBottom: "24px"
              }}>
                {post.subtitle}
              </p>

              {/* Meta Info */}
              <div style={{
                display: "flex",
                gap: "24px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{post.date}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </header>

            {/* Content */}
            <div style={{
              fontSize: "16px",
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.85)"
            }}>
              <style>{`
                article h2 {
                  font-size: 24px;
                  font-weight: 700;
                  margin-top: 32px;
                  margin-bottom: 16px;
                  color: #fff;
                }
                article h3 {
                  font-size: 20px;
                  font-weight: 700;
                  margin-top: 24px;
                  margin-bottom: 12px;
                  color: #fff;
                }
                article p {
                  margin-bottom: 16px;
                }
                article ul, article ol {
                  margin-bottom: 16px;
                  padding-left: 24px;
                }
                article li {
                  margin-bottom: 8px;
                }
                article blockquote {
                  padding: 16px 20px;
                  border-left: 3px solid #6366F1;
                  background: rgba(99,102,241,0.1);
                  margin: 24px 0;
                  color: rgba(255,255,255,0.9);
                  font-style: italic;
                }
                article a {
                  color: #6366F1;
                  text-decoration: none;
                }
                article a:hover {
                  text-decoration: underline;
                }
                article table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 24px 0;
                }
                article th, article td {
                  padding: 12px;
                  text-align: left;
                  border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                article th {
                  background: rgba(99,102,241,0.1);
                  font-weight: 700;
                }
              `}</style>
              {post.content}
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}
