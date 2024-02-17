import * as vscode from 'vscode';

export function store(context: vscode.ExtensionContext) {
  function get<T>(key: string): T | undefined {
    return context.globalState.get<T>(key)
  }

  async function set(key: string, value: any): Promise<void> {
    await context.globalState.update(key, value)
  }

  function keys(): readonly string[] {
    return context.globalState.keys()
  }

  async function del(key: string): Promise<void> {
    await set(key, undefined)
  }

  function isExists(key: string): boolean {
    return ![null, undefined].includes(get(key))
  }

  function sync(keys: string[]) {
    context.globalState.setKeysForSync(keys)
  }

  return {
    get,
    set,
    keys,
    del,
    isExists,
    sync
  }
}