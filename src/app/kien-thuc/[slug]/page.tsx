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
import { NhaBeBlogInlineCTA, NhaBeBlogEndCTA } from "@/components/NhaBeConversionBox";

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
  thumbnail_url: string | null;
  published: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  meta_title: string | null;
  canonical_url: string | null;
  structured_data: object | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATIC REVALIDATION (ISR)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const revalidate = 3600;

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATIC PARAMS (generateStaticParams)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function generateStaticParams() {
  const posts = await prisma.posts.findMany({
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

  const title = post.meta_title || post.title;
  const description = post.description || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nhabe-agri.com";
  const canonical = post.canonical_url || `${siteUrl}/kien-thuc/${post.slug}`;
  const ogImage = post.thumbnail_url || `${siteUrl}/og-default.jpg`;

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
      publishedTime: post.published_at?.toISOString(),
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
  const canonical = post.canonical_url || `${siteUrl}/kien-thuc/${post.slug}`;

  // Base Article schema
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    datePublished: post.published_at?.toISOString(),
    dateModified: post.updated_at.toISOString(),
    author: {
      "@type": "Person",
      name: "Nhà Bè Agri",
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
    articleSection: post.categories?.name,
    inLanguage: "vi",
  };

  // Use custom structured data if available
  if (post.structured_data && typeof post.structured_data === "object") {
    return { ...baseSchema, ...(post.structured_data as object) };
  }

  return baseSchema;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DATA FETCHING
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await prisma.posts.findUnique({
    where: { slug, published: true },
    include: {
      categories: {
        select: { id: true, name: true, slug: true },
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
        {post.categories && (
          <>
            <span>/</span>
            <Link
              href={`/kien-thuc?category=${post.categories.slug}`}
              className="transition-colors hover:text-[#4CAF50]"
            >
              {post.categories.name}
            </Link>
          </>
        )}
      </nav>

      {/* Category Badge */}
      {post.categories && (
        <Link
          href={`/kien-thuc?category=${post.categories.slug}`}
          className="mb-3 inline-block rounded-full bg-[#4CAF50]/10 px-4 py-1.5 text-sm font-semibold text-[#2F8E36] transition-colors hover:bg-[#4CAF50]/20"
        >
          {post.categories.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1A1A1A] sm:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#7B8794]">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(post.published_at)}
        </span>
        
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {formatReadingTime(post.content)}
        </span>
      </div>
    </header>
  );
}

function PostThumbnail({ post }: { post: PostDetail }) {
  return (
    <figure className="mb-8 overflow-hidden rounded-2xl bg-[#F1F5F9]">
      {post.thumbnail_url ? (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={post.thumbnail_url}
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
        title={post.meta_title || post.title}
        description={post.description || ""}
        canonical={post.canonical_url || `/kien-thuc/${post.slug}`}
        ogImage={post.thumbnail_url || undefined}
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
                  <>
                    {/* Mid-content CTA - NhaBe Branded */}
                    <NhaBeBlogInlineCTA cropType={post.categories?.name || undefined} />
                    <MarkdownRenderer content={post.content} />
                  </>
                ) : (
                  <p className="text-center text-[#7B8794]">
                    Nội dung đang được cập nhật...
                  </p>
                )}
              </div>

              {/* End of Article CTA - NhaBe Branded */}
              <div className="mt-8">
                <NhaBeBlogEndCTA cropType={post.categories?.name || undefined} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <RelatedProductsSidebar categorySlug={post.categories?.slug || null} />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
