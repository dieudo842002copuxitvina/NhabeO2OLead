/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  BLOG DETAIL PAGE - Static with ISR                                ║
 * ║  /kien-thuc/[slug] - Chi tiết bài viết                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Features:
 * - Static generation with ISR (revalidate: 3600)
 * - Complete SEO: Meta tags, Canonical, JSON-LD
 * - Markdown content rendering
 * - Related products sidebar
 * - Low CLS with fixed image dimensions
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { Calendar, Clock, User, ArrowLeft, Share2, Printer, BookOpen } from "lucide-react";
import SeoMeta from "@/components/SeoMeta";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import RelatedProductsSidebar from "@/components/RelatedProductsSidebar";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  thumbnail: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metaTitle: string | null;
  canonicalUrl: string | null;
  structuredData: object | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATIC REVALIDATION (ISR)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const revalidate = 3600;

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATIC PARAMS (generateStaticParams)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * METADATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { title: "Không tìm thấy bài viết" };
  }

  const title = post.metaTitle || post.title;
  const description = post.description || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nhabe-agri.com";
  const canonical = post.canonicalUrl || `${siteUrl}/kien-thuc/${post.slug}`;
  const ogImage = post.thumbnail || `${siteUrl}/og-default.jpg`;

  return {
    title: `${title} | Nhà Bè Agri`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | Nhà Bè Agri`,
      description,
      type: "article",
      locale: "vi_VN",
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author ? [post.author.full_name || "Nhà Bè Agri"] : undefined,
      tags: post.tags.map((t) => t.tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Nhà Bè Agri`,
      description,
      images: [ogImage],
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * JSON-LD STRUCTURED DATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateArticleJsonLd(post: PostDetail) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nhabe-agri.com";
  const canonical = post.canonicalUrl || `${siteUrl}/kien-thuc/${post.slug}`;

  // Base Article schema
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.thumbnail ? [post.thumbnail] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.full_name || "Nhà Bè Agri",
    },
    publisher: {
      "@type": "Organization",
      name: "Nhà Bè Agri",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    keywords: post.tags.map((t) => t.tag.name).join(", "),
    articleSection: post.category?.name,
    inLanguage: "vi",
  };

  // Use custom structured data if available
  if (post.structuredData && typeof post.structuredData === "object") {
    return { ...baseSchema, ...(post.structuredData as object) };
  }

  return baseSchema;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DATA FETCHING
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      author: {
        select: { full_name: true, avatar_url: true },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  return post;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatReadingTime(content: string | null): string {
  if (!content) return "5 phút";
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} phút đọc`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function ArticleJsonLd({ post }: { post: PostDetail }) {
  const jsonLd = generateArticleJsonLd(post);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function PostHeader({ post }: { post: PostDetail }) {
  return (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-[#7B8794]">
        <Link href="/" className="transition-colors hover:text-[#4CAF50]">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/kien-thuc" className="transition-colors hover:text-[#4CAF50]">
          Kiến thức
        </Link>
        {post.category && (
          <>
            <span>/</span>
            <Link
              href={`/kien-thuc?category=${post.category.slug}`}
              className="transition-colors hover:text-[#4CAF50]"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Category Badge */}
      {post.category && (
        <Link
          href={`/kien-thuc?category=${post.category.slug}`}
          className="mb-3 inline-block rounded-full bg-[#4CAF50]/10 px-4 py-1.5 text-sm font-semibold text-[#2F8E36] transition-colors hover:bg-[#4CAF50]/20"
        >
          {post.category.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1A1A1A] sm:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#7B8794]">
        {post.author && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]">
              {post.author.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.full_name || ""}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <span className="font-medium">{post.author.full_name || "Admin"}</span>
          </div>
        )}
        
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(post.publishedAt)}
        </span>
        
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {formatReadingTime(post.content)}
        </span>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/kien-thuc?tag=${tag.slug}`}
              className="rounded-full border border-[#E9ECEF] px-3 py-1 text-xs font-medium text-[#5F6B7A] transition-colors hover:border-[#4CAF50] hover:text-[#4CAF50]"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function PostThumbnail({ post }: { post: PostDetail }) {
  return (
    <figure className="mb-8 overflow-hidden rounded-2xl bg-[#F1F5F9]">
      {post.thumbnail ? (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-[#2E7D32] to-[#4CAF50]">
          <BookOpen className="h-20 w-20 text-white/30" />
        </div>
      )}
    </figure>
  );
}

function ShareButtons() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="text-sm font-medium text-[#5F6B7A]">Chia sẻ:</span>
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E9ECEF] text-[#5F6B7A] transition-colors hover:border-[#4CAF50] hover:text-[#4CAF50]"
        aria-label="Sao chép liên kết"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => typeof window !== "undefined" && window.print()}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E9ECEF] text-[#5F6B7A] transition-colors hover:border-[#4CAF50] hover:text-[#4CAF50]"
        aria-label="In bài viết"
      >
        <Printer className="h-4 w-4" />
      </button>
    </div>
  );
}

function RelatedPosts({ categorySlug }: { categorySlug: string | null }) {
  // This would fetch related posts - simplified for now
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN PAGE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function PostDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = generateArticleJsonLd(post);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd post={post} />
      
      {/* SEO Meta */}
      <SeoMeta
        title={post.metaTitle || post.title}
        description={post.description || ""}
        canonical={post.canonicalUrl || `/kien-thuc/${post.slug}`}
        ogImage={post.thumbnail || undefined}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Back Button */}
        <div className="border-b border-[#F1F5F9] bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/kien-thuc"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#5F6B7A] transition-colors hover:text-[#4CAF50]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            {/* Article Content */}
            <article className="min-w-0">
              <PostHeader post={post} />
              <PostThumbnail post={post} />
              <ShareButtons />
              
              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                {post.content ? (
                  <MarkdownRenderer content={post.content} />
                ) : (
                  <p className="text-center text-[#7B8794]">
                    Nội dung đang được cập nhật...
                  </p>
                )}
              </div>

              {/* Author Box */}
              {post.author && (
                <div className="mt-12 rounded-2xl border border-[#E9ECEF] bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                      {post.author.avatar_url ? (
                        <Image
                          src={post.author.avatar_url}
                          alt={post.author.full_name || ""}
                          width={56}
                          height={56}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#9CA3AF]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#7B8794]">Tác giả</p>
                      <p className="text-lg font-semibold text-[#1A1A1A]">
                        {post.author.full_name || "Nhà Bè Agri"}
                      </p>
                      <p className="mt-1 text-sm text-[#5F6B7A]">
                        Chuyên gia nông nghiệp tại Nhà Bè Agri - Chia sẻ kiến thức 
                        và giải pháp tưới tiêu hiệu quả.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <RelatedProductsSidebar categorySlug={post.category?.slug || null} />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
