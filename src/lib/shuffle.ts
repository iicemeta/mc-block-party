export type RNG = () => number;

export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fisherYatesShuffle<T>(input: readonly T[], rng: RNG = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export type Team = { name: string; icon: string; members: string[] };

export const TEAM_META: ReadonlyArray<{ name: string; icon: string }> = [
  { name: "苦力怕小队", icon: "/img/items/tnt.png" },
  { name: "钻石小队", icon: "/img/items/diamond.png" },
  { name: "红石小队", icon: "/img/items/redstone_block.png" },
  { name: "末影小队", icon: "/img/items/ender_pearl.png" },
  { name: "金苹果小队", icon: "/img/items/golden_apple.png" },
  { name: "挖矿小队", icon: "/img/items/diamond_pickaxe.png" },
  { name: "煤炭小队", icon: "/img/items/coal.png" },
  { name: "工作台小队", icon: "/img/items/crafting_table.png" },
  { name: "草方块小队", icon: "/img/items/grass_block.png" },
  { name: "橡木小队", icon: "/img/items/oak_planks.png" },
  { name: "野花小队", icon: "/img/items/azure_bluet.png" },
  { name: "黑曜石小队", icon: "/img/items/coal_block.png" },
];

export function assignTeams(
  names: readonly string[],
  teamSize: number,
  rng: RNG = Math.random
): Team[] {
  if (!Number.isInteger(teamSize) || teamSize < 1) {
    throw new Error("每组人数必须是 >= 1 的整数");
  }
  if (names.length < teamSize) {
    throw new Error("报名人数不足以组成一支队伍");
  }
  const shuffled = fisherYatesShuffle(names, rng);
  const teamCount = Math.ceil(shuffled.length / teamSize);
  const teams: Team[] = [];
  for (let t = 0; t < teamCount; t++) {
    const members = shuffled.slice(t * teamSize, (t + 1) * teamSize);
    const meta = TEAM_META[t % TEAM_META.length];
    teams.push({ name: meta.name, icon: meta.icon, members });
  }
  return teams;
}
