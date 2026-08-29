// Joytopia 2 LESC runtime
// LESC is a small Lua/Luau-inspired scripting layer for Joytopia 2.

export class LESC {
  constructor(api = {}) {
    this.api = api;
    this.functions = new Map();
  }

  run(source) {
    const lines = source.split(/\r?\n/);
    let current = null;
    let body = [];

    const execute = (line) => {
      const text = line.trim();
      if (!text || text.startsWith('--')) return;

      const printMatch = text.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
      if (printMatch) {
        console.log(printMatch[1]);
        return;
      }

      const callMatch = text.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)$/);
      if (callMatch && this.api[callMatch[1]]) {
        this.api[callMatch[1]]();
      }
    };

    for (const line of lines) {
      const functionMatch = line.trim().match(/^function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\((.*?)\)$/);
      if (functionMatch) {
        current = functionMatch[1];
        body = [];
        continue;
      }

      if (line.trim() === 'end' && current) {
        this.functions.set(current, [...body]);
        current = null;
        body = [];
        continue;
      }

      if (current) body.push(line);
      else execute(line);
    }

    const start = this.functions.get('onStart');
    if (start) start.forEach(execute);
  }
}
