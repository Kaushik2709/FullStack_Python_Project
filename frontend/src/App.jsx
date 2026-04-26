import { useEffect, useMemo, useState } from "react";

import { createTree, fetchTrees, updateTree } from "./api";
import TagView from "./components/TagView";
import {
  addChildToNode,
  deepClone,
  DEFAULT_TREE,
  sanitizeTree,
  updateNodeByPath,
} from "./treeUtils";

function withUiState(node) {
  const base = {
    name: node.name,
    isCollapsed: false,
  };

  if (Array.isArray(node.children)) {
    return {
      ...base,
      children: node.children.map(withUiState),
    };
  }

  return {
    ...base,
    data: node.data ?? "",
  };
}

function stripUiState(node) {
  return sanitizeTree(node);
}

export default function App() {
  const [trees, setTrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExportId, setActiveExportId] = useState(null);

  useEffect(() => {
    async function loadTrees() {
      try {
        setIsLoading(true);
        const records = await fetchTrees();

        if (records.length === 0) {
          setTrees([
            {
              localId: crypto.randomUUID(),
              id: null,
              tree: withUiState(deepClone(DEFAULT_TREE)),
              exportText: "",
            },
          ]);
        } else {
          setTrees(
            records.map((record) => ({
              localId: crypto.randomUUID(),
              id: record.id,
              tree: withUiState(record.tree),
              exportText: "",
            }))
          );
        }
      } catch (loadError) {
        setError(loadError.message || "Unable to load trees");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrees();
  }, []);

  const treeCountLabel = useMemo(() => {
    if (trees.length === 1) {
      return "1 Tree Loaded";
    }
    return `${trees.length} Trees Loaded`;
  }, [trees.length]);

  const updateTreeAt = (localId, updater) => {
    setTrees((currentTrees) =>
      currentTrees.map((entry) => {
        if (entry.localId !== localId) {
          return entry;
        }
        return {
          ...entry,
          tree: updater(entry.tree),
        };
      })
    );
  };

  const handleToggle = (localId, path) => {
    updateTreeAt(localId, (tree) =>
      updateNodeByPath(tree, path, (node) => ({
        ...node,
        isCollapsed: !node.isCollapsed,
      }))
    );
  };

  const handleDataChange = (localId, path, value) => {
    updateTreeAt(localId, (tree) =>
      updateNodeByPath(tree, path, (node) => ({
        ...node,
        data: value,
      }))
    );
  };

  const handleAddChild = (localId, path) => {
    updateTreeAt(localId, (tree) => updateNodeByPath(tree, path, addChildToNode));
  };

  const handleNameChange = (localId, path, value) => {
    updateTreeAt(localId, (tree) =>
      updateNodeByPath(tree, path, (node) => ({
        ...node,
        name: value,
      }))
    );
  };

  const handleExport = async (localId) => {
    const entry = trees.find((treeEntry) => treeEntry.localId === localId);
    if (!entry) {
      return;
    }

    const payload = stripUiState(entry.tree);
    const formatted = JSON.stringify(payload, null, 2);

    setTrees((currentTrees) =>
      currentTrees.map((treeEntry) =>
        treeEntry.localId === localId
          ? {
              ...treeEntry,
              exportText: formatted,
            }
          : treeEntry
      )
    );

    setActiveExportId(localId);
    setError("");

    try {
      if (entry.id == null) {
        const created = await createTree(payload);
        setTrees((currentTrees) =>
          currentTrees.map((treeEntry) =>
            treeEntry.localId === localId
              ? {
                  ...treeEntry,
                  id: created.id,
                }
              : treeEntry
          )
        );
      } else {
        await updateTree(entry.id, payload);
      }
    } catch (saveError) {
      setError(saveError.message || "Failed to export and save tree");
    } finally {
      setActiveExportId(null);
    }
  };

  return (
    <main className="min-h-screen p-5 md:p-8">
      <div className="mx-auto w-full max-w-5xl rounded-md border border-slate-300 bg-white/85 p-4 shadow-md md:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Nested Tags Tree</h1>
        <p className="mt-1 text-sm text-slate-700">{treeCountLabel}</p>

        {error && (
          <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-4 text-sm text-slate-700">Loading trees from backend...</div>
        ) : (
          <div className="mt-4 space-y-6">
            {trees.map((entry, index) => (
              <section key={entry.localId} className="rounded border border-slate-300 p-3">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">
                  Tree #{index + 1} {entry.id ? `(DB ID: ${entry.id})` : "(Unsaved)"}
                </h2>

                <TagView
                  node={entry.tree}
                  path={[]}
                  onToggle={(path) => handleToggle(entry.localId, path)}
                  onAddChild={(path) => handleAddChild(entry.localId, path)}
                  onDataChange={(path, value) => handleDataChange(entry.localId, path, value)}
                  onNameChange={(path, value) => handleNameChange(entry.localId, path, value)}
                />

                <button
                  type="button"
                  onClick={() => handleExport(entry.localId)}
                  disabled={activeExportId === entry.localId}
                  className="mt-3 rounded border border-slate-400 bg-slate-100 px-4 py-1 text-sm disabled:opacity-60"
                >
                  {activeExportId === entry.localId ? "Saving..." : "Export"}
                </button>

                {entry.exportText && (
                  <pre className="mt-3 max-h-80 overflow-auto rounded border border-slate-200 bg-slate-950 p-3 text-xs text-slate-100">
                    {entry.exportText}
                  </pre>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
