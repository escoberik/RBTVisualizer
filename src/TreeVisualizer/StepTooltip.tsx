import { useColors } from "./theme/ColorsContext";

export default function StepTooltip({
  description,
  error,
}: {
  description: string;
  error: string | null;
}) {
  const colors = useColors();
  return (
    <p className="step-tooltip" role="status" aria-live="polite">
      <span>{description}</span>
      {error && (
        <span
          className="step-tooltip-error"
          style={{ color: colors.nodeRed }}
        >
          {error}
        </span>
      )}
    </p>
  );
}
