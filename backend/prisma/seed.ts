import { PrismaClient, UserRole, RoundStatus, SignalState } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEAM_NAMES = [
  "Apex Vanguard", "Quantum Phantoms", "Binary Gladiators", "Cyber Sentinels",
  "Null Pointers", "Red Team Zero", "Synapse Breakers", "Kernel Overlords",
  "Matrix Rebels", "Shadow Operatives", "Protocol 404", "Byte Raiders",
  "Cipher Legion", "Root Enforcers", "Echo Syndicate", "Glitch Mob",
  "Vector Wardens", "Dark Silicon", "Iron Daemons", "Omega Breach"
];

const ACCESS_TOKENS = Array.from({ length: 20 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, "0");
  return `TEAM${num}#2026`;
});

const ROUND1_QUESTIONS = [
  {
    orderIndex: 1,
    topic: "Binary & Number Systems",
    prompt: "What is the two's complement 8-bit binary representation of decimal -42, and what is its hexadecimal equivalent?",
    codeSnippet: null,
    options: [
      { id: "A", text: "11010110 (0xD6)" },
      { id: "B", text: "11010101 (0xD5)" },
      { id: "C", text: "00101010 (0x2A)" },
      { id: "D", text: "11100110 (0xE6)" }
    ],
    correctOption: "A",
    explanation: "+42 in 8-bit binary is 00101010. Inverting bits gives 11010101. Adding 1 yields 11010110, which converts to hexadecimal 0xD6."
  },
  {
    orderIndex: 2,
    topic: "Code Tracing",
    prompt: "Consider the following JavaScript snippet:\nconst a = [1, 2, 3];\nconst b = a.map(x => x * 2);\nb.push(a.shift());\nconsole.log(a.length + b.length);\nWhat is the printed output?",
    codeSnippet: "const a = [1, 2, 3];\nconst b = a.map(x => x * 2);\nb.push(a.shift());\nconsole.log(a.length + b.length);",
    options: [
      { id: "A", text: "5" },
      { id: "B", text: "6" },
      { id: "C", text: "4" },
      { id: "D", text: "7" }
    ],
    correctOption: "B",
    explanation: "Array a starts with 3 elements. Array b is [2, 4, 6] (length 3). a.shift() mutates a (length becomes 2) and pushes 1 to b (length becomes 4). 2 + 4 = 6."
  },
  {
    orderIndex: 3,
    topic: "Boolean Logic",
    prompt: "Which boolean expression is logically equivalent to NOT (A AND (B OR NOT C))?",
    codeSnippet: null,
    options: [
      { id: "A", text: "NOT A OR (NOT B AND C)" },
      { id: "B", text: "NOT A AND (NOT B OR C)" },
      { id: "C", text: "NOT A OR (NOT B OR C)" },
      { id: "D", text: "A AND (NOT B AND C)" }
    ],
    correctOption: "A",
    explanation: "Applying De Morgan's Law: ~(A & (B | ~C)) = ~A | ~(B | ~C) = ~A | (~B & ~~C) = ~A | (~B & C)."
  },
  {
    orderIndex: 4,
    topic: "Networking & DNS",
    prompt: "In a recursive DNS resolution process for secure.squid.org when the local cache is completely empty, which authority does the recursive resolver contact first?",
    codeSnippet: null,
    options: [
      { id: "A", text: "The Root DNS Server ('.')" },
      { id: "B", text: "The Top-Level Domain (TLD) Nameserver ('.org')" },
      { id: "C", text: "The Authoritative Nameserver for squid.org" },
      { id: "D", text: "The local router gateway" }
    ],
    correctOption: "A",
    explanation: "Recursive DNS resolvers without cached entries start iterative resolution at one of the 13 logical Root DNS server clusters ('.')."
  },
  {
    orderIndex: 5,
    topic: "Data Structures",
    prompt: "A queue Q and a stack S are initially empty. The operations executed in sequence are:\nenqueue(5), enqueue(10), push(dequeue()), enqueue(15), push(dequeue()), enqueue(pop()), push(20).\nWhat value is at the top of stack S?",
    codeSnippet: "enqueue(5), enqueue(10), push(dequeue())\nenqueue(15), push(dequeue()), enqueue(pop()), push(20)",
    options: [
      { id: "A", text: "20" },
      { id: "B", text: "10" },
      { id: "C", text: "5" },
      { id: "D", text: "15" }
    ],
    correctOption: "A",
    explanation: "The final operation executed directly on stack S is push(20), making 20 the element at the top of the stack."
  },
  {
    orderIndex: 6,
    topic: "Algorithmic Complexity",
    prompt: "What is the worst-case search time complexity in an unbalanced Binary Search Tree versus an AVL Tree with N elements?",
    codeSnippet: null,
    options: [
      { id: "A", text: "BST: O(N), AVL: O(log N)" },
      { id: "B", text: "BST: O(log N), AVL: O(1)" },
      { id: "C", text: "BST: O(N log N), AVL: O(log N)" },
      { id: "D", text: "BST: O(N), AVL: O(N)" }
    ],
    correctOption: "A",
    explanation: "An unbalanced BST can degenerate into a linear chain (O(N)), whereas a strictly self-balancing AVL tree guarantees O(log N) depth."
  },
  {
    orderIndex: 7,
    topic: "SQL & Databases",
    prompt: "Given table scores(team_id INT, points INT) containing rows (1, 100), (1, 200), (2, NULL), (3, 50). What does 'SELECT COUNT(*), COUNT(points), SUM(points) FROM scores' return?",
    codeSnippet: "SELECT COUNT(*), COUNT(points), SUM(points) FROM scores;",
    options: [
      { id: "A", text: "4, 3, 350" },
      { id: "B", text: "4, 4, 350" },
      { id: "C", text: "3, 3, 350" },
      { id: "D", text: "4, 3, NULL" }
    ],
    correctOption: "A",
    explanation: "COUNT(*) counts total rows (4). COUNT(column) ignores NULL values (3 rows with non-null points). SUM(points) ignores NULL and sums 100 + 200 + 50 = 350."
  },
  {
    orderIndex: 8,
    topic: "Cybersecurity Fundamentals",
    prompt: "Why are adaptive key derivation functions (Argon2, bcrypt, PBKDF2) strongly preferred over fast hashes like SHA-256 for password storage?",
    codeSnippet: null,
    options: [
      { id: "A", text: "They enforce configurable computational and memory work factors that dramatically slow down hardware/GPU brute-force attacks" },
      { id: "B", text: "SHA-256 output can be mathematically reversed using rainbow tables in O(1) time" },
      { id: "C", text: "Fast hashes cannot incorporate random cryptographic salts" },
      { id: "D", text: "Argon2 generates shorter digest strings that optimize database index storage" }
    ],
    correctOption: "A",
    explanation: "Adaptive password hashers have deliberate work factors (CPU & memory hardness) that prevent attackers from calculating billions of guesses per second on GPUs/ASICs."
  },
  {
    orderIndex: 9,
    topic: "Cryptography Riddle",
    prompt: "I enable two communicating parties to establish a shared secret key across an unencrypted, public channel without ever transmitting the secret key itself. What foundational protocol am I?",
    codeSnippet: null,
    options: [
      { id: "A", text: "Diffie-Hellman Key Exchange" },
      { id: "B", text: "Caesar Substitution Cipher" },
      { id: "C", text: "MD5 Message Digest" },
      { id: "D", text: "Kerberos Ticket Granting" }
    ],
    correctOption: "A",
    explanation: "Diffie-Hellman Key Exchange (published in 1976) leverages the discrete logarithm problem to securely negotiate a shared secret over an insecure medium."
  },
  {
    orderIndex: 10,
    topic: "Logic Deduction",
    prompt: "Four servers (Alpha, Beta, Gamma, Delta) report status. Exactly one statement is FALSE, and exactly three servers are online:\n1. Alpha: 'Beta is online.'\n2. Beta: 'Gamma is offline.'\n3. Gamma: 'Delta is online.'\n4. Delta: 'Alpha is offline.'\nWho made the FALSE statement?",
    codeSnippet: "Alpha: 'Beta is online.'\nBeta: 'Gamma is offline.'\nGamma: 'Delta is online.'\nDelta: 'Alpha is offline.'",
    options: [
      { id: "A", text: "Delta" },
      { id: "B", text: "Alpha" },
      { id: "C", text: "Beta" },
      { id: "D", text: "Gamma" }
    ],
    correctOption: "A",
    explanation: "If Delta's statement is False, Alpha is online. Alpha speaks the truth -> Beta is online. Beta speaks the truth -> Gamma is offline. Gamma speaks the truth -> Delta is online. The online servers are Alpha, Beta, Delta (exactly 3). The single false statement was made by Delta."
  }
];

