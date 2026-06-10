"use client";

import Link from "next/link";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BLOG_POSTS_LIST } from "@/data/blog-posts";

export function BlogListPage(): React.ReactElement {
  return (
    <div
      className="page-w"
style={{ backgroundColor: "#000" }}
    >
      <Navbar />
      <div className="page-cont-w" style={{ backgroundColor: "#000", color: "#fff" }}>
        <section style={{ padding: "80px 48px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "48px" }}>
              <h1 style={{
                fontSize: "clamp(40px, 5vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "16px",
                color: "#fff"
              }}>
                Blog
              </h1>
              <p style={{
                fontSize: "18px",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)"
              }}>
                Insights, updates, and deep dives from the Zynd team.
              </p>
            </div>

            {/* Blog Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {BLOG_POSTS_LIST.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      padding: "32px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px"
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "rgba(99,102,241,0.5)";
                      el.style.backgroundColor = "rgba(99,102,241,0.1)";
                      el.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "rgba(255,255,255,0.1)";
                      el.style.backgroundColor = "rgba(255,255,255,0.02)";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Tags and Read Button */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "4px 10px",
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
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#6366F1",
                        fontSize: "14px",
                        fontWeight: 600
                      }}>
                        Read
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path
                            d="M1 5.5H10M10 5.5L6 1.5M10 5.5L6 9.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0
                    }}>
                      {post.title}
                    </h3>
                    <p style={{
                      fontSize: "16px",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.6)",
                      margin: 0
                    }}>
                      {post.description}
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
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
