import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { join } from 'node:path'

const MAX_SNAPSHOT_DAYS = 400
const MAX_EVENTS = 300
const MAX_SUBSCRIPTIONS = 200

export const now = () => new Date().toISOString()
export const dateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export const defaultState = () => ({
  snapshots: {},
  subscriptions: [],
  events: [],
  lastCheckAt: '',
  config: { token: '', theme: 'dark' },
})

let dataFile = ''
let state = defaultState()

export async function load(root) {
  await mkdir(root, { recursive: true })
  dataFile = join(root, 'state.json')
  try {
    const parsed = JSON.parse(await readFile(dataFile, 'utf8'))
    state = { ...defaultState(), ...parsed, config: { ...defaultState().config, ...(parsed.config || {}) } }
    await save()
  } catch {
    state = defaultState()
    await save()
  }
}

export async function save() {
  const temporary = `${dataFile}.tmp`
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  await rename(temporary, dataFile)
}

export const getState = () => state

// 记录某仓库在某自然日的 star/fork 快照，用于计算本地趋势。
export function recordSnapshot(fullName, stars, forks) {
  const key = String(fullName).toLowerCase()
  const day = dateKey()
  const days = state.snapshots[key] || []
  const existing = days.find((item) => item.dateKey === day)
  const next = { dateKey: day, stars, forks, at: now() }
  state.snapshots[key] = existing
    ? days.map((item) => (item.dateKey === day ? next : item)).slice(-MAX_SNAPSHOT_DAYS)
    : [...days, next].slice(-MAX_SNAPSHOT_DAYS)
}

// 相对今日的 star 增量：对比最近一个更早日期的快照。
export function starsDelta(fullName) {
  const days = state.snapshots[String(fullName).toLowerCase()] || []
  if (days.length < 1) return 0
  const today = dateKey()
  const current = [...days].reverse().find((item) => item.dateKey <= today)
  if (!current) return 0
  const previous = [...days].reverse().find((item) => item.dateKey < current.dateKey)
  if (!previous) return 0
  return Math.max(0, (current.stars || 0) - (previous.stars || 0))
}

export function pushEvent(event) {
  state.events = [{ ...event, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: now(), read: false }, ...state.events].slice(0, MAX_EVENTS)
}

export const limits = { MAX_SNAPSHOT_DAYS, MAX_EVENTS, MAX_SUBSCRIPTIONS }