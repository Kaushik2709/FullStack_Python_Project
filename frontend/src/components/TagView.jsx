import { useEffect, useState } from "react";

export default function TagView({
  node,
  path,
  level = 0,
  onToggle,
  onAddChild,
  onDataChange,
  onNameChange,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(node.name);

  useEffect(() => {
    setNameDraft(node.name);
  }, [node.name]);

  const indentClass = level > 0 ? "ml-3" : "";

  const submitName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(node.name);
      setIsEditingName(false);
      return;
    }

    onNameChange(path, trimmed);
    setIsEditingName(false);
  };

  return (
    <div className={`border border-skyPanelBorder bg-skyPanel/30 p-1 ${indentClass}`}>
      <div className="flex items-center gap-2 border border-skyPanelBorder bg-skyPanel p-1">
        <button
          type="button"
          onClick={() => onToggle(path)}
          className="h-6 w-6 rounded-sm border border-slate-300 bg-slate-100 text-xs font-bold"
          aria-label={node.isCollapsed ? "Expand tag" : "Collapse tag"}
        >
          {node.isCollapsed ? ">" : "v"}
        </button>

        {isEditingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={submitName}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitName();
              }
              if (event.key === "Escape") {
                setNameDraft(node.name);
                setIsEditingName(false);
              }
            }}
            className="h-6 w-40 rounded-sm border border-slate-400 px-2 text-sm"
          />
        ) : (
          <button
            type="button"
            className="text-left text-sm font-semibold text-slate-900"
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
          >
            {node.name}
          </button>
        )}

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => onAddChild(path)}
            className="rounded-sm border border-slate-300 bg-slate-100 px-3 py-1 text-xs"
          >
            Add Child
          </button>
        </div>
      </div>

      {!node.isCollapsed && (
        <div className="mt-1 border border-skyPanelBorder bg-white/50 p-1">
          {Array.isArray(node.children) ? (
            <div className="space-y-1">
              {node.children.map((child, index) => (
                <TagView
                  key={`${child.name}-${index}`}
                  node={child}
                  path={[...path, index]}
                  level={level + 1}
                  onToggle={onToggle}
                  onAddChild={onAddChild}
                  onDataChange={onDataChange}
                  onNameChange={onNameChange}
                />
              ))}
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-700">Data</span>
              <input
                value={node.data ?? ""}
                onChange={(event) => onDataChange(path, event.target.value)}
                className="h-7 w-52 rounded-sm border border-slate-400 px-2"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
