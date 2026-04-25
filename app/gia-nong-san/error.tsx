"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset }: Props) {
  return (
    <div className="min-h-screen bg-[#07111a] px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">Price Feed Interrupted</p>
        <h1 className="mt-3 text-3xl font-semibold">Trang giá nông sản đang tạm gián đoạn.</h1>
        <p className="mt-3 text-slate-300">
          Mình đã giữ lỗi trong boundary riêng cho route này để phần còn lại của site không bị ảnh hưởng.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Tải lại bảng giá
        </button>
      </div>
    </div>
  );
}
