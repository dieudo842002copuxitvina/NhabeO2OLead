/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  BLOG LISTING PAGE - Static with ISR                              ║
 * ║  /kien-thuc - Danh sách bài viết kiến thức nông nghiệp            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Features:
 * - Static generation with ISR (revalidate: 3600)
 * - Category filtering
 * - SEO optimized
 */

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { Calendar, Clock, User, ChevronRight, BookOpen, Search } from "lucide-react";
import SeoMeta from "@/components/SeoMeta";

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

interface PostWithRelations {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  published: boolean;
  published_at: Date | null;
  created_at: Date;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATIC REVALIDATION (ISR)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const revalidate = 3600; // Revalidate every hour

/* ═══════════════════════════════════════════════════════════════════════════════
 * METADATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Kiến thức nông nghiệp | Nhà Bè Agri",
  description: "Cập nhật kiến thức, kỹ thuật canh tác và giải pháp tưới tiêu hiệu quả. Bài viết chuyên sâu từ chuyên gia Nhà Bè Agri.",
  keywords: ["kiến thức nông nghiệp", "kỹ thuật tưới", "cây trồng", "sầu riêng", "cà phê"],
  alternates: {
    canonical: "/kien-thuc",
  },
  openGraph: {
    title: "Kiến thức nông nghiệp | Nhà Bè Agri",
    description: "Cập nhật kiến thức, kỹ thuật canh tác và giải pháp tưới tiêu hiệu quả.",
    type: "website",
    locale: "vi_VN",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * DATA FETCHING
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getPosts(): Promise<PostWithRelations[]> {
  const posts = await prisma.posts.findMany({
    where: { published: true },
    orderBy: { published_at: "desc" },
    include: {
      categories: {
        select: { id: true, name: true, slug: true },
      },
    },
    take: 20,
  });

  return posts;
}

async function getCategories(): Promise<Category[]> {
  const categories = await prisma.categories.findMany({
    where: { /* Add isActive condition if exists */ },
    orderBy: { created_at: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return categories;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
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

function PostCard({ post }: { post: PostWithRelations }) {
  return (
    <Link
      href={`/kien-thuc/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#E9ECEF] bg-white transition-all hover:shadow-lg hover:border-[#4CAF50]/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F1F5F9]">
        {post.thumbnail_url ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-[#CBD5E1]" />
          </div>
        )}
        
        {/* Category Badge */}
        {post.categories && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2F8E36] backdrop-blur-sm">
            {post.categories.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-[#1A1A1A] transition-colors group-hover:text-[#4CAF50]">
          {post.title}
        </h3>
        
        {post.description && (
          <p className="mb-3 line-clamp-2 text-sm text-[#5F6B7A]">
            {post.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatReadingTime(post.description)}
            </span>
          </div>
          
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.published_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedPost({ post }: { post: PostWithRelations }) {
  return (
    <Link
      href={`/kien-thuc/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-[#E9ECEF] bg-white transition-all hover:shadow-xl"
    >
      {/* Large Thumbnail */}
      <div className="relative aspect-[21/9] overflow-hidden bg-[#1A1A1A]">
        {post.thumbnail_url ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover opacity-80 transition-opacity group-hover:opacity-70"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2E7D32] to-[#4CAF50]">
            <BookOpen className="h-20 w-20 text-white/50" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Featured Badge */}
        <div className="absolute left-4 top-4 rounded-full bg-[#4CAF50] px-3 py-1 text-xs font-bold text-white">
          Bài viết nổi bật
        </div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {post.categories && (
            <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {post.categories.name}
            </span>
          )}
          <h2 className="mb-2 text-2xl font-bold text-white transition-colors group-hover:text-[#8BC34A] sm:text-3xl">
            {post.title}
          </h2>
          {post.description && (
            <p className="line-clamp-2 text-sm text-white/80 sm:text-base">
              {post.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <Link
      href={`/kien-thuc?category=${category.slug}`}
      className="flex items-center justify-between rounded-xl border border-[#E9ECEF] bg-white px-4 py-3 transition-all hover:border-[#4CAF50] hover:bg-[#F3FAF3]"
    >
      <span className="font-medium text-[#1A1A1A]">{category.name}</span>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#5F6B7A]">
          {category._count.posts}
        </span>
        <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMPTY STATE
 * ═══════════════════════════════════════════════════════════════════════════════ */

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <BookOpen className="mb-4 h-16 w-16 text-[#E9ECEF]" />
      <h3 className="mb-2 text-xl font-semibold text-[#1A1A1A]">
        Chưa có bài viết nào
      </h3>
      <p className="mb-6 text-sm text-[#5F6B7A]">
        Hãy quay lại sau để cập nhật những bài viết mới nhất về nông nghiệp.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E36]"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN PAGE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function KienThucPage() {
  const [posts, categories] = await Promise.all([
    getPosts(),
    getCategories(),
  ]);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <>
      <SeoMeta
        title="Kiến thức nông nghiệp | Nhà Bè Agri"
        description="Cập nhật kiến thức, kỹ thuật canh tác và giải pháp tưới tiêu hiệu quả. Bài viết chuyên sâu từ chuyên gia Nhà Bè Agri."
        canonical="/kien-thuc"
      />
      
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#2E7D32] via-[#4CAF50] to-[#388E3C] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                Kiến thức nông nghiệp
              </h1>
              <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
                Cập nhật những bài viết chuyên sâu về kỹ thuật canh tác, giải pháp tưới tiêu 
                và xu hướng nông nghiệp bền vững
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Featured Post */}
              {featuredPost && <FeaturedPost post={featuredPost} />}

              {/* Posts Grid */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#1A1A1A]">
                    Bài viết mới nhất
                  </h2>
                  <span className="text-sm text-[#7B8794]">
                    {remainingPosts.length} bài viết
                  </span>
                </div>

                {remainingPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {remainingPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="search"
                  placeholder="Tìm kiếm bài viết..."
                  className="h-11 w-full rounded-xl border border-[#E9ECEF] bg-white pl-10 pr-4 text-sm transition-colors focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
                />
              </div>

              {/* Categories */}
              <div className="rounded-2xl border border-[#E9ECEF] bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#1A1A1A]">
                  <BookOpen className="h-4 w-4 text-[#4CAF50]" />
                  Chủ đề
                </h3>
                <div className="space-y-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <CategoryBadge key={category.id} category={category} />
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm text-[#9CA3AF]">
                      Chưa có chủ đề nào
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#388E3C] p-5 text-white">
                <h3 className="mb-2 text-lg font-semibold">Tư vấn miễn phí</h3>
                <p className="mb-4 text-sm text-white/80">
                  Liên hệ ngay để được tư vấn giải pháp tưới tiêu phù hợp với cây trồng của bạn.
                </p>
                <Link
                  href="/lien-he"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#2E7D32] transition-colors hover:bg-white/90"
                >
                  Liên hệ ngay
                </Link>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
