# Where the traffic data lives

Both Bing exports are domain-level (`brainrush.run` including this subdomain),
so they are stored once, in the apex repo, rather than duplicated here:

`~/dev/repos/BrainRush/docs/analytics/`

| File | Contents |
|---|---|
| `brainrush.run_SearchPerformanceOverview_All_10_24_2026.csv` | Daily date / clicks / impressions / CTR, 2026-08-30 → 10-19 |
| `brainrush.run_KeywordReport_10_24_2026.csv` | 138 queries with impressions, clicks, CTR, average position |

The analysis and its caveats are in `~/dev/repos/BrainRush/docs/audit-2026-10-24-seo.md`.

Short version (2026-10-24): the query traffic is almost entirely this site, not
the game. 137 of 138 queries sit at position 10 or better on Bing, and
`初中英语单词` alone is 43% of impressions at position 8.4. DataForSEO's Google
numbers show nothing, which is expected — this audience searches on Bing.
