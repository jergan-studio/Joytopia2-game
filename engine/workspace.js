// Joytopia 2 Workspace loader: JSON -> JavaScript runtime objects.
export async function loadWorkspace(url = './workspace/Workspace.json') {
  const workspace = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`Could not load ${url}`);
    return r.json();
  });

  const base = url.substring(0, url.lastIndexOf('/') + 1);
  const parts = [];
  for (const file of workspace.parts || []) {
    const data = await fetch(base + file).then(r => r.json());
    parts.push(data);
  }

  let player = null;
  if (workspace.player) {
    player = await fetch(base + workspace.player).then(r => r.json());
  }

  return { ...workspace, parts, player };
}

export function jsonPartToJS(part) {
  return {
    name: part.name,
    type: part.type || 'Part',
    x: Number(part.position?.x || 0),
    y: Number(part.position?.y || 0),
    width: Number(part.size?.width || 32),
    height: Number(part.size?.height || 32),
    color: part.color || '#ffffff',
    collision: part.collision !== false,
    visible: part.visible !== false
  };
}
