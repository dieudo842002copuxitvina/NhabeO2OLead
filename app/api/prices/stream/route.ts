import { getLivePriceSnapshot } from "../../../gia-nong-san/_lib/queries";
import { parsePriceFilters } from "../../../gia-nong-san/_lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const filters = parsePriceFilters(new URL(request.url).searchParams);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let lastHash = "";

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const publish = async () => {
        if (closed) return;
        const snapshot = await getLivePriceSnapshot(filters);
        const payload = {
          items: snapshot.items.map((item) => ({
            id: item.id,
            priceVnd: item.priceVnd,
            previousPriceVnd: item.previousPriceVnd,
            changeVnd: item.changeVnd,
            changePct: item.changePct,
            recordedAt: item.recordedAt,
            source: item.source,
          })),
          lastUpdatedAt: snapshot.lastUpdatedAt,
        };

        const hash = JSON.stringify(payload.items.map((item) => [item.id, item.priceVnd, item.recordedAt]));

        if (!lastHash) {
          lastHash = hash;
          send("snapshot", payload);
          return;
        }

        if (hash !== lastHash) {
          lastHash = hash;
          send("prices", payload);
        } else {
          send("heartbeat", { ts: Date.now() });
        }
      };

      await publish();
      const interval = setInterval(() => {
        publish().catch(() => {
          if (!closed) send("heartbeat", { ts: Date.now() });
        });
      }, 5000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        if (interval) clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
