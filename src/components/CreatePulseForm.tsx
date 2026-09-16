import { useId, useState } from "react";
import { useCreatePulse } from "../useWorkspace";

type Fields = {
  label: string;
  city: string;
  query: string;
  budget: string;
  currency: string;
  email: string;
};

const EMPTY: Fields = {
  label: "",
  city: "",
  query: "",
  budget: "",
  currency: "USD",
  email: "",
};

function validate(fields: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!fields.label.trim()) errors.label = "Give this Pulse a short name.";
  if (!fields.city.trim()) errors.city = "Which city or area should it watch?";
  const budget = Number(fields.budget);
  if (!fields.budget.trim() || Number.isNaN(budget) || budget <= 0)
    errors.budget = "Enter a monthly budget above zero.";
  if (!fields.query.trim())
    errors.query = "Describe what you’re looking for — the scorer reads this.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = "Enter an address digests can be sent to.";
  return errors;
}

export function CreatePulseForm({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const createPulse = useCreatePulse();
  const headingId = useId();

  const blurValidate = (name: keyof Fields) => {
    const next = validate({ ...fields });
    setErrors((prev) => ({ ...prev, [name]: next[name] }));
  };

  const set = (name: keyof Fields, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (submitted || errors[name]) {
      const next = validate({ ...fields, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: next[name] }));
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = validate(fields);
    setErrors(next);
    setSubmitted(true);
    if (Object.keys(next).length > 0) return;

    createPulse({
      label: fields.label.trim(),
      city: fields.city.trim(),
      query: fields.query.trim(),
      budgetMax: Number(fields.budget),
      currency: fields.currency,
      email: fields.email.trim(),
    });
    setFields(EMPTY);
    onDone();
  };

  return (
    <form className="pulse-form" onSubmit={submit} noValidate>
      <h3 id={headingId}>New Pulse</h3>

      <div className="field">
        <label htmlFor={`${headingId}-label`}>Name</label>
        <input
          id={`${headingId}-label`}
          value={fields.label}
          onChange={(e) => set("label", e.target.value)}
          onBlur={() => blurValidate("label")}
          placeholder="Sunset Park 1BR"
          aria-invalid={Boolean(errors.label)}
          aria-describedby={errors.label ? `${headingId}-label-err` : undefined}
        />
        {errors.label && (
          <span className="error" id={`${headingId}-label-err`}>
            {errors.label}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${headingId}-city`}>City or area</label>
        <input
          id={`${headingId}-city`}
          value={fields.city}
          onChange={(e) => set("city", e.target.value)}
          onBlur={() => blurValidate("city")}
          placeholder="Brooklyn, NY"
          aria-invalid={Boolean(errors.city)}
          aria-describedby={errors.city ? `${headingId}-city-err` : undefined}
        />
        {errors.city && (
          <span className="error" id={`${headingId}-city-err`}>
            {errors.city}
          </span>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${headingId}-budget`}>Monthly budget</label>
          <input
            id={`${headingId}-budget`}
            inputMode="decimal"
            value={fields.budget}
            onChange={(e) => set("budget", e.target.value)}
            onBlur={() => blurValidate("budget")}
            placeholder="2600"
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? `${headingId}-budget-err` : undefined}
          />
          {errors.budget && (
            <span className="error" id={`${headingId}-budget-err`}>
              {errors.budget}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${headingId}-currency`}>Currency</label>
          <select
            id={`${headingId}-currency`}
            value={fields.currency}
            onChange={(e) => set("currency", e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="IDR">IDR</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${headingId}-query`}>What you’re looking for</label>
        <textarea
          id={`${headingId}-query`}
          value={fields.query}
          onChange={(e) => set("query", e.target.value)}
          onBlur={() => blurValidate("query")}
          placeholder="Sunny 1BR near the D line, quiet street, laundry in building…"
          aria-invalid={Boolean(errors.query)}
          aria-describedby={errors.query ? `${headingId}-query-err` : undefined}
        />
        {errors.query && (
          <span className="error" id={`${headingId}-query-err`}>
            {errors.query}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${headingId}-email`}>Digest email</label>
        <input
          id={`${headingId}-email`}
          type="email"
          value={fields.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => blurValidate("email")}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${headingId}-email-err` : undefined}
        />
        {errors.email && (
          <span className="error" id={`${headingId}-email-err`}>
            {errors.email}
          </span>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        Save Pulse
      </button>
      <p className="form-note">
        Saved in this browser only. Live scanning and digest emails are not
        enabled in the sample workspace.
      </p>
      <button type="button" className="btn btn-quiet" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