export async function seed() {
  console.log("--- SEEDING SQUID PROTOCOL DATABASE ---");

  // 1. App Settings
  await prisma.appSettings.upsert({
    where: { key: "leaderboard_published" },
    update: { value: "true" },
    create: { key: "leaderboard_published", value: "true" }
  });

  await prisma.appSettings.upsert({
    where: { key: "event_name" },
    update: { value: "SQUID PROTOCOL — SURVIVE THE SYSTEM" },
    create: { key: "event_name", value: "SQUID PROTOCOL — SURVIVE THE SYSTEM" }
  });

  // 2. Round Controls (All start in UPCOMING status until admin starts them)
  await prisma.roundControl.upsert({
    where: { id: 1 },
    update: {
      status: RoundStatus.UPCOMING,
      doublePointsEnabled: false,
      remainingSeconds: 15 * 60,
      pausedAt: null
    },
    create: {
      id: 1,
      title: "Round 1 — The Signal Protocol",
      status: RoundStatus.UPCOMING,
      durationMinutes: 15,
      signalState: SignalState.GREEN,
      redLightPenaltyMode: false,
      doublePointsEnabled: false,
      remainingSeconds: 15 * 60
    }
  });

  await prisma.roundControl.upsert({
    where: { id: 2 },
    update: {
      status: RoundStatus.UPCOMING,
      doublePointsEnabled: false,
      remainingSeconds: 20 * 60,
      pausedAt: null
    },
    create: {
      id: 2,
      title: "Round 2 — The Logic Protocol",
      status: RoundStatus.UPCOMING,
      durationMinutes: 20,
      signalState: SignalState.GREEN,
      redLightPenaltyMode: false,
      doublePointsEnabled: false,
      remainingSeconds: 20 * 60
    }
  });

  await prisma.roundControl.upsert({
    where: { id: 3 },
    update: {
      status: RoundStatus.UPCOMING,
      doublePointsEnabled: false,
      remainingSeconds: 30 * 60,
      pausedAt: null
    },
    create: {
      id: 3,
      title: "Round 3 — The Final Breach",
      status: RoundStatus.UPCOMING,
      durationMinutes: 30,
      signalState: SignalState.GREEN,
      redLightPenaltyMode: false,
      doublePointsEnabled: false,
      remainingSeconds: 30 * 60
    }
  });

  // 3. Admin Account
  const adminPasswordHash = await bcrypt.hash("Admin#2026", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordHash: adminPasswordHash, role: UserRole.ADMIN },
    create: {
      username: "admin",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    }
  });


  // 4. 20 Teams and Credentials
  for (let i = 0; i < 20; i++) {
    const teamNum = (i + 1).toString().padStart(2, "0");
    const teamCode = `TEAM${teamNum}`;
    const teamPasswordHash = await bcrypt.hash(`${teamCode.toLowerCase()}#2026`, 10);
    const name = TEAM_NAMES[i];
    const members = `Operative ${teamNum}-A, Operative ${teamNum}-B, Operative ${teamNum}-C`;
    const tokenCode = ACCESS_TOKENS[i];

    const team = await prisma.team.upsert({
      where: { teamCode },
      update: { name, members },
      create: {
        teamCode,
        name,
        members,
        currentRound: 1,
        currentStage: 1,
        totalScore: 0
      }
    });

    // Create user login for team
    await prisma.user.upsert({
      where: { username: teamCode.toLowerCase() },
      update: { passwordHash: teamPasswordHash, teamId: team.id },
      create: {
        username: teamCode.toLowerCase(),
        passwordHash: teamPasswordHash,
        role: UserRole.TEAM,
        teamId: team.id
      }
    });

    // Create access token for Round 3 QR code
    await prisma.accessToken.upsert({
      where: { teamId: team.id },
      update: { tokenCode },
      create: {
        teamId: team.id,
        tokenCode,
        isRedeemed: false
      }
    });
  }

  // 5. Round 1 Questions
  for (const q of ROUND1_QUESTIONS) {
    await prisma.question.upsert({
      where: { orderIndex: q.orderIndex },
      update: {
        topic: q.topic,
        prompt: q.prompt,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        pointsNormal: 100,
        pointsDouble: 200
      },
      create: {
        round: 1,
        orderIndex: q.orderIndex,
        topic: q.topic,
        prompt: q.prompt,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        pointsNormal: 100,
        pointsDouble: 200,
        isActive: true
      }
    });
  }

  // 6. Round 2 Sudoku (Unique Solution mathematically verified)
  await prisma.sudokuPuzzle.deleteMany({});
  await prisma.sudokuPuzzle.create({
    data: {
      round: 2,
      initialGrid: "S0C0A00A0S0CT00D0A0UA0C0C0U0D00D0C0U",
      solutionGrid: "STCUADUADSTCTCSDUADUATCSCSUADTADTCSU",
      hintDeductionPercent: 25,
      isActive: true
    }
  });

  // 7. Round 2 Broken Logic Challenge
  await prisma.brokenLogicPuzzle.deleteMany({});
  await prisma.brokenLogicPuzzle.create({
    data: {
      round: 2,
      title: "Broken Priority Queue Checksum",
      scenario: "The perimeter network gateway processes packet burst lengths: [7, 14, 25, 32, 41] with initial accumulator = 100.\n\nIntended Security Specification:\nA packet qualifies for fast-track processing ONLY if it has an EVEN length AND satisfies either (length > 20 OR length < 10).\n- If qualified: Add (length * 3) to accumulator\n- If NOT qualified: Subtract (length * 2) from accumulator\n\nBuggy Code in Firmware:\nif (length % 2 == 0 && length > 20 || length < 10)\n\nDue to operator precedence (&& precedes ||), odd packet 7 erroneously qualifies.\n\nTask: Trace the CORRECT intended logic and submit the resulting accumulator value.",
      codeSnippet: "accumulator = 100;\npackets = [7, 14, 25, 32, 41];\n\nfor (length of packets) {\n  // INTENDED SPECIFICATION:\n  if ((length % 2 === 0) && (length > 20 || length < 10)) {\n    accumulator += (length * 3);\n  } else {\n    accumulator -= (length * 2);\n  }\n}\nreturn accumulator;",
      expectedOutput: "22",
      points: 200,
      isActive: true
    }
  });

  // 8. Round 3 Debug Challenge (Equivalent Java, Python, C)
  await prisma.debugChallenge.deleteMany({});
  await prisma.debugChallenge.create({
    data: {
      title: "Kernel Packet Checksum & Key Derivation",
      description: "A cryptographic token generation routine processes 8 diagnostic bytes. The intended logic transforms even bytes via bitwise shift and offset ((b << 2) + 3), and odd bytes via XOR (b ^ 0x4B).",
      intendedBehavior: "Correctly calculate the checksum when operator precedence bug between addition (+) and bitwise left-shift (<<) is resolved.",
      inputData: "[12, 25, 34, 47, 58, 63, 72, 81]",
      derivationRule: "Derive key as 'PROTOCOL_BREACH_' concatenated with the corrected integer checksum.",
      expectedFinalKey: "PROTOCOL_BREACH_1040",
      points: 200,
      isActive: true,
      javaCode: `public class KernelChecksum {
    public static void main(String[] args) {
        int[] data = {12, 25, 34, 47, 58, 63, 72, 81};
        int checksum = 0;
        for (int b : data) {
            if (b % 2 == 0) {
                // BUG: In Java, '+' has higher precedence than '<<'
                checksum += b << 2 + 3; // Evaluates as b << (2 + 3)
            } else {
                checksum += (b ^ 0x4B);
            }
        }
        System.out.println("PROTOCOL_BREACH_" + checksum);
    }
}`,
      pythonCode: `def kernel_checksum():
    data = [12, 25, 34, 47, 58, 63, 72, 81]
    checksum = 0
    for b in data:
        if b % 2 == 0:
            # BUG: In Python, '+' has higher precedence than '<<'
            checksum += b << 2 + 3  # Evaluates as b << (2 + 3)
        else:
            checksum += (b ^ 0x4B)
    return f"PROTOCOL_BREACH_{checksum}"

print(kernel_checksum())`,
      cCode: `#include <stdio.h>

int main() {
    int data[] = {12, 25, 34, 47, 58, 63, 72, 81};
    int n = 8;
    int checksum = 0;
    for (int i = 0; i < n; i++) {
        int b = data[i];
        if (b % 2 == 0) {
            // BUG: In C, '+' has higher precedence than '<<'
            checksum += b << 2 + 3; // Evaluates as b << (2 + 3)
        } else {
            checksum += (b ^ 0x4B);
        }
    }
    printf("PROTOCOL_BREACH_%d\\n", checksum);
    return 0;
}`
    }
  });

  console.log("✅ Seed completed successfully!");
  console.log("   - Admin user seeded: admin / Admin#2026");
  console.log("   - 20 Teams seeded (TEAM01 to TEAM20) with team-specific PINs: teamXX#2026");
  console.log("   - Round 1: 10 Verified MCQs seeded (UPCOMING)");
  console.log("   - Round 2: Verified 6x6 Shape Sudoku & Broken Logic puzzle seeded (UPCOMING)");
  console.log("   - Round 3: Unique Single-Use QR Access Tokens & Debug Challenge seeded (UPCOMING)");
}

if (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js')) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
