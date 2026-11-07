// Refreshes src/data/github.json. Only PUBLIC data ends up in the snapshot:
//  - the contribution calendar comes from the unauthenticated public profile page
//  - repo/commit/language numbers are aggregated from public repositories only
// Token: GITHUB_TOKEN, or the local `gh` CLI login. `--soft` keeps the old snapshot on failure.
import { execSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const USER = "RiskiWahyuSaputra";
const OUTPUT = fileURLToPath(new URL("../src/data/github.json", import.meta.url));
const SOFT = process.argv.includes("--soft");

async function retry(fn, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return execSync("gh auth token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

async function fetchCalendar() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`);
  if (!res.ok) throw new Error(`calendar: HTTP ${res.status}`);
  const html = await res.text();

  const counts = {};
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^([\d,]+) contribution/);
    counts[m[1]] = n ? parseInt(n[1].replace(/,/g, ""), 10) : 0;
  }
  const days = [];
  for (const m of html.matchAll(/<td[^>]*data-date="([^"]+)"[^>]*id="([^"]+)"[^>]*data-level="(\d)"/g)) {
    days.push({ date: m[1], count: counts[m[2]] ?? 0, level: Number(m[3]) });
  }
  if (!days.length) throw new Error("calendar: GitHub markup changed");
  days.sort((a, b) => a.date.localeCompare(b.date));

  const weeks = [];
  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (weekday === 0 || !weeks.length) weeks.push([]);
    weeks[weeks.length - 1].push(day);
  }
  return { days, weeks };
}

async function fetchRepoStats() {
  const query = `query($login:String!){
    user(login:$login){
      id createdAt
      repositories(first:100, ownerAffiliations:OWNER, privacy:PUBLIC, isFork:false){
        totalCount
        nodes{ name languages(first:12, orderBy:{field:SIZE,direction:DESC}){ edges{ size node{ name } } } }
      }
    }
  }`;
  const gql = async (q, variables) => {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, variables }),
    });
    const body = await res.json();
    if (body.errors) throw new Error(JSON.stringify(body.errors));
    return body.data;
  };

  const { user } = await gql(query, { login: USER });
  const repos = user.repositories.nodes;

  const bytes = {};
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) bytes[node.name] = (bytes[node.name] ?? 0) + size;
  }
  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  const languages = Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, size]) => ({ name, share: +((size / total) * 100).toFixed(1) }));

  // Commits authored by the user on each public repo's default branch.
  const aliases = repos
    .map(
      (r, i) => `r${i}: repository(owner:"${USER}", name:"${r.name}"){
        defaultBranchRef{ target{ ... on Commit { history(author:{id:"${user.id}"}){ totalCount } } } }
      }`,
    )
    .join("\n");
  const commitData = await gql(`query{ ${aliases} }`);
  const commits = Object.values(commitData).reduce(
    (sum, r) => sum + (r?.defaultBranchRef?.target?.history?.totalCount ?? 0),
    0,
  );

  return { publicRepos: user.repositories.totalCount, commits, languages, memberSince: user.createdAt };
}

function streaks(days) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return longest;
}

async function main() {
  const [{ days, weeks }, stats] = await Promise.all([retry(fetchCalendar), retry(fetchRepoStats)]);
  const totalContributions = days.reduce((sum, d) => sum + d.count, 0);
  const best = days.reduce((a, b) => (b.count > a.count ? b : a));
  const data = {
    username: USER,
    generatedAt: new Date().toISOString().slice(0, 10),
    ...stats,
    totalContributions,
    activeDays: days.filter((d) => d.count > 0).length,
    longestStreak: streaks(days),
    bestDay: { date: best.date, count: best.count },
    weeks,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(data) + "\n");
  console.log(
    `[github] ${data.publicRepos} repos, ${data.commits} commits, ${totalContributions} contributions, ${data.languages.map((l) => l.name).join(", ")}`,
  );
}

main().catch((err) => {
  if (SOFT && fs.existsSync(OUTPUT)) {
    console.warn(`[github] keeping old snapshot: ${err.message}`);
    return;
  }
  console.error(err);
  process.exit(1);
});
