export function toggleKey(current: ReadonlySet<string>, key: string, total: number): Set<string> {
  const next = new Set(current)
  if (next.has(key)) next.delete(key)
  else if (next.size < total - 1) next.add(key)
  return next
}
