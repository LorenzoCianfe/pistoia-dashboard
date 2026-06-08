import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "@node-rs/argon2";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const ARGON = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;
const hashPw = (pw: string) => hash(pw, ARGON);

const M = 1_000_000;
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAhead = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function wipe() {
  // Child-first deletion to satisfy foreign keys.
  await prisma.notification.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.officialAnswer.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.assessoreFollow.deleteMany();
  await prisma.assessore.deleteMany();
  await prisma.operaUpdate.deleteMany();
  await prisma.opera.deleteMany();
  await prisma.budgetMonth.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budgetYear.deleteMany();
  await prisma.serviceReview.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("⛏  Seeding Dashboard di Pistoia (mock data)…");
  await wipe();

  // --- Users ---------------------------------------------------------------
  const citizen = await prisma.user.create({
    data: {
      email: "cittadino@pistoia.it",
      name: "Giulia Vannucci",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      avatarColor: "viola",
      quartiere: "Centro storico",
      bio: "Curiosa di come funziona la mia città.",
      emailVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "comune@pistoia.it",
      name: "Redazione Comune",
      passwordHash: await hashPw("Comune2026!"),
      role: "ADMIN",
      avatarColor: "red",
      quartiere: "Comune di Pistoia",
      bio: "Account ufficiale (mock) della redazione del Comune.",
      emailVerified: true,
    },
  });

  // --- Bilancio ------------------------------------------------------------
  const entrate = [11.8, 12.1, 12.6, 12.9, 13.2, 13.0, 12.4, 11.9, 12.8, 13.4, 13.9, 14.2];
  const spese = [11.2, 11.5, 11.8, 12.0, 12.3, 12.1, 11.6, 11.3, 12.0, 12.4, 12.7, 12.9];
  const investimenti = [2.1, 2.4, 3.0, 3.6, 3.9, 4.2, 3.1, 2.6, 3.4, 4.0, 4.5, 4.8];

  await prisma.budgetYear.create({
    data: {
      year: 2026,
      totalSpesa: 142 * M,
      totalEntrate: 148 * M,
      avanzo: 6 * M,
      riscossione: 92,
      impegni: 86,
      pnrr: 71,
      months: {
        create: entrate.map((e, i) => ({
          month: i + 1,
          entrate: Math.round(e * M),
          spese: Math.round(spese[i] * M),
          investimenti: Math.round(investimenti[i] * M),
        })),
      },
      categories: {
        create: [
          { label: "Istruzione e scuola", amount: 34 * M, color: "teal", order: 1 },
          { label: "Mobilità e opere pubbliche", amount: 28 * M, color: "viola", order: 2 },
          { label: "Sociale e sanità", amount: 26 * M, color: "amber", order: 3 },
          { label: "Ambiente e verde", amount: 20 * M, color: "green", order: 4 },
          { label: "Cultura e turismo", amount: 18 * M, color: "red", order: 5 },
          { label: "Sicurezza e altro", amount: 16 * M, color: "teal", order: 6 },
        ],
      },
    },
  });

  // --- Opere ---------------------------------------------------------------
  const marini = await prisma.opera.create({
    data: {
      name: "Ristrutturazione Scuola Marino Marini",
      description:
        "Adeguamento sismico ed efficientamento energetico della scuola primaria Marino Marini, con nuova mensa e laboratori.",
      category: "scuola",
      progress: 72,
      status: "in_corso",
      investment: 4_200_000,
      location: "Via di Bigiano",
      startedAt: daysAgo(220),
      expectedEnd: daysAhead(140),
      featured: true,
      updates: {
        create: [
          { note: "Completate le strutture portanti del primo piano.", progress: 60, date: daysAgo(40) },
          { note: "Avviata la posa degli impianti e dei serramenti.", progress: 72, date: daysAgo(8) },
        ],
      },
    },
  });

  const ciclabile = await prisma.opera.create({
    data: {
      name: "Pista ciclabile lungo il fiume Ombrone",
      description:
        "Nuovo tratto di mobilità dolce di 3,4 km che collega il centro alla periferia est seguendo l'argine dell'Ombrone.",
      category: "mobilita",
      progress: 45,
      status: "in_corso",
      investment: 1_850_000,
      location: "Argine dell'Ombrone",
      startedAt: daysAgo(120),
      expectedEnd: daysAhead(210),
      featured: true,
      updates: {
        create: [
          { note: "Realizzato il primo tratto di 1,2 km e la nuova passerella.", progress: 45, date: daysAgo(15) },
        ],
      },
    },
  });

  const piazza = await prisma.opera.create({
    data: {
      name: "Riqualificazione di Piazza San Lorenzo",
      description:
        "Nuova pavimentazione, illuminazione e arredo urbano per restituire la piazza ai pedoni.",
      category: "piazza",
      progress: 30,
      status: "in_corso",
      investment: 2_300_000,
      location: "Piazza San Lorenzo",
      startedAt: daysAgo(70),
      expectedEnd: daysAhead(260),
      featured: true,
    },
  });

  const campanile = await prisma.opera.create({
    data: {
      name: "Restauro del campanile di San Zeno",
      description:
        "Consolidamento e restauro conservativo del campanile della Cattedrale di San Zeno.",
      category: "restauro",
      progress: 88,
      status: "in_corso",
      investment: 1_100_000,
      location: "Piazza del Duomo",
      startedAt: daysAgo(300),
      expectedEnd: daysAhead(40),
      featured: true,
      updates: {
        create: [
          { note: "Concluso il restauro della cella campanaria.", progress: 88, date: daysAgo(5) },
        ],
      },
    },
  });

  const pacini = await prisma.opera.create({
    data: {
      name: "Riqualificazione del giardino di Via Pacini",
      description:
        "Nuovi giochi inclusivi, area cani e impianto di irrigazione per il giardino di quartiere.",
      category: "verde",
      progress: 90,
      status: "in_corso",
      investment: 480_000,
      location: "Via Pacini",
      startedAt: daysAgo(95),
      expectedEnd: daysAhead(20),
      featured: false,
    },
  });

  await prisma.opera.createMany({
    data: [
      {
        name: "Nuovo asilo nido Le Fornaci",
        description: "Costruzione di un nido d'infanzia da 60 posti in classe energetica A.",
        category: "scuola",
        progress: 18,
        status: "in_corso",
        investment: 2_900_000,
        location: "Quartiere Le Fornaci",
        startedAt: daysAgo(30),
        expectedEnd: daysAhead(420),
      },
      {
        name: "Efficientamento illuminazione pubblica (LED)",
        description: "Sostituzione di 6.400 punti luce con tecnologia LED a basso consumo.",
        category: "mobilita",
        progress: 100,
        status: "completata",
        investment: 1_600_000,
        location: "Tutta la città",
        startedAt: daysAgo(400),
        expectedEnd: daysAgo(20),
      },
      {
        name: "Palestra scolastica di Bottegone",
        description: "Nuova palestra polifunzionale a servizio dell'istituto comprensivo.",
        category: "scuola",
        progress: 100,
        status: "completata",
        investment: 1_350_000,
        location: "Bottegone",
        startedAt: daysAgo(500),
        expectedEnd: daysAgo(60),
      },
      {
        name: "Messa in sicurezza del torrente Brana",
        description: "Interventi di regimazione idraulica per la riduzione del rischio alluvioni.",
        category: "sociale",
        progress: 0,
        status: "pianificata",
        investment: 5_200_000,
        location: "Torrente Brana",
        expectedEnd: daysAhead(600),
      },
      {
        name: "Nuova rotatoria di Via Ciliegiole",
        description: "Rotatoria per fluidificare il traffico e migliorare la sicurezza dell'incrocio.",
        category: "mobilita",
        progress: 0,
        status: "pianificata",
        investment: 700_000,
        location: "Via Ciliegiole",
        expectedEnd: daysAhead(300),
      },
      {
        name: "Restauro del Battistero",
        description: "Manutenzione straordinaria sospesa in attesa di nuovi fondi ministeriali.",
        category: "restauro",
        progress: 35,
        status: "sospesa",
        investment: 900_000,
        location: "Piazza del Duomo",
        startedAt: daysAgo(260),
      },
    ],
  });

  // --- Assessori (organigramma) -------------------------------------------
  const sindaco = await prisma.assessore.create({
    data: {
      name: "Marco Ferrari",
      role: "Sindaco",
      area: "Giunta comunale",
      initials: "MF",
      color: "red",
      votesElected: 24_180,
      email: "sindaco@comune.pistoia.it",
      order: 0,
    },
  });

  const vicesindaco = await prisma.assessore.create({
    data: {
      name: "Elena Bartolini",
      role: "Vicesindaca",
      area: "Bilancio e Personale",
      initials: "EB",
      color: "teal",
      votesElected: 3_420,
      parentId: sindaco.id,
      order: 1,
    },
  });

  const belli = await prisma.assessore.create({
    data: {
      name: "Chiara Belli",
      role: "Assessora all'Ambiente e al Verde",
      area: "Ambiente e Verde",
      initials: "CB",
      color: "green",
      votesElected: 2_980,
      parentId: sindaco.id,
      order: 2,
    },
  });

  await prisma.assessore.createMany({
    data: [
      {
        name: "Davide Innocenti",
        role: "Assessore alla Mobilità",
        area: "Mobilità e Lavori pubblici",
        initials: "DI",
        color: "viola",
        votesElected: 2_540,
        parentId: sindaco.id,
        order: 3,
      },
      {
        name: "Sara Niccolai",
        role: "Assessora alla Cultura",
        area: "Cultura e Turismo",
        initials: "SN",
        color: "amber",
        votesElected: 2_210,
        parentId: sindaco.id,
        order: 4,
      },
      {
        name: "Francesca Lippi",
        role: "Assessora al Sociale",
        area: "Sociale e Sanità",
        initials: "FL",
        color: "red",
        votesElected: 1_990,
        parentId: sindaco.id,
        order: 5,
      },
      {
        name: "Tommaso Vannini",
        role: "Assessore all'Istruzione",
        area: "Scuola e Istruzione",
        initials: "TV",
        color: "teal",
        votesElected: 1_760,
        parentId: sindaco.id,
        order: 6,
      },
    ],
  });

  // Demo citizen follows the environment assessor.
  await prisma.assessoreFollow.create({
    data: { assessoreId: belli.id, userId: citizen.id },
  });

  // --- Sondaggi ------------------------------------------------------------
  await prisma.poll.create({
    data: {
      question: "Quale dovrebbe essere la priorità per il 2026?",
      description: "Aiutaci a decidere dove concentrare gli sforzi della città il prossimo anno.",
      year: 2026,
      category: "Priorità 2026",
      active: true,
      assessoreId: belli.id,
      options: {
        create: [
          { label: "Verde urbano", color: "green", baseVotes: 410, order: 1 },
          { label: "Mobilità dolce", color: "viola", baseVotes: 350, order: 2 },
          { label: "Cultura", color: "amber", baseVotes: 240, order: 3 },
        ],
      },
    },
  });

  await prisma.poll.create({
    data: {
      question: "Dove investire l'avanzo di bilancio di 6 milioni?",
      description: "Un avanzo positivo è una scelta: dove preferiresti che andasse?",
      year: 2026,
      category: "Bilancio partecipativo",
      active: true,
      assessoreId: vicesindaco.id,
      options: {
        create: [
          { label: "Scuole e asili", color: "teal", baseVotes: 512, order: 1 },
          { label: "Manutenzione strade", color: "viola", baseVotes: 388, order: 2 },
          { label: "Impianti sportivi", color: "amber", baseVotes: 221, order: 3 },
          { label: "Parchi e verde", color: "green", baseVotes: 305, order: 4 },
        ],
      },
    },
  });

  await prisma.poll.create({
    data: {
      question: "Sei soddisfatto della raccolta differenziata?",
      year: 2025,
      category: "Sondaggio concluso",
      active: false,
      assessoreId: belli.id,
      options: {
        create: [
          { label: "Sì, funziona bene", color: "green", baseVotes: 1240, order: 1 },
          { label: "Va migliorata", color: "amber", baseVotes: 980, order: 2 },
          { label: "No, ci sono problemi", color: "red", baseVotes: 410, order: 3 },
        ],
      },
    },
  });

  // --- Recensioni servizi --------------------------------------------------
  await prisma.serviceReview.createMany({
    data: [
      { service: "Anagrafe", rating: 4.6, count: 1280, icon: "id-card", order: 1 },
      { service: "Tributi online", rating: 4.8, count: 940, icon: "receipt", order: 2 },
      { service: "Prenotazioni sanitarie", rating: 4.1, count: 720, icon: "stethoscope", order: 3 },
      { service: "Sportello unico edilizia", rating: 4.3, count: 510, icon: "building-2", order: 4 },
    ],
  });

  // --- Comunità (feed) -----------------------------------------------------
  const postPacini = await prisma.communityPost.create({
    data: {
      authorName: "Marco Gentili",
      authorInitials: "MG",
      authorColor: "teal",
      content: "Quando riapre il giardino di Via Pacini? I bambini lo aspettano da mesi!",
      imageSeed: "parco",
      category: "verde",
      baseLikes: 128,
      createdAt: hoursAgo(2),
      answer: {
        create: {
          body: "Riapertura prevista il 15 marzo, lavori al 90%. Stiamo completando l'area giochi inclusiva.",
          verified: true,
        },
      },
      comments: {
        create: [
          { authorName: "Anna R.", body: "Finalmente! Grazie per l'aggiornamento.", createdAt: hoursAgo(1) },
          { authorName: "Pietro M.", body: "Speriamo rispettino i tempi 🤞", createdAt: hoursAgo(1) },
        ],
      },
    },
  });

  await prisma.communityPost.create({
    data: {
      authorName: "Sofia Lenzi",
      authorInitials: "SL",
      authorColor: "amber",
      content: "I nuovi cestini in Piazza della Sala sono bellissimi e fanno la differenza. Complimenti!",
      category: "servizi",
      baseLikes: 64,
      createdAt: hoursAgo(9),
      comments: { create: [{ authorName: "Luca B.", body: "Vero, molto più puliti gli spazi.", createdAt: hoursAgo(8) }] },
    },
  });

  await prisma.communityPost.create({
    data: {
      authorName: "Riccardo Fini",
      authorInitials: "RF",
      authorColor: "viola",
      content: "Il semaforo di Via Ciliegiole è rotto da una settimana, è pericoloso. Si può intervenire?",
      category: "mobilita",
      baseLikes: 212,
      createdAt: hoursAgo(26),
      answer: {
        create: {
          body: "Segnalazione presa in carico: l'intervento è programmato entro 48 ore. Grazie per la segnalazione.",
          verified: true,
        },
      },
    },
  });

  await prisma.communityPost.create({
    data: {
      authorId: citizen.id,
      authorName: citizen.name,
      authorInitials: "GV",
      authorColor: citizen.avatarColor,
      content: "Sarebbe bello avere più rastrelliere per le bici in centro. Chi è d'accordo?",
      category: "mobilita",
      baseLikes: 41,
      createdAt: daysAgo(2),
    },
  });

  await prisma.communityPost.create({
    data: {
      authorName: "Giulio Taddei",
      authorInitials: "GT",
      authorColor: "green",
      content: "Quando partono davvero i lavori della ciclabile sull'Ombrone? Bellissimo progetto.",
      category: "mobilita",
      baseLikes: 87,
      createdAt: daysAgo(3),
      answer: {
        create: {
          body: "I lavori sono già in corso: il primo tratto di 1,2 km è completato. Avanzamento complessivo al 45%.",
          verified: true,
        },
      },
    },
  });

  // --- Notifiche per il cittadino demo ------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: citizen.id,
        type: "answer",
        title: "Il Comune ha risposto",
        body: "«Riapertura prevista il 15 marzo» alla domanda sul giardino di Via Pacini.",
        href: "/comunita",
        read: false,
        createdAt: hoursAgo(2),
      },
      {
        userId: citizen.id,
        type: "poll",
        title: "Nuovo sondaggio",
        body: "Quale dovrebbe essere la priorità per il 2026? Vota ora.",
        href: "/sondaggi",
        read: false,
        createdAt: hoursAgo(20),
      },
      {
        userId: citizen.id,
        type: "opera",
        title: "Aggiornamento cantiere",
        body: "Scuola Marino Marini: avanzamento salito al 72%.",
        href: "/opere",
        read: true,
        createdAt: daysAgo(1),
      },
      {
        userId: citizen.id,
        type: "system",
        title: "Benvenuta nella Dashboard di Pistoia",
        body: "Esplora il bilancio, segui i cantieri e fai sentire la tua voce.",
        href: "/bilancio",
        read: true,
        createdAt: daysAgo(4),
      },
    ],
  });

  // A like from the demo user on Marco's post.
  await prisma.postLike.create({
    data: { postId: postPacini.id, userId: citizen.id },
  });

  console.log("✅ Seed completato.");
  console.log("   Cittadino: cittadino@pistoia.it / Pistoia2026");
  console.log("   Admin:     comune@pistoia.it / Comune2026!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Seed fallito:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
