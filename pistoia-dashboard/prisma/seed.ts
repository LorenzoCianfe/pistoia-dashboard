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

// Mock "vivo" (O1): un hash deterministico del giorno varia leggermente
// contatori e contenuti freschi, così ogni ri-seed racconta una città un po'
// diversa ma coerente — senza casualità non riproducibile.
const DAY_KEY = new Date().toISOString().slice(0, 10);
let dayHash = 0;
for (let i = 0; i < DAY_KEY.length; i++) {
  dayHash = (dayHash * 31 + DAY_KEY.charCodeAt(i)) >>> 0;
}
/** base + variazione giornaliera in [0, spread]. */
const vary = (base: number, spread: number) => base + (dayHash % (spread + 1));

/** A small inline SVG used as a stand-in "photo" for the works gallery (mock). */
const photoSvg = (label: string, c1: string, c2: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><text x='50%' y='50%' fill='white' font-family='sans-serif' font-size='30' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`,
  );

async function wipe() {
  // Child-first deletion to satisfy foreign keys.
  await prisma.decision.deleteMany();
  await prisma.commitment.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.cityFaq.deleteMany();
  await prisma.answerFeedback.deleteMany();
  await prisma.commentReport.deleteMany();
  await prisma.event.deleteMany();
  await prisma.operaComment.deleteMany();
  await prisma.operaPhoto.deleteMany();
  await prisma.operaFaq.deleteMany();
  await prisma.blockedWord.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.officialAnswer.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.reportPhoto.deleteMany();
  await prisma.reportConfirmation.deleteMany();
  await prisma.reportStatusHistory.deleteMany();
  await prisma.report.deleteMany();
  await prisma.proposalSupport.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.assessoreFollow.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.assessore.deleteMany();
  await prisma.operaUpdate.deleteMany();
  await prisma.opera.deleteMany();
  await prisma.budgetMonth.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budgetYear.deleteMany();
  await prisma.serviceReview.deleteMany();
  await prisma.profileVerification.deleteMany();
  await prisma.citizenBadge.deleteMany();
  await prisma.organizationProfile.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.session.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("⛏  Seeding Dashboard di Pistoia (mock data)…");
  await wipe();

  // --- Quartieri e frazioni ------------------------------------------------
  const NEIGHBORHOODS: { name: string; slug: string; kind: string }[] = [
    { name: "Pistoia Centro", slug: "centro", kind: "quartiere" },
    { name: "Sant'Agostino", slug: "sant-agostino", kind: "quartiere" },
    { name: "Bottegone", slug: "bottegone", kind: "frazione" },
    { name: "Bonelle", slug: "bonelle", kind: "frazione" },
    { name: "Candeglia", slug: "candeglia", kind: "frazione" },
    { name: "Pontenuovo", slug: "pontenuovo", kind: "frazione" },
    { name: "Le Fornaci", slug: "le-fornaci", kind: "quartiere" },
    { name: "Vergine", slug: "vergine", kind: "quartiere" },
    { name: "Ramini", slug: "ramini", kind: "frazione" },
    { name: "Collina e frazioni montane", slug: "collina", kind: "frazione" },
  ];
  await prisma.neighborhood.createMany({
    data: NEIGHBORHOODS.map((n, i) => ({ ...n, order: i + 1 })),
  });
  const nbRows = await prisma.neighborhood.findMany();
  const nb = Object.fromEntries(nbRows.map((n) => [n.slug, n.id])) as Record<string, string>;

  // --- Users ---------------------------------------------------------------
  const citizen = await prisma.user.create({
    data: {
      email: "cittadino@pistoia.it",
      name: "Giulia Vannucci",
      publicName: "Giulia V.",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      accountType: "CITIZEN",
      verifiedType: "RESIDENCY",
      avatarColor: "viola",
      quartiere: "Centro storico",
      neighborhoodId: nb["centro"],
      bio: "Curiosa di come funziona la mia città.",
      civicInterests: JSON.stringify(["ambiente", "cultura", "scuole"]),
      emailVerified: true,
      badges: {
        create: [
          { badgeType: "residency", label: "Residente verificato", icon: "🏠" },
          { badgeType: "identity", label: "Identità verificata", icon: "✅" },
          { badgeType: "active_citizen", label: "Cittadino attivo", icon: "⭐" },
        ],
      },
      verifications: {
        create: [{ type: "RESIDENCY", status: "APPROVED", reviewedAt: daysAgo(30) }],
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "comune@pistoia.it",
      name: "Redazione Comune",
      publicName: "Comune di Pistoia",
      passwordHash: await hashPw("Comune2026!"),
      role: "ADMIN",
      accountType: "MUNICIPAL",
      verifiedType: "MUNICIPAL_STAFF",
      avatarColor: "red",
      quartiere: "Comune di Pistoia",
      bio: "Account ufficiale (mock) della redazione del Comune.",
      emailVerified: true,
      badges: { create: [{ badgeType: "municipal", label: "Account ufficiale Comune", icon: "🏛️" }] },
    },
  });

  // Lorenzo — verified citizen (the "Lorenzo C." of the proposal).
  const lorenzo = await prisma.user.create({
    data: {
      email: "lorenzo@pistoia.it",
      name: "Lorenzo Cianferoni",
      publicName: "Lorenzo C.",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      accountType: "CITIZEN",
      verifiedType: "IDENTITY",
      avatarColor: "teal",
      neighborhoodId: nb["centro"],
      bio: "Cittadino attivo, interessato a mobilità e verde.",
      civicInterests: JSON.stringify(["mobilita", "ambiente", "eventi"]),
      emailVerified: true,
      badges: {
        create: [
          { badgeType: "identity", label: "Identità verificata", icon: "✅" },
          { badgeType: "useful_proposals", label: "Proposte utili", icon: "💡" },
          { badgeType: "reliable_reporter", label: "Segnalatore affidabile", icon: "📣" },
        ],
      },
      verifications: { create: [{ type: "IDENTITY", status: "APPROVED", reviewedAt: daysAgo(60) }] },
    },
  });

  // Marco — registered but NOT verified, with a PENDING request (admin queue demo).
  const marco = await prisma.user.create({
    data: {
      email: "marco@pistoia.it",
      name: "Marco Gentili",
      publicName: "Marco G.",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      accountType: "CITIZEN",
      avatarColor: "amber",
      neighborhoodId: nb["sant-agostino"],
      emailVerified: true,
      verifications: { create: [{ type: "IDENTITY", status: "PENDING", note: "Vorrei poter supportare le proposte del mio quartiere." }] },
    },
  });

  // Sara — civic moderator.
  const moderatore = await prisma.user.create({
    data: {
      email: "moderatore@pistoia.it",
      name: "Sara Niccolini",
      publicName: "Sara N.",
      passwordHash: await hashPw("Pistoia2026"),
      role: "MODERATOR",
      accountType: "CITIZEN",
      verifiedType: "IDENTITY",
      avatarColor: "green",
      neighborhoodId: nb["pontenuovo"],
      bio: "Moderatrice civica della community.",
      emailVerified: true,
      badges: {
        create: [
          { badgeType: "moderator", label: "Moderatore civico", icon: "🛡️" },
          { badgeType: "identity", label: "Identità verificata", icon: "✅" },
        ],
      },
      verifications: { create: [{ type: "IDENTITY", status: "APPROVED", reviewedAt: daysAgo(90) }] },
    },
  });

  // Verified association.
  const assoc = await prisma.user.create({
    data: {
      email: "associazione@pistoia.it",
      name: "Amici del Parco di Monteoliveto",
      publicName: "Amici del Parco",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      accountType: "ASSOCIATION",
      verifiedType: "ASSOCIATION",
      avatarColor: "green",
      neighborhoodId: nb["le-fornaci"],
      bio: "Associazione di volontariato per la cura del verde pubblico.",
      emailVerified: true,
      badges: { create: [{ badgeType: "association", label: "Associazione verificata", icon: "🤝" }] },
      verifications: { create: [{ type: "ASSOCIATION", status: "APPROVED", organizationName: "Amici del Parco di Monteoliveto", reviewedAt: daysAgo(45) }] },
      organization: {
        create: {
          type: "ASSOCIATION",
          name: "Amici del Parco di Monteoliveto",
          description: "Volontari per la manutenzione e l'animazione delle aree verdi del quartiere.",
          category: "Ambiente",
          verified: true,
        },
      },
    },
  });

  // Verified local business.
  await prisma.user.create({
    data: {
      email: "attivita@pistoia.it",
      name: "Bottega del Corso",
      publicName: "Bottega del Corso",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      accountType: "BUSINESS",
      verifiedType: "BUSINESS",
      avatarColor: "amber",
      neighborhoodId: nb["centro"],
      bio: "Attività storica del centro, attenta alla vita del quartiere.",
      emailVerified: true,
      badges: { create: [{ badgeType: "business", label: "Attività locale verificata", icon: "🛍️" }] },
      verifications: { create: [{ type: "BUSINESS", status: "APPROVED", organizationName: "Bottega del Corso", reviewedAt: daysAgo(20) }] },
      organization: {
        create: {
          type: "BUSINESS",
          name: "Bottega del Corso",
          description: "Bottega di prodotti tipici in Corso Gramsci.",
          category: "Commercio",
          verified: true,
        },
      },
    },
  });

  // A business awaiting verification (admin queue demo).
  await prisma.user.create({
    data: {
      email: "caffe@pistoia.it",
      name: "Caffè Globo",
      publicName: "Caffè Globo",
      passwordHash: await hashPw("Pistoia2026"),
      role: "CITIZEN",
      accountType: "BUSINESS",
      avatarColor: "red",
      neighborhoodId: nb["centro"],
      emailVerified: true,
      verifications: { create: [{ type: "BUSINESS", status: "PENDING", organizationName: "Caffè Globo", note: "Bar storico di Piazza della Sala." }] },
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

  // Consultazione ufficiale (riservata ai profili verificati).
  await prisma.poll.create({
    data: {
      question: "Piano mobilità del centro storico: cosa privilegiare?",
      description: "Consultazione ufficiale riservata ai cittadini verificati. Il tuo contributo confluisce nel percorso partecipativo del nuovo piano.",
      year: 2026,
      category: "Consultazione ufficiale",
      kind: "consultazione",
      requiresVerified: true,
      active: true,
      assessoreId: vicesindaco.id,
      options: {
        create: [
          { label: "Più aree pedonali", color: "green", baseVotes: 280, order: 1 },
          { label: "Più parcheggi di scambio", color: "viola", baseVotes: 240, order: 2 },
          { label: "Più trasporto pubblico", color: "teal", baseVotes: 190, order: 3 },
        ],
      },
    },
  });

  // Voto territoriale (verificati del quartiere).
  await prisma.poll.create({
    data: {
      question: "Quale area verde di Le Fornaci riqualificare per prima?",
      description: "Voto territoriale riservato ai residenti verificati del quartiere.",
      year: 2026,
      category: "Voto territoriale",
      kind: "territoriale",
      requiresVerified: true,
      neighborhoodId: nb["le-fornaci"],
      active: true,
      assessoreId: belli.id,
      options: {
        create: [
          { label: "Parco di Monteoliveto", color: "green", baseVotes: 142, order: 1 },
          { label: "Giardino di Via delle Fornaci", color: "teal", baseVotes: 98, order: 2 },
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
      kind: "domanda",
      neighborhoodId: nb["centro"],
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
      kind: "avviso",
      neighborhoodId: nb["centro"],
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
      kind: "domanda",
      neighborhoodId: nb["sant-agostino"],
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
      kind: "idea",
      neighborhoodId: nb["centro"],
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
      kind: "domanda",
      neighborhoodId: nb["centro"],
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

  // --- Segnalazioni (reports) ---------------------------------------------
  const repLampione = await prisma.report.create({
    data: {
      authorId: marco.id,
      authorName: marco.publicName ?? marco.name,
      authorInitials: "MG",
      authorColor: marco.avatarColor,
      title: "Lampione spento in Via Ciliegiole",
      description:
        "Il lampione all'incrocio con Via di Gello è spento da oltre una settimana. La sera la zona è completamente al buio ed è pericolosa per i pedoni.",
      category: "illuminazione",
      status: "in_lavorazione",
      neighborhoodId: nb["sant-agostino"],
      location: "Via Ciliegiole, incrocio Via di Gello",
      assignedDepartment: "Ufficio Strade e Manutenzioni",
      baseConfirmations: vary(45, 6),
      createdAt: daysAgo(9),
      // Urgenza richiesta dal cittadino e confermata dal moderatore (A1 §8).
      urgency: "confermata",
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta con richiesta di urgenza: un moderatore la verificherà a breve.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(9) },
          { status: "ricevuta", note: "Urgenza confermata: la segnalazione viene trattata con priorità.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(9) },
          { status: "validata", note: "Segnalazione validata e inoltrata all'ufficio competente.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(8) },
          { status: "presa_in_carico", note: "Presa in carico dall'Ufficio Strade e Manutenzioni.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(5) },
          { status: "in_lavorazione", note: "Intervento programmato: sostituzione del corpo illuminante entro 72 ore.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(2) },
        ],
      },
      // Foto per fase (A1 §4): "prima" del cittadino, "durante" del Comune.
      photos: {
        create: [
          { phase: "prima", photoData: photoSvg("Prima — al buio", "#1f2937", "#374151"), caption: "L'incrocio la sera, senza illuminazione", authorName: "Marco G.", official: false, createdAt: daysAgo(9) },
          { phase: "durante", photoData: photoSvg("Durante — cantiere", "#0c9488", "#f5a623"), caption: "La squadra al lavoro sul corpo illuminante", authorName: "Comune di Pistoia", official: true, createdAt: daysAgo(1) },
        ],
      },
    },
  });

  await prisma.report.create({
    data: {
      authorId: lorenzo.id,
      authorName: lorenzo.publicName ?? lorenzo.name,
      authorInitials: "LC",
      authorColor: lorenzo.avatarColor,
      title: "Buca pericolosa in Via di Bigiano",
      description: "Grossa buca vicino alla scuola Marino Marini, rischiosa per bici e scooter.",
      category: "buche",
      status: "presa_in_carico",
      neighborhoodId: nb["centro"],
      location: "Via di Bigiano",
      assignedDepartment: "Ufficio Strade e Manutenzioni",
      baseConfirmations: 23,
      createdAt: daysAgo(6),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(6) },
          { status: "presa_in_carico", note: "Sopralluogo effettuato, intervento in programmazione.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(3) },
        ],
      },
    },
  });

  const repCestini = await prisma.report.create({
    data: {
      authorId: citizen.id,
      authorName: citizen.publicName ?? citizen.name,
      authorInitials: "GV",
      authorColor: citizen.avatarColor,
      title: "Cestini stracolmi in Piazza della Sala",
      description: "Nei weekend i cestini della piazza sono sempre pieni già al mattino.",
      category: "rifiuti",
      status: "risolta",
      neighborhoodId: nb["centro"],
      location: "Piazza della Sala",
      assignedDepartment: "Ufficio Igiene Urbana",
      baseConfirmations: 15,
      createdAt: daysAgo(14),
      resolvedAt: daysAgo(3),
      // Ciclo completo: risolta e confermata dal cittadino (A1 §5).
      resolutionFeedback: "confermata",
      resolutionFeedbackAt: daysAgo(2),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(14) },
          { status: "in_lavorazione", note: "Aumentata la frequenza di svuotamento nel weekend.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(8) },
          { status: "risolta", note: "Installati due cestini aggiuntivi. Grazie per la segnalazione.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(3) },
          { status: "risolta", note: "Risoluzione confermata dal cittadino. (Giulia V.)", official: false, authorName: "Giulia V.", createdAt: daysAgo(2) },
        ],
      },
      // Confronto completo prima/durante/dopo (A1 §4).
      photos: {
        create: [
          { phase: "prima", photoData: photoSvg("Prima — cestini pieni", "#9a3412", "#d63a57"), caption: "I cestini la domenica mattina", authorName: "Giulia V.", official: false, createdAt: daysAgo(14) },
          { phase: "durante", photoData: photoSvg("Durante — posa", "#0c9488", "#f5a623"), caption: "Posa dei nuovi cestini", authorName: "Comune di Pistoia", official: true, createdAt: daysAgo(5) },
          { phase: "dopo", photoData: photoSvg("Dopo — piazza pulita", "#2bbd77", "#10b3a3"), caption: "La piazza con i cestini aggiuntivi", authorName: "Comune di Pistoia", official: true, createdAt: daysAgo(3) },
        ],
      },
    },
  });

  const repParco = await prisma.report.create({
    data: {
      authorId: citizen.id,
      authorName: citizen.publicName ?? citizen.name,
      authorInitials: "GV",
      authorColor: citizen.avatarColor,
      title: "Giochi rotti al giardino di Via Pacini",
      description: "Lo scivolo e un'altalena sono rotti e transennati da settimane.",
      category: "parchi",
      status: "validata",
      neighborhoodId: nb["centro"],
      location: "Giardino di Via Pacini",
      baseConfirmations: vary(7, 3),
      createdAt: daysAgo(4),
      // Richiesta di urgenza in attesa del moderatore: visibile nel triage admin.
      urgency: "richiesta",
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(4) },
          { status: "validata", note: "Verificata, inserita nel piano di manutenzione dei giochi.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(1) },
        ],
      },
    },
  });

  await prisma.report.create({
    data: {
      authorName: "Anna R.",
      authorInitials: "AR",
      authorColor: "viola",
      title: "Marciapiede inaccessibile in carrozzina",
      description: "Il marciapiede di Via Bottegone non ha scivoli e costringe in mezzo alla strada.",
      category: "barriere",
      status: "ricevuta",
      neighborhoodId: nb["bottegone"],
      location: "Via Bottegone",
      baseConfirmations: 12,
      createdAt: daysAgo(2),
      updates: { create: [{ status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(2) }] },
    },
  });

  await prisma.report.create({
    data: {
      authorName: "Riccardo F.",
      authorInitials: "RF",
      authorColor: "amber",
      title: "Schiamazzi notturni nella zona della movida",
      description: "Rumore fino a tarda notte nei weekend in centro.",
      category: "rumore",
      status: "non_di_competenza",
      neighborhoodId: nb["centro"],
      baseConfirmations: 31,
      createdAt: daysAgo(11),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(11) },
          { status: "non_di_competenza", note: "Per i controlli notturni rivolgersi alla Polizia Municipale (numero unico). Segnalazione inoltrata per conoscenza.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(9) },
        ],
      },
    },
  });

  // Riaperta dal cittadino (A1 §5): il Comune aveva chiuso, il problema c'era ancora.
  await prisma.report.create({
    data: {
      authorId: lorenzo.id,
      authorName: lorenzo.publicName ?? lorenzo.name,
      authorInitials: "LC",
      authorColor: lorenzo.avatarColor,
      title: "Attraversamento pedonale sbiadito in Viale Adua",
      description: "Le strisce davanti alla fermata del bus sono quasi invisibili, di sera è pericoloso attraversare.",
      category: "sicurezza",
      status: "in_lavorazione",
      neighborhoodId: nb["sant-agostino"],
      location: "Viale Adua, fermata Pacinotti",
      assignedDepartment: "Ufficio Strade e Manutenzioni",
      baseConfirmations: vary(18, 4),
      createdAt: daysAgo(20),
      resolutionFeedback: "riaperta",
      resolutionFeedbackAt: daysAgo(4),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(20) },
          { status: "in_lavorazione", note: "Rifacimento segnaletica programmato.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(12) },
          { status: "risolta", note: "Segnaletica orizzontale rifatta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(6) },
          { status: "in_lavorazione", note: "Il cittadino segnala che il problema è ancora presente: pratica riaperta. (Lorenzo C.)", official: false, authorName: "Lorenzo C.", createdAt: daysAgo(4) },
          { status: "in_lavorazione", note: "Verificato: il tratto lato sud è stato saltato. Nuovo intervento entro la settimana.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(3) },
        ],
      },
    },
  });

  // Storico di risolte: alimenta i tempi medi per categoria (A1 §7).
  await prisma.report.create({
    data: {
      authorName: "Paola M.",
      authorInitials: "PM",
      authorColor: "green",
      title: "Lampione a intermittenza in Via Dalmazia",
      description: "Il lampione lampeggia tutta la notte da giorni.",
      category: "illuminazione",
      status: "risolta",
      neighborhoodId: nb["le-fornaci"] ?? nb["centro"],
      location: "Via Dalmazia",
      assignedDepartment: "Ufficio Strade e Manutenzioni",
      baseConfirmations: 6,
      createdAt: daysAgo(28),
      resolvedAt: daysAgo(22),
      resolutionFeedback: "confermata",
      resolutionFeedbackAt: daysAgo(21),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(28) },
          { status: "risolta", note: "Sostituito il reattore del lampione.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(22) },
        ],
      },
    },
  });
  await prisma.report.create({
    data: {
      authorName: "Franco B.",
      authorInitials: "FB",
      authorColor: "teal",
      title: "Rifiuti abbandonati ai cassonetti di Via Erbosa",
      description: "Ingombranti lasciati accanto ai cassonetti da una settimana.",
      category: "rifiuti",
      status: "risolta",
      neighborhoodId: nb["bottegone"],
      location: "Via Erbosa",
      assignedDepartment: "Ufficio Igiene Urbana",
      baseConfirmations: 4,
      createdAt: daysAgo(10),
      resolvedAt: daysAgo(8),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(10) },
          { status: "risolta", note: "Ritiro straordinario effettuato.", official: true, authorName: "Comune di Pistoia", createdAt: daysAgo(8) },
        ],
      },
    },
  });

  // Mock "vivo": una segnalazione fresca di oggi, scelta a rotazione dal
  // giorno — a ogni ri-seed la home racconta qualcosa di nuovo.
  const FRESH = [
    { title: "Ramo pericolante sul percorso pedonale dell'Ombrone", category: "verde", location: "Parco fluviale dell'Ombrone", neighborhood: "sant-agostino" },
    { title: "Cartello stradale divelto in Via Sestini", category: "sicurezza", location: "Via Sestini, altezza farmacia", neighborhood: "centro" },
    { title: "Giostrina scheggiata ai giardini di Bonelle", category: "parchi", location: "Giardini di Bonelle", neighborhood: "bonelle" },
  ] as const;
  const fresh = FRESH[dayHash % FRESH.length];
  await prisma.report.create({
    data: {
      authorId: citizen.id,
      authorName: citizen.publicName ?? citizen.name,
      authorInitials: "GV",
      authorColor: citizen.avatarColor,
      title: fresh.title,
      description: "Segnalazione rapida inviata dal telefono. Dettagli aggiuntivi non ancora forniti.",
      category: fresh.category,
      status: "ricevuta",
      neighborhoodId: nb[fresh.neighborhood] ?? nb["centro"],
      location: fresh.location,
      baseConfirmations: vary(1, 3),
      createdAt: hoursAgo(2 + (dayHash % 6)),
      updates: {
        create: [
          { status: "ricevuta", note: "Segnalazione ricevuta. In attesa di validazione.", official: true, authorName: "Comune di Pistoia", createdAt: hoursAgo(2 + (dayHash % 6)) },
        ],
      },
    },
  });

  // "Anche io" confirmations from verified citizens.
  await prisma.reportConfirmation.createMany({
    data: [
      { reportId: repLampione.id, userId: citizen.id },
      { reportId: repLampione.id, userId: lorenzo.id },
      { reportId: repLampione.id, userId: moderatore.id },
      { reportId: repParco.id, userId: lorenzo.id },
      { reportId: repParco.id, userId: marco.id },
    ],
  });

  // --- Proposte cittadine -------------------------------------------------
  const propRastrelliere = await prisma.proposal.create({
    data: {
      authorId: lorenzo.id,
      authorName: lorenzo.publicName ?? lorenzo.name,
      authorInitials: "LC",
      authorColor: lorenzo.avatarColor,
      title: "Più rastrelliere per le bici in centro",
      problem:
        "Chi si muove in bici in centro non sa dove legarla: le rastrelliere sono poche, scoperte e quasi sempre piene, così le bici finiscono legate a pali e ringhiere.",
      description:
        "Installare rastrelliere coperte vicino alle principali piazze del centro per incentivare gli spostamenti in bici e ridurre il parcheggio selvaggio dei mezzi.",
      affectedGroups: JSON.stringify(["residenti", "studenti", "pendolari"]),
      category: "Mobilità",
      neighborhoodId: nb["centro"],
      status: "in_valutazione",
      baseSupports: 124,
      // Valutazione sintetica compilata dal Comune (A1 §15 + A2 §10).
      estimatedImpact: "alto",
      estimatedCost: "medio",
      estimatedTime: "medio",
      feasibility: "fattibile",
      assessedAt: daysAgo(3),
      createdAt: daysAgo(12),
    },
  });

  await prisma.proposal.create({
    data: {
      authorId: citizen.id,
      authorName: citizen.publicName ?? citizen.name,
      authorInitials: "GV",
      authorColor: citizen.avatarColor,
      title: "Una fontanella in Piazza della Resistenza",
      problem:
        "D'estate la piazza è molto frequentata ma non c'è acqua potabile: chi resta a lungo deve comprare bottigliette o tornare a casa.",
      description: "Una fontanella di acqua potabile renderebbe la piazza più vivibile d'estate.",
      affectedGroups: JSON.stringify(["famiglie", "anziani", "turisti"]),
      category: "Verde",
      neighborhoodId: nb["centro"],
      status: "pubblicata",
      baseSupports: 62,
      createdAt: daysAgo(7),
    },
  });

  const propOrti = await prisma.proposal.create({
    data: {
      authorId: assoc.id,
      authorName: assoc.publicName ?? assoc.name,
      authorInitials: "AP",
      authorColor: assoc.avatarColor,
      title: "Orti urbani condivisi a Le Fornaci",
      description:
        "Assegnare un'area comunale inutilizzata a orti urbani gestiti dai residenti, con priorità ad anziani e famiglie.",
      affectedGroups: JSON.stringify(["residenti", "anziani", "famiglie"]),
      category: "Ambiente",
      neighborhoodId: nb["le-fornaci"],
      status: "risposta",
      baseSupports: 210,
      estimatedImpact: "medio",
      estimatedCost: "basso",
      estimatedTime: "lungo",
      feasibility: "da_valutare",
      assessedAt: daysAgo(5),
      officialReply:
        "Proposta accolta in valutazione: l'area di Via delle Fornaci è in fase di verifica urbanistica. Aggiorneremo entro l'autunno.",
      officialReplyAt: daysAgo(5),
      createdAt: daysAgo(40),
    },
  });

  await prisma.proposal.create({
    data: {
      authorId: marco.id,
      authorName: marco.publicName ?? marco.name,
      authorInitials: "MG",
      authorColor: marco.avatarColor,
      title: "Area pattinaggio per ragazzi a Bottegone",
      description: "Uno spazio attrezzato per skate e pattini darebbe ai ragazzi un luogo dove ritrovarsi.",
      category: "Sport",
      neighborhoodId: nb["bottegone"],
      status: "pubblicata",
      baseSupports: 38,
      createdAt: daysAgo(5),
    },
  });

  // Proposta respinta con "Perché non si può fare?" (A1 §13, O3): il rifiuto
  // diventa comunicazione trasparente, con motivi in linguaggio semplice.
  const propNavetta = await prisma.proposal.create({
    data: {
      authorId: lorenzo.id,
      authorName: lorenzo.publicName ?? lorenzo.name,
      authorInitials: "LC",
      authorColor: lorenzo.avatarColor,
      title: "Navetta gratuita serale per le frazioni",
      problem:
        "La sera le frazioni restano isolate: l'ultima corsa utile è alle 20 e chi non guida non può partecipare alla vita del centro.",
      description:
        "Una navetta circolare gratuita nei weekend, dalle 20 all'una, che colleghi Bottegone, Ramini e Pontenuovo con il centro storico.",
      affectedGroups: JSON.stringify(["giovani", "anziani", "residenti"]),
      category: "Mobilità",
      neighborhoodId: nb["bottegone"],
      status: "respinta",
      baseSupports: 154,
      estimatedImpact: "alto",
      estimatedCost: "alto",
      estimatedTime: "lungo",
      feasibility: "complessa",
      assessedAt: daysAgo(16),
      officialReply:
        "La proposta è stata valutata con attenzione insieme all'azienda del trasporto pubblico, ma non può essere attivata quest'anno. Qui sotto trovi i motivi, uno per uno. L'esigenza è reale: il tema entra nel tavolo del nuovo contratto di servizio TPL.",
      officialReplyAt: daysAgo(10),
      rejectionReasons: JSON.stringify([
        "Il costo stimato (circa 180.000 € l'anno) supera il budget disponibile per la mobilità di quest'anno.",
        "Il servizio notturno richiede una modifica del contratto con il gestore del trasporto pubblico, che si rinnova nel 2027.",
        "È già in valutazione un servizio a chiamata per le frazioni, alternativo alla linea fissa.",
      ]),
      createdAt: daysAgo(55),
    },
  });

  // Support from verified citizens.
  await prisma.proposalSupport.createMany({
    data: [
      { proposalId: propRastrelliere.id, userId: citizen.id },
      { proposalId: propRastrelliere.id, userId: moderatore.id },
      { proposalId: propOrti.id, userId: citizen.id },
      { proposalId: propOrti.id, userId: lorenzo.id },
    ],
  });

  // --- Generic follows for the demo citizen -------------------------------
  await prisma.follow.createMany({
    data: [
      { userId: citizen.id, targetType: "neighborhood", targetId: nb["centro"] },
      { userId: citizen.id, targetType: "report", targetId: repLampione.id },
      { userId: citizen.id, targetType: "proposal", targetId: propRastrelliere.id },
    ],
  });

  // --- Moderation / audit log (a few seeded entries) ----------------------
  await prisma.moderationAction.createMany({
    data: [
      { actorId: admin.id, action: "report_status", targetType: "report", targetId: repCestini.id, reason: "Risolta", createdAt: daysAgo(3) },
      { actorId: admin.id, action: "proposal_status", targetType: "proposal", targetId: propOrti.id, reason: "Risposta del Comune", createdAt: daysAgo(5) },
    ],
  });

  // --- Notifiche per il cittadino demo ------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: citizen.id,
        type: "report",
        title: "Aggiornamento sulla tua segnalazione",
        body: "«Cestini stracolmi in Piazza della Sala» → Risolta. Grazie per la segnalazione.",
        href: "/segnalazioni",
        read: false,
        createdAt: daysAgo(3),
      },
      {
        userId: citizen.id,
        type: "verification",
        title: "Profilo verificato",
        body: "La tua verifica «Residente verificato» è stata approvata.",
        href: "/profilo",
        read: true,
        createdAt: daysAgo(30),
      },
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

  // --- §18 Opere: geo, RUP, fonte, foto, FAQ, commenti --------------------
  await prisma.opera.update({
    where: { id: marini.id },
    data: {
      latitude: 43.929, longitude: 10.905, neighborhoodId: nb["centro"],
      fundingSource: "PNRR M4C1 — Istruzione", rup: "Ing. Paolo Bonechi",
      // "Cosa cambia per me?" (A1 §24 + A2 §30) e "Spiegamelo semplice" (A2 §11).
      impactNotes: JSON.stringify([
        "Le lezioni proseguono nella sede provvisoria di Via dello Stadio fino a fine lavori",
        "Via di Bigiano resta percorribile: restringimento solo davanti al cantiere",
        "I parcheggi della scuola sono occupati dal cantiere: disponibili quelli di Via dello Stadio",
        "Accesso pedonale al giardino pubblico adiacente sempre garantito",
      ]),
      simpleText:
        "Stiamo rendendo la scuola Marino Marini più sicura in caso di terremoto e meno costosa da riscaldare. I bambini intanto fanno lezione in un'altra sede, e quando torneranno troveranno anche una mensa nuova e nuovi laboratori.",
      photos: {
        create: [
          { phase: "prima", data: photoSvg("Prima", "#9ca3af", "#6b7280"), caption: "L'edificio prima dei lavori", order: 1 },
          { phase: "durante", data: photoSvg("Durante", "#0F9E8E", "#7C6BD9"), caption: "Cantiere in corso", order: 2 },
          { phase: "dopo", data: photoSvg("Render", "#2FA66B", "#0F9E8E"), caption: "Render del progetto finale", order: 3 },
        ],
      },
      faqs: {
        create: [
          { question: "La scuola resta aperta durante i lavori?", answer: "Le attività didattiche sono trasferite temporaneamente in una sede vicina fino al termine dei lavori.", order: 1 },
          { question: "Quando finiranno i lavori?", answer: "Il termine previsto è tra circa quattro mesi, salvo imprevisti legati alle forniture.", order: 2 },
        ],
      },
      comments: {
        create: [
          { authorId: citizen.id, authorName: "Giulia V.", authorInitials: "GV", authorColor: "viola", body: "Ottimo che si investa sulle scuole. Speriamo nei tempi!", createdAt: daysAgo(3) },
          { authorName: "Un genitore", authorInitials: "UG", authorColor: "amber", body: "La nuova mensa era attesissima.", createdAt: daysAgo(1) },
        ],
      },
    },
  });
  await prisma.opera.update({ where: { id: ciclabile.id }, data: {
    latitude: 43.927, longitude: 10.93, neighborhoodId: nb["sant-agostino"], fundingSource: "Bilancio comunale + Regione Toscana", rup: "Arch. Laura Niccoli",
    impactNotes: JSON.stringify([
      "Il percorso pedonale lungo l'argine resta aperto, con deviazioni segnalate nei tratti di lavoro",
      "Nessuna modifica al traffico: il cantiere non tocca strade carrabili",
      "L'area pesca dell'Ombrone è raggiungibile dall'accesso di Via dei Frati",
    ]),
    simpleText:
      "Stiamo costruendo 3,4 km di pista ciclabile lungo il fiume: alla fine si potrà andare in bici dal centro alla periferia est senza mai passare in mezzo alle auto.",
  } });
  await prisma.opera.update({ where: { id: piazza.id }, data: {
    latitude: 43.9352, longitude: 10.9201, neighborhoodId: nb["centro"], fundingSource: "Bilancio comunale", rup: "Ing. Marco Salvi",
    impactNotes: JSON.stringify([
      "La piazza è chiusa ai veicoli per tutta la durata dei lavori",
      "Negozi e bar della piazza restano aperti: passaggio pedonale sempre garantito",
      "Parcheggi alternativi: Piazza della Resistenza e parcheggio Cellini",
      "Il mercato del giovedì è spostato in Piazza San Francesco fino a fine lavori",
    ]),
    simpleText:
      "Rifacciamo la pavimentazione e l'illuminazione di Piazza San Lorenzo per restituirla ai pedoni: meno auto in sosta, più spazio per camminare e stare insieme.",
  } });
  await prisma.opera.update({ where: { id: campanile.id }, data: { latitude: 43.9333, longitude: 10.9189, neighborhoodId: nb["centro"], fundingSource: "Fondi ministeriali (Ministero della Cultura)", rup: "Arch. Giulia Pieri" } });
  await prisma.opera.update({ where: { id: pacini.id }, data: { latitude: 43.9262, longitude: 10.9148, neighborhoodId: nb["centro"], fundingSource: "Bilancio comunale", rup: "Geom. Anna Ferri" } });

  // --- §9/§10 Segnalazioni geolocalizzate ---------------------------------
  await prisma.report.update({ where: { id: repLampione.id }, data: { latitude: 43.929, longitude: 10.938 } });
  await prisma.report.update({ where: { id: repCestini.id }, data: { latitude: 43.9335, longitude: 10.9168 } });
  await prisma.report.update({ where: { id: repParco.id }, data: { latitude: 43.9262, longitude: 10.915 } });

  // --- §17 Eventi ----------------------------------------------------------
  await prisma.event.createMany({
    data: [
      { title: "Consiglio Comunale aperto", description: "Seduta pubblica del Consiglio Comunale: ordine del giorno e interventi dei cittadini.", category: "consiglio", startAt: daysAhead(3), location: "Palazzo Comunale", neighborhoodId: nb["centro"], latitude: 43.933, longitude: 10.9183, organizerId: admin.id, organizerName: "Comune di Pistoia", status: "published" },
      { title: "Mercato contadino a km0", description: "Prodotti locali e di stagione dei produttori del territorio.", category: "mercato", startAt: daysAhead(5), location: "Piazza della Sala", neighborhoodId: nb["centro"], latitude: 43.9335, longitude: 10.917, organizerId: admin.id, organizerName: "Comune di Pistoia", status: "published" },
      { title: "Giornata ecologica al Parco di Monteoliveto", description: "Puliamo insieme il parco: guanti e sacchi forniti dall'associazione.", category: "ecologica", startAt: daysAhead(8), location: "Parco di Monteoliveto", neighborhoodId: nb["le-fornaci"], latitude: 43.9258, longitude: 10.9223, organizerId: assoc.id, organizerName: "Amici del Parco", status: "published" },
      { title: "Concerto della banda cittadina", description: "Concerto di primavera aperto a tutta la cittadinanza.", category: "teatro", startAt: daysAhead(12), location: "Teatro Manzoni", neighborhoodId: nb["centro"], latitude: 43.9341, longitude: 10.9166, organizerId: admin.id, organizerName: "Comune di Pistoia", status: "published" },
      { title: "Festa di quartiere a Bottegone", description: "Musica, stand gastronomici e giochi per bambini, organizzati dai volontari.", category: "associazione", startAt: daysAhead(15), location: "Bottegone", neighborhoodId: nb["bottegone"], organizerId: assoc.id, organizerName: "Amici del Parco", status: "proposed" },
    ],
  });

  // --- §14 Moderazione: parole bloccate + un commento segnalato ------------
  await prisma.blockedWord.createMany({
    data: [
      { word: "idiota", createdById: admin.id },
      { word: "imbecille", createdById: admin.id },
    ],
  });
  const flaggable = await prisma.postComment.create({
    data: { postId: postPacini.id, authorId: marco.id, authorName: "Marco G.", body: "Ma basta lamentarsi, tanto non cambia mai niente.", createdAt: hoursAgo(3) },
  });
  await prisma.commentReport.create({
    data: { commentId: flaggable.id, reporterId: citizen.id, reason: "Tono ostile / fuori tema" },
  });

  // --- §21 Follow del cittadino demo su opera ed evento -------------------
  await prisma.follow.create({ data: { userId: citizen.id, targetType: "opera", targetId: marini.id } });

  // --- Ondata 3 — Trasparenza che chiude il cerchio ------------------------

  // Archivio decisioni (A1 §12): cosa è successo DOPO la partecipazione.
  await prisma.decision.createMany({
    data: [
      {
        title: "Più rastrelliere per le bici in centro",
        kind: "proposta",
        outcome: "approvata_parzialmente",
        summary: "Saranno installate 12 nuove rastrelliere coperte in 4 piazze del centro, anziché le 20 proposte.",
        reason: "La proposta è valida ma due delle piazze indicate sono sotto tutela della Soprintendenza: lì servono autorizzazioni con tempi più lunghi. Si parte dove si può subito.",
        simpleText: "In breve: le rastrelliere si fanno, ma in 4 piazze invece di 6. Nelle altre due servono permessi speciali perché sono zone storiche protette.",
        department: "Assessorato alla Mobilità",
        linkedType: "proposal",
        linkedId: propRastrelliere.id,
        decidedAt: daysAgo(2),
      },
      {
        title: "Navetta gratuita serale per le frazioni",
        kind: "proposta",
        outcome: "respinta",
        summary: "La navetta serale non sarà attivata quest'anno; l'esigenza entra nel tavolo del nuovo contratto del trasporto pubblico.",
        reason: "Il costo annuo stimato supera il budget mobilità disponibile e il servizio richiede una modifica del contratto TPL, rinnovabile solo nel 2027. In valutazione un servizio a chiamata come alternativa.",
        department: "Assessorato alla Mobilità",
        linkedType: "proposal",
        linkedId: propNavetta.id,
        decidedAt: daysAgo(10),
      },
      {
        title: "Piano mobilità del centro storico",
        kind: "consultazione",
        outcome: "approvata",
        summary: "Accolto l'orientamento emerso dalla consultazione: priorità alle aree pedonali, con due nuovi parcheggi di scambio ai margini del centro.",
        reason: "Il 46% dei partecipanti ha indicato le aree pedonali come prima scelta. Il piano adottato le estende gradualmente, compensando con parcheggi di scambio e navette.",
        simpleText: "In breve: avete votato per un centro più pedonale, e il piano va in quella direzione. Chi arriva in auto troverà due nuovi parcheggi appena fuori, collegati con navette.",
        department: "Giunta comunale",
        linkedType: "poll",
        decidedAt: daysAgo(6),
      },
      {
        title: "Attraversamenti rialzati davanti alle scuole",
        kind: "segnalazione",
        outcome: "approvata",
        summary: "Dopo le segnalazioni ripetute sulla sicurezza davanti ai plessi scolastici, approvato un piano per 8 attraversamenti rialzati.",
        reason: "Le segnalazioni dei cittadini hanno mostrato un problema diffuso, non episodico: la risposta è un piano organico invece di interventi spot.",
        department: "Ufficio Strade e Manutenzioni",
        linkedType: "report",
        decidedAt: daysAgo(20),
      },
      {
        title: "Orario estivo delle ZTL",
        kind: "ordinanza",
        outcome: "rinviata",
        summary: "L'estensione serale della ZTL estiva è rinviata a dopo l'estate, in attesa dei dati dei nuovi varchi.",
        reason: "I varchi elettronici installati a maggio forniranno dati reali sui flussi: decidere prima significherebbe decidere alla cieca.",
        department: "Polizia Municipale",
        decidedAt: daysAgo(13),
      },
    ],
  });

  // Promesse e risultati (A1 §30): il tracker pubblico degli impegni.
  await prisma.commitment.createMany({
    data: [
      {
        title: "Completare la ciclabile dell'Ombrone",
        description: "3,4 km di pista ciclabile dal centro alla periferia est lungo l'argine del fiume.",
        status: "in_corso",
        statusNote: "Avanzamento al 45%: completato il primo tratto e la passerella.",
        category: "mobilita",
        sourceLabel: "Programma di mandato",
        linkedType: "opera",
        linkedId: ciclabile.id,
        promisedAt: daysAgo(300),
        dueLabel: "entro la primavera 2027",
      },
      {
        title: "Riaprire il giardino di Via Pacini",
        description: "Nuovi giochi inclusivi, area cani e irrigazione per il giardino di quartiere.",
        status: "in_corso",
        statusNote: "Lavori al 90%: riapertura prevista il 15 marzo.",
        category: "verde",
        sourceLabel: "Segnalazioni dei cittadini",
        linkedType: "opera",
        linkedId: pacini.id,
        promisedAt: daysAgo(180),
        dueLabel: "entro marzo 2026",
      },
      {
        title: "Installare le prime rastrelliere coperte in centro",
        description: "Le 12 rastrelliere approvate dopo la proposta cittadina, nelle 4 piazze autorizzate.",
        status: "promesso",
        statusNote: "Gara di fornitura in preparazione.",
        category: "mobilita",
        sourceLabel: "Proposta cittadina",
        linkedType: "proposal",
        linkedId: propRastrelliere.id,
        promisedAt: daysAgo(2),
        dueLabel: "entro l'autunno 2026",
      },
      {
        title: "Sostituire tutti i punti luce con LED",
        description: "6.400 lampioni a LED per consumare meno e illuminare meglio.",
        status: "completato",
        statusNote: "Intervento concluso: −38% di consumi rispetto al 2024.",
        category: "servizi",
        sourceLabel: "Programma di mandato",
        promisedAt: daysAgo(420),
      },
      {
        title: "Estendere l'orario della biblioteca San Giorgio",
        description: "Apertura serale fino alle 23 nei mesi invernali per studenti e lavoratori.",
        status: "rimandato",
        statusNote: "Rimandato all'autunno: la copertura del personale serale non è ancora finanziata.",
        category: "cultura",
        sourceLabel: "Question time con i cittadini",
        promisedAt: daysAgo(150),
        dueLabel: "riprogrammato per ottobre 2026",
      },
      {
        title: "Wi-Fi pubblico in tutte le frazioni",
        description: "Copertura Wi-Fi gratuita nelle piazze principali delle frazioni.",
        status: "non_fattibile",
        statusNote: "I costi di collegamento delle zone collinari superano di 4 volte il preventivo: si valuta una soluzione satellitare nel 2027.",
        category: "servizi",
        sourceLabel: "Proposta cittadina",
        promisedAt: daysAgo(240),
      },
    ],
  });

  // Bacheca avvisi urgenti (A1 §21 + A1 §24): con "cosa cambia per me".
  await prisma.notice.createMany({
    data: [
      {
        title: "Interruzione idrica notturna in zona Sant'Agostino",
        body: "Per un intervento urgente sulla rete, l'acqua sarà sospesa dalle 23 alle 5 nella notte tra giovedì e venerdì nelle vie comprese tra Viale Adua e Via Ciliegiole.",
        kind: "interruzione",
        severity: "critico",
        active: true,
        location: "Zona Sant'Agostino",
        latitude: 43.9285,
        longitude: 10.9365,
        whatChanges: JSON.stringify([
          "Niente acqua dal rubinetto dalle 23 alle 5",
          "Riempire qualche bottiglia prima delle 23 per le necessità notturne",
          "Al ripristino l'acqua può uscire torbida per qualche minuto: lasciarla scorrere",
          "Numero verde del gestore attivo tutta la notte: 800 887 755",
        ]),
        startsAt: hoursAgo(6),
        endsAt: daysAhead(2),
      },
      {
        title: "Allerta meteo arancione: temporali forti",
        body: "La Regione Toscana ha emesso un'allerta arancione per temporali forti dalle 14 di domani alle 8 del giorno successivo. Possibili allagamenti localizzati e raffiche di vento.",
        kind: "meteo",
        severity: "attenzione",
        active: true,
        location: "Tutto il territorio comunale",
        whatChanges: JSON.stringify([
          "Evitare i sottopassi in caso di pioggia intensa",
          "Parchi e giardini pubblici chiusi dalle 14 di domani",
          "Mercato all'aperto di venerdì annullato",
          "Aggiornamenti sul canale ufficiale del Comune",
        ]),
        startsAt: hoursAgo(3),
        endsAt: daysAhead(2),
      },
      {
        title: "Sciopero del trasporto pubblico locale venerdì",
        body: "Sciopero nazionale di 24 ore del personale del trasporto pubblico. Le corse sono garantite nelle fasce 6:00–9:00 e 12:00–15:00.",
        kind: "sciopero",
        severity: "info",
        active: true,
        location: "Rete urbana ed extraurbana",
        whatChanges: JSON.stringify([
          "Bus garantiti solo dalle 6 alle 9 e dalle 12 alle 15",
          "Lo scuolabus del mattino è regolare, il ritorno è anticipato alle 13",
          "Possibili disagi anche sui collegamenti per Firenze",
        ]),
        startsAt: hoursAgo(20),
        endsAt: daysAhead(3),
      },
      {
        title: "Via della Madonna chiusa per lavori sulla rete del gas",
        body: "Chiusura completata: la strada è stata riaperta al traffico in anticipo rispetto al previsto.",
        kind: "traffico",
        severity: "info",
        active: false,
        location: "Via della Madonna",
        latitude: 43.9338,
        longitude: 10.9155,
        whatChanges: JSON.stringify([
          "Strada riaperta al traffico in entrambe le direzioni",
          "Ripristinate le fermate del bus «Madonna 1» e «Madonna 2»",
        ]),
        startsAt: daysAgo(9),
        endsAt: daysAgo(2),
      },
    ],
  });

  // FAQ della città (A1 §11): risposte ufficiali alle domande ricorrenti.
  await prisma.cityFaq.createMany({
    data: [
      { question: "Come ottengo il permesso ZTL per i residenti?", answer: "Il permesso si richiede online sul portale del Comune o allo sportello della Polizia Municipale, con carta di circolazione e documento. Per i residenti il primo permesso è gratuito e vale 3 anni.", category: "mobilita", order: 1 },
      { question: "La ZTL è attiva anche la domenica?", answer: "Sì: la ZTL del centro storico è attiva tutti i giorni dalle 7:30 alle 19:30. Nei giorni festivi i varchi restano accesi; gli orari estesi estivi vengono comunicati con ordinanza dedicata.", category: "mobilita", order: 2 },
      { question: "Dove porto gli ingombranti?", answer: "Gli ingombranti si portano gratuitamente alla stazione ecologica di Via dell'Annona (lun–sab 8–18). In alternativa si può prenotare il ritiro a domicilio gratuito chiamando il gestore o tramite l'app dedicata.", category: "rifiuti", order: 3 },
      { question: "Come pago la TARI a rate?", answer: "La TARI si paga in 3 rate (aprile, luglio, ottobre) o in unica soluzione ad aprile. I bollettini arrivano a casa e su PagoPA; per la domiciliazione bancaria basta presentare il modulo una sola volta.", category: "tributi", order: 4 },
      { question: "Quando aprono le iscrizioni ai nidi comunali?", answer: "Il bando per i nidi comunali apre ogni anno a maggio e resta aperto un mese. La graduatoria esce a luglio; le iscrizioni fuori termine entrano in lista d'attesa.", category: "scuole", order: 5 },
      { question: "Come prenoto un appuntamento all'anagrafe?", answer: "Gli appuntamenti si prenotano online sul portale del Comune o telefonando allo 0573 3711. Per carta d'identità elettronica servono foto recente e vecchio documento; il rinnovo si può chiedere da 6 mesi prima della scadenza.", category: "servizi", order: 6 },
      { question: "Posso occupare il suolo pubblico per un trasloco?", answer: "Sì: serve l'autorizzazione temporanea, da richiedere almeno 5 giorni prima allo sportello SUAP o online. Per un trasloco di un giorno il costo è fisso e include la segnaletica di divieto di sosta.", category: "casa", order: 7 },
      { question: "A chi segnalo una buca o un lampione spento?", answer: "Dalla sezione Segnalazioni di questa piattaforma: la segnalazione arriva all'ufficio competente e puoi seguirne lo stato passo passo, fino alla conferma di risoluzione.", category: "servizi", order: 8 },
    ],
  });

  // Avviso critico → notifica al cittadino demo (il canale «urgente» esiste già).
  await prisma.notification.create({
    data: {
      userId: citizen.id,
      type: "system",
      title: "Avviso urgente: interruzione idrica",
      body: "Sospensione notturna dell'acqua in zona Sant'Agostino: leggi cosa cambia per te.",
      href: "/avvisi",
      read: false,
      createdAt: hoursAgo(6),
    },
  });

  console.log("✅ Seed completato.");
  console.log("   Cittadino (residente verif.): cittadino@pistoia.it / Pistoia2026");
  console.log("   Admin / Comune:               comune@pistoia.it / Comune2026!");
  console.log("   Cittadino verif. (Lorenzo):   lorenzo@pistoia.it / Pistoia2026");
  console.log("   Cittadino NON verificato:     marco@pistoia.it / Pistoia2026");
  console.log("   Moderatore civico:            moderatore@pistoia.it / Pistoia2026");
  console.log("   Associazione verificata:      associazione@pistoia.it / Pistoia2026");
  console.log("   Attività verificata:          attivita@pistoia.it / Pistoia2026");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Seed fallito:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
