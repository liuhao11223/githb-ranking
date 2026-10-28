import { trendingNew, trendingHot, dshPlugins, mapRepo } from './github.js'
import { recordSnapshot, starsDelta } from './state.js'

const withRank = (items, extra) => items.map((item, index) => mapRepo(item, { rank: index + 1, starsDeltaToday: starsDelta(item.full_name), dshWeight: item._dshWeight, ...extra }))

// 拉取三类榜单并记录今日 star 快照。
export async function buildRankings() {
  const [fresh, hot, plugins] = await Promise.allSettled([trendingNew(), trendingHot(), dshPlugins()])
  const safe = (result, fallback = []) => (result.status === 'fulfilled' ? result.value : fallback)
  const newList = safe(fresh)
  const hotList = safe(hot)
  const pluginList = safe(plugins)
  for (const item of [...newList, ...hotList, ...pluginList]) {
    try { recordSnapshot(item.full_name, item.stargazers_count || 0, item.forks_count || 0) } catch { /* 快照失败不影响榜单 */ }
  }
  return {
    new: withRank(newList, { source: 'new' }),
    hot: withRank(hotList, { source: 'hot' }),
    dsh: withRank(pluginList, { source: 'dsh' }),
    errors: [fresh, hot, plugins].filter((result) => result.status === 'rejected').map((result) => result.reason?.message || '查询失败'),
  }
}