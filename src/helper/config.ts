import * as vscode from 'vscode';

export function config() {
  function get<T>(key: string): T | undefined {
    const cfg = vscode.workspace.getConfiguration("ibadah")
    return cfg.get<T>(key)
  }

  async function set(key: string, value: any): Promise<void> {
    const cfg = vscode.workspace.getConfiguration("ibadah")
    await cfg.update(key, value, true)
  }

  function isExists(key: string): boolean {
    return ![null, undefined].includes(get(key))
  }

  return {
    get,
    set,
    isExists,
  }
}