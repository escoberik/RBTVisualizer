// Maximum dots visible at once; window slides to keep current in view.
const WINDOW = 24;

export default function StepNav({
  index,
  total,
  onGo,
}: {
  index: number;
  total: number;
  onGo: (n: number) => void;
}) {
  const showAll = total <= WINDOW;
  const half = Math.floor(WINDOW / 2);
  const start = showAll
    ? 0
    : Math.max(0, Math.min(index - half, total - WINDOW));
  const end = showAll ? total : start + WINDOW;

  return (
    <div className="step-nav">
      {Array.from({ length: end - start }, (_, i) => {
        const step = start + i;
        const isCurrent = step === index;
        return (
          <button
            key={step}
            className={
              "step-nav-dot" + (isCurrent ? " step-nav-dot--current" : "")
            }
            onClick={() => onGo(step)}
            aria-label={`Step ${step + 1}`}
            aria-current={isCurrent ? "step" : undefined}
          />
        );
      })}
    </div>
  );
}
