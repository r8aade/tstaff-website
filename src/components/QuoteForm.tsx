"use client";

import { useState, type FormEvent } from "react";

export default function QuoteForm() {
  const [businessType, setBusinessType] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [timezone, setTimezone] = useState("");
  const [email, setEmail] = useState("");
  const [resourcesNeeded, setResourcesNeeded] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          hoursPerWeek,
          timezone,
          email,
          resourcesNeeded,
          requirements
        })
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const disabled = status === "submitting" || status === "success";

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <div className="quote-form__row">
        <label>
          <span>Business type</span>
          <select
            required
            disabled={disabled}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            <option value="" disabled>
              Select one
            </option>
            <option>Print shop</option>
            <option>Ecommerce</option>
            <option>Other small business</option>
          </select>
        </label>
        <label>
          <span>Hours needed / week</span>
          <select
            required
            disabled={disabled}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
          >
            <option value="" disabled>
              Select one
            </option>
            <option>Under 10</option>
            <option>10–20</option>
            <option>20–40</option>
            <option>40 (full-time)</option>
          </select>
        </label>
      </div>
      <div className="quote-form__row">
        <label>
          <span>Your timezone</span>
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="e.g. Eastern (US)"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            required
            disabled={disabled}
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <label>
        <span>Number of resources needed</span>
        <input
          type="number"
          min="1"
          required
          disabled={disabled}
          placeholder="e.g. 2"
          value={resourcesNeeded}
          onChange={(e) => setResourcesNeeded(e.target.value)}
        />
      </label>
      <label>
        <span>Anything else we should know? (optional)</span>
        <textarea
          rows={3}
          disabled={disabled}
          placeholder="Specific skills, software, hours, or requirements for the role"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn--primary btn--full" disabled={disabled}>
        {status === "submitting" ? "Sending..." : "Get your rate"}
      </button>
      <p className={`quote-form__note ${status === "success" ? "is-success" : ""}`}>
        {status === "success"
          ? "Got it — we'll reply within one business day."
          : status === "error"
            ? "Something went wrong — email hire@talntstaffing.com directly instead."
            : "We reply within one business day. No spam, no sales calls you didn't ask for."}
      </p>
    </form>
  );
}
