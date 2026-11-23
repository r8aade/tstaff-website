"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signAgreement } from "@/app/app/actions";

/** Type your name, draw your signature with a finger or mouse, agree, sign. */
export default function SignaturePad({
  agreementKey,
  version,
  defaultName
}: {
  agreementKey: string;
  version: number;
  defaultName: string;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [inked, setInked] = useState(0); // rough count of segments drawn
  const [name, setName] = useState(defaultName);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Size the canvas to its box so the line is sharp on phones.
  useEffect(() => {
    const c = canvasRef.current!;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * ratio);
    c.height = Math.round(rect.height * ratio);
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
  }, []);

  const point = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setInked((n) => n + 1);
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };
  const clear = () => {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setInked(0);
  };

  const submit = () => {
    setError(null);
    if (name.trim().length < 3) return setError("Type your full legal name.");
    if (inked < 5) return setError("Draw your signature in the box.");
    if (!consent) return setError("Tick the box to agree to sign electronically.");
    const signature = canvasRef.current!.toDataURL("image/png");
    start(async () => {
      const r = await signAgreement({ key: agreementKey, version, signerName: name, signature, consent });
      if (!r.ok) setError(r.error);
      else router.refresh();
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-ink-900/10 bg-white p-5">
      <h2 className="font-semibold text-ink-900">Sign</h2>
      <label className="block">
        <span className="text-sm font-medium text-ink-900">Full legal name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-ink-900/15 px-3 py-2 text-base"
        />
      </label>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-900">Draw your signature</span>
          <button type="button" onClick={clear} className="text-sm text-brand-600">Clear</button>
        </div>
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="mt-1 h-40 w-full touch-none rounded-md border-2 border-dashed border-ink-900/20 bg-ink-900/[0.02]"
          aria-label="Signature box"
        />
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-900">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
        />
        I have read this agreement, I agree to it, and I agree that my electronic signature counts the same as signing on paper.
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-3 text-base font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Signing…" : "Sign agreement"}
      </button>
      <p className="text-xs text-ink-700">
        A signed PDF copy is saved to your documents. Your name, the time, and your IP address are recorded with it.
      </p>
    </section>
  );
}
