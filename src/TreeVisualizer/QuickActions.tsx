export default function QuickActions({ resetArmed }: { resetArmed: boolean }) {
  return (
    <div className="quick-actions" aria-hidden="true">
      <span className="quick-actions-title">Quick actions</span>
      <div className="quick-actions-tree-group">
        <ul className="quick-actions-list">
          <li><kbd>Ent</kbd><span>insert</span></li>
          <li><kbd>F</kbd><span>find</span></li>
          <li><kbd>Del</kbd><span>delete</span></li>
        </ul>
        <div className="quick-actions-sep" />
      </div>
      <ul className="quick-actions-list">
        <li><kbd>{'◀\uFE0E'}</kbd><span>prev</span></li>
        <li><kbd>{'▶\uFE0E'}</kbd><span>next</span></li>
        <li>
          <kbd className={resetArmed ? "kbd--armed" : undefined}>R</kbd>
          <span>{resetArmed ? "reset?" : "reset"}</span>
        </li>
      </ul>
    </div>
  );
}
