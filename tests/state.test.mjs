import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { load, save, getState, recordSnapshot, starsDelta, pushEvent, dateKey, limits } from '../dsh/state.js'
import { mapRepo } from '../dsh/github.js'

test('dateKey 输出 YYYY-MM-DD', () => {
  assert.match(dateKey(new Date('2026-10-28T03:00:00Z')), /^\d{4}-\d{2}-\d{2}$/)
})

test('快照记录与当日 star 增量', async () => {
  const root = await mkdtemp(join(tmpdir(), 'githb-'))
  await load(root)
  const state = getState()
  state.snapshots = {}
  const yesterday = new Date(Date.now() - 86400000)
  recordSnapshot('owner/repo', 100, 5)
  state.snapshots['owner/repo'] = state.snapshots['owner/repo'].map((item) => ({ ...item, dateKey: dateKey(yesterday) }))
  recordSnapshot('owner/repo', 130, 6)
  assert.equal(starsDelta('owner/repo'), 30)
  assert.equal(starsDelta('OTHER/repo'), 0)
  await save()
  assert.ok(getState().snapshots['owner/repo'].length >= 1)
  assert.ok(getState().subscriptions.length >= 0)
})

test('单日快照不产生增量', () => {
  const state = getState()
  state.snapshots = { 'only/today': [{ dateKey: dateKey(), stars: 50, forks: 1, at: new Date().toISOString() }] }
  assert.equal(starsDelta('only/today'), 0)
})

test('事件数量有上限', () => {
  const state = getState()
  state.events = []
  for (let i = 0; i < limits.MAX_EVENTS + 10; i += 1) pushEvent({ subId: 'x', ownerKey: 'k', kind: 'commit', title: `t${i}`, detail: '', at: new Date().toISOString() })
  assert.ok(state.events.length <= limits.MAX_EVENTS)
})

test('mapRepo 提取核心字段', () => {
  const item = mapRepo({ full_name: 'owner/repo', name: 'repo', owner: { login: 'owner' }, html_url: 'https://github.com/owner/repo', stargazers_count: 42, forks_count: 3, language: 'TypeScript', description: 'a repo', topics: ['dsh'] }, { rank: 1 })
  assert.equal(item.fullName, 'owner/repo')
  assert.equal(item.stars, 42)
  assert.equal(item.rank, 1)
  assert.deepEqual(item.topics, ['dsh'])
  assert.equal(item.url, 'https://github.com/owner/repo')
})