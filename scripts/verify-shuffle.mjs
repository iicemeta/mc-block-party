import { fisherYatesShuffle, assignTeams, mulberry32 } from "../src/lib/shuffle.ts";
import { MOCK_PARTICIPANTS } from "../src/lib/mockParticipants.ts";

const assert = (cond, msg) => {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
};

const shuffled = fisherYatesShuffle(MOCK_PARTICIPANTS);
assert(shuffled.length === MOCK_PARTICIPANTS.length, "打乱后长度一致");
assert(new Set(shuffled).size === MOCK_PARTICIPANTS.length, "打乱后无重复");
assert(
  MOCK_PARTICIPANTS.every((n) => shuffled.includes(n)),
  "打乱后无遗漏"
);

const a = fisherYatesShuffle(MOCK_PARTICIPANTS, mulberry32(42));
const b = fisherYatesShuffle(MOCK_PARTICIPANTS, mulberry32(42));
assert(JSON.stringify(a) === JSON.stringify(b), "同种子结果可复现");
assert(
  JSON.stringify(a) !== JSON.stringify(fisherYatesShuffle(MOCK_PARTICIPANTS, mulberry32(43))),
  "不同种子结果不同"
);

const teams = assignTeams(MOCK_PARTICIPANTS, 4, mulberry32(7));
assert(teams.length === 6, "24 人每队 4 人应分 6 队");
assert(teams.every((t) => t.members.length === 4), "每队恰好 4 人");
const all = teams.flatMap((t) => t.members);
assert(new Set(all).size === MOCK_PARTICIPANTS.length, "分组成员无重复");
assert(all.length === MOCK_PARTICIPANTS.length, "分组成员无遗漏");
assert(
  teams.every((t) => t.name && t.icon && t.icon.startsWith("/img/items/")),
  "每队有队名与图标"
);

const remainder = assignTeams(MOCK_PARTICIPANTS.slice(0, 10), 4);
assert(remainder.length === 3, "10 人每队 4 人应分 3 队");
assert(
  remainder.slice(0, 2).every((t) => t.members.length === 4) &&
    remainder[2].members.length === 2,
  "末队允许人数不足"
);

let threw = false;
try {
  assignTeams(MOCK_PARTICIPANTS, 0);
} catch {
  threw = true;
}
assert(threw, "teamSize=0 应抛错");
threw = false;
try {
  assignTeams(MOCK_PARTICIPANTS.slice(0, 2), 4);
} catch {
  threw = true;
}
assert(threw, "人数不足应抛错");

console.log("shuffle 验证全部通过");
