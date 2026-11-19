"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Result = { ok: true } | { ok: false; error: string };
const MAX = 4 * 1024 * 1024;

/** Big phone photos get resized in the browser so they fit the 4 MB limit. */
async function shrinkImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function DocumentUpload({
  action,
  fields,
  label = "Upload",
  compact = false
}: {
  action: (fd: FormData) => Promise<Result>;
  fields: Record<string, string>;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    setMsg(null);
    const file = await shrinkImage(picked);
    if (file.size > MAX) {
      setMsg({ ok: false, text: "That file is over 4 MB. Try a smaller scan or photo." });
      return;
    }
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);
    start(async () => {
      const r = await action(fd);
      if (!r.ok) setMsg({ ok: false, text: r.error });
      else {
        setMsg({ ok: true, text: "Uploaded." });
        router.refresh();
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <input
        ref={input}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={onPick}
        className="hidden"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => input.current?.click()}
        className={
          compact
            ? "text-sm font-medium text-brand-600 disabled:opacity-60"
            : "rounded-md border border-ink-900/15 bg-white px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-ink-900/5 disabled:opacity-60"
        }
      >
        {pending ? "Uploading..." : label}
      </button>
      {msg && <span className={`text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</span>}
    </span>
  );
}
