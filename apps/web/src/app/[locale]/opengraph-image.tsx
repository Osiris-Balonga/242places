import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "242Places — Republic of the Congo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const filename = "public/images/skyline-og.png";
  const skyline = await readFile(join(process.cwd(), filename)).catch(() =>
    readFile(join(process.cwd(), "apps/web", filename)),
  );
  const markFile = "public/brand/mark-og.png";
  const mark = await readFile(join(process.cwd(), markFile)).catch(() =>
    readFile(join(process.cwd(), "apps/web", markFile)),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#faf9f7",
        color: "#191a1c",
        flexDirection: "column",
        padding: "42px 64px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        <img
          src={"data:image/png;base64," + mark.toString("base64")}
          width={104}
          height={43}
          alt=""
        />
        Places
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 74,
          fontWeight: 700,
          lineHeight: 1.05,
          marginTop: 46,
        }}
      >
        <span>{locale === "fr" ? "Le Congo," : "The Congo,"}</span>
        <span>{locale === "fr" ? "de lieu en lieu." : "place by place."}</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 26,
          color: "#616570",
          marginTop: 20,
        }}
      >
        {locale === "fr"
          ? "Villes, quartiers et villages."
          : "Cities, neighborhoods and villages."}
      </div>
      <img
        src={"data:image/png;base64," + skyline.toString("base64")}
        width={1200}
        height={400}
        alt=""
        style={{ position: "absolute", left: 0, bottom: 0 }}
      />
    </div>,
    size,
  );
}
