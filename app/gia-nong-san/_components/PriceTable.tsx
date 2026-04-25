import type { CommodityPrice } from "../_lib/queries";
import { PriceRow } from "./PriceRow";

type Props = {
  items: CommodityPrice[];
  feedUrl: string;
};

export function PriceTable({ items, feedUrl }: Props) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-4 py-4 font-medium">Mặt hàng</th>
              <th className="px-4 py-4 font-medium">Chuẩn giao dịch</th>
              <th className="px-4 py-4 text-right font-medium">Giá hiện tại</th>
              <th className="px-4 py-4 font-medium">Biến động</th>
              <th className="px-4 py-4 font-medium">7 phiên</th>
              <th className="px-4 py-4 font-medium">Nguồn / giờ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <PriceRow key={item.id} initial={item} feedUrl={feedUrl} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
