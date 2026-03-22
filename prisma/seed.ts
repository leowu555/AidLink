import { PrismaClient } from "@prisma/client";
import { generateCheckInCode } from "../lib/utils";

const prisma = new PrismaClient();

function hoursAgo(hours: number): Date {
  const d = new Date();
  d.setTime(d.getTime() - hours * 60 * 60 * 1000);
  return d;
}

const SKILLS = [
  "medical",
  "search",
  "transport",
  "logistics",
  "translation",
  "shelter",
  "food_distribution",
  "general_support",
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.checkInLog.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.incidentNote.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.organizerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create organizer user
  const organizerUser = await prisma.user.create({
    data: {
      email: "organizer@aidlink.demo",
      name: "Command Center Admin",
      role: "organizer",
    },
  });

  await prisma.organizerProfile.create({
    data: {
      userId: organizerUser.id,
      name: "Command Center Admin",
      orgId: "demo-org-1",
    },
  });

  // Create volunteers with profiles
  const volunteerNames = [
    "Sarah Chen", "Marcus Johnson", "Elena Rodriguez", "James Kim",
    "Priya Patel", "Omar Hassan", "Yuki Tanaka", "David Martinez",
    "Fatima Al-Rashid", "Alex Thompson", "Maria Santos", "Hassan Ali",
    "Lisa Wang", "Carlos Mendez", "Aisha Okafor", "Ryan O'Brien",
    "Nadia Kowalski", "Thomas Berg", "Sofia Ivanova", "Daniel Lee",
    "Zara Mohammed", "Kevin Nguyen", "Amira Hassan", "Chris Williams",
  ];

  const volunteers = [];
  for (let i = 0; i < volunteerNames.length; i++) {
    const [firstName, lastName] = volunteerNames[i].split(" ");
    const user = await prisma.user.create({
      data: {
        email: `volunteer${i + 1}@aidlink.demo`,
        name: volunteerNames[i],
        role: "volunteer",
      },
    });

    const skillCount = 1 + Math.floor(Math.random() * 3);
    const skills = [...SKILLS]
      .sort(() => Math.random() - 0.5)
      .slice(0, skillCount);

    const profile = await prisma.volunteerProfile.create({
      data: {
        userId: user.id,
        fullName: volunteerNames[i],
        email: user.email,
        phone: `+1-555-${String(100 + i).padStart(3, "0")}-${String(1000 + i).padStart(4, "0")}`,
        skills: JSON.stringify(skills),
        hasVehicle: Math.random() > 0.5,
        availableNow: i < 15,
        travelRadius: 20 + Math.floor(Math.random() * 80),
        lastKnownLat: 31.35 + (Math.random() - 0.5) * 0.25,
        lastKnownLng: 34.4 + (Math.random() - 0.5) * 0.2,
        lastKnownArea: ["North Gaza", "Gaza City", "Khan Yunis", "Rafah"][i % 4],
        status: i < 5 ? "AVAILABLE" : i < 10 ? "INTERESTED" : i < 15 ? "ASSIGNED" : i < 18 ? "CHECKED_IN" : "AVAILABLE",
      },
    });
    volunteers.push(profile);
  }

  // Demo incidents: Gaza Strip coordinates; `reportedHoursAgo` drives map urgency tiers.
  const incidentData = [
    {
      title: "Structural damage — residential cluster (North)",
      locationName: "Jabalia area, North Gaza",
      lat: 31.555,
      lng: 34.52,
      severity: 9,
      urgency: "CRITICAL",
      type: "rescue",
      helpTypes: '["medical","search","rescue"]',
      needed: 10,
      verification: "VERIFIED",
      operational: "ACTIVE",
      source: "Field coordinator",
      desc: "Multiple structures compromised. Civil defense requesting additional search teams and medics.",
      safetyNote: "Unstable rubble. Coordinate with incident command before entry.",
      injuries: 14,
      reportedHoursAgo: 4,
    },
    {
      title: "Medical stabilization point",
      locationName: "North Gaza — ad hoc clinic",
      lat: 31.538,
      lng: 34.505,
      severity: 7,
      urgency: "HIGH",
      type: "medical",
      helpTypes: '["medical","general_support"]',
      needed: 6,
      verification: "PARTIALLY_VERIFIED",
      operational: "ACTIVE",
      source: "NGO relay",
      desc: "Overflow of wounded; need triage volunteers and supplies within 12h window.",
      safetyNote: "Route verification required.",
      injuries: 22,
      reportedHoursAgo: 36,
    },
    {
      title: "Water distribution — Gaza City",
      locationName: "Gaza City — distribution hub",
      lat: 31.485,
      lng: 34.47,
      severity: 6,
      urgency: "HIGH",
      type: "food",
      helpTypes: '["food_distribution","logistics","general_support"]',
      needed: 8,
      verification: "VERIFIED",
      operational: "ACTIVE",
      source: "Relief network",
      desc: "Bottled water and hygiene kits; drivers and loaders needed.",
      safetyNote: "Stay on approved corridors.",
      injuries: 3,
      reportedHoursAgo: 9,
    },
    {
      title: "Shelter capacity — schools",
      locationName: "Gaza City — shelter sites",
      lat: 31.498,
      lng: 34.455,
      severity: 5,
      urgency: "MEDIUM",
      type: "shelter",
      helpTypes: '["shelter","logistics","general_support"]',
      needed: 14,
      verification: "VERIFIED",
      operational: "ACTIVE",
      source: "UN cluster (demo)",
      desc: "Registration, bedding, and child-safe spaces; sustained support phase.",
      safetyNote: "Indoor sites; follow site manager instructions.",
      injuries: 1,
      reportedHoursAgo: 96,
    },
    {
      title: "Road debris clearance — central corridor",
      locationName: "Deir al-Balah vicinity",
      lat: 31.408,
      lng: 34.395,
      severity: 5,
      urgency: "MEDIUM",
      type: "transport",
      helpTypes: '["logistics","general_support"]',
      needed: 5,
      verification: "PARTIALLY_VERIFIED",
      operational: "ACTIVE",
      source: "Municipal (demo)",
      desc: "Clearance for aid trucks; equipment operators requested.",
      safetyNote: "Do not proceed past cordon without clearance.",
      injuries: 0,
      reportedHoursAgo: 52,
    },
    {
      title: "Field hospital reinforcement",
      locationName: "Khan Yunis — field hospital",
      lat: 31.33,
      lng: 34.35,
      severity: 8,
      urgency: "CRITICAL",
      type: "medical",
      helpTypes: '["medical","search","general_support"]',
      needed: 12,
      verification: "VERIFIED",
      operational: "ASSIGNED",
      source: "Medical NGO",
      desc: "OR capacity stretched; surgeons and anesthesia support urgently needed.",
      safetyNote: "Triage priority protocol in effect.",
      injuries: 31,
      reportedHoursAgo: 11,
    },
    {
      title: "Temporary housing — Khan Yunis",
      locationName: "Khan Yunis — encampment support",
      lat: 31.318,
      lng: 34.365,
      severity: 4,
      urgency: "MEDIUM",
      type: "shelter",
      helpTypes: '["shelter","food_distribution","general_support"]',
      needed: 9,
      verification: "PARTIALLY_VERIFIED",
      operational: "NEW",
      source: "Community report",
      desc: "Tents and shade; food prep volunteers for evening meal cycle.",
      safetyNote: "Verify site safety with organizers.",
      injuries: 2,
      reportedHoursAgo: 30,
    },
    {
      title: "Rubble assessment — southern district",
      locationName: "Rafah — assessment zone",
      lat: 31.255,
      lng: 34.295,
      severity: 7,
      urgency: "HIGH",
      type: "rescue",
      helpTypes: '["search","rescue","medical"]',
      needed: 7,
      verification: "UNVERIFIED",
      operational: "NEW",
      source: "Social signal (demo)",
      desc: "Possible void spaces; engineer-led assessment requested before wide volunteer deployment.",
      safetyNote: "UNVERIFIED — no unsupervised entry.",
      injuries: 0,
      reportedHoursAgo: 18,
    },
    {
      title: "Post-response sanitation — south",
      locationName: "Rafah — sanitation sweep",
      lat: 31.242,
      lng: 34.315,
      severity: 3,
      urgency: "LOW",
      type: "food",
      helpTypes: '["general_support","logistics"]',
      needed: 6,
      verification: "VERIFIED",
      operational: "ACTIVE",
      source: "Civil affairs (demo)",
      desc: "Waste collection and wash-point maintenance; longer-horizon recovery tasking.",
      safetyNote: "PPE provided on site.",
      injuries: 0,
      reportedHoursAgo: 120,
    },
    {
      title: "Duplicate — same as North structural report",
      locationName: "Jabalia area (duplicate)",
      lat: 31.556,
      lng: 34.521,
      severity: 9,
      urgency: "CRITICAL",
      type: "rescue",
      helpTypes: '["rescue"]',
      needed: 10,
      verification: "DUPLICATE",
      operational: "RESOLVED",
      source: "Twitter",
      desc: "Duplicate of primary North Gaza structural report.",
      safetyNote: "Merged with primary incident.",
      injuries: 0,
      reportedHoursAgo: 5,
    },
    {
      title: "False report — cleared",
      locationName: "Gaza Strip (invalid coords note)",
      lat: 31.4,
      lng: 34.38,
      severity: 1,
      urgency: "LOW",
      type: "shelter",
      helpTypes: '["general_support"]',
      needed: 1,
      verification: "FALSE_REPORT",
      operational: "RESOLVED",
      source: "Unverified",
      desc: "Investigated; no corroborating evidence.",
      safetyNote: "Marked false.",
      injuries: 0,
      reportedHoursAgo: 200,
    },
  ];

  const incidents = [];
  for (const inc of incidentData) {
    const incident = await prisma.incident.create({
      data: {
        title: inc.title,
        description: inc.desc,
        locationName: inc.locationName,
        lat: inc.lat,
        lng: inc.lng,
        sourcePlatform: inc.source,
        sourceText: inc.desc,
        reportedAt: hoursAgo(inc.reportedHoursAgo),
        severityScore: inc.severity,
        urgencyLevel: inc.urgency as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        verificationStatus: inc.verification as any,
        operationalStatus: inc.operational as any,
        incidentType: inc.type,
        helpTypesNeeded: inc.helpTypes,
        volunteersNeeded: inc.needed,
        injuriesReported: inc.injuries,
        safetyNote: inc.safetyNote,
        checkInCode: ["VERIFIED", "PARTIALLY_VERIFIED", "ACTIVE"].includes(
          inc.verification
        )
          ? generateCheckInCode()
          : null,
      },
    });
    incidents.push(incident);
  }

  // Create assignments linking volunteers to incidents
  const statusFlow = ["INTERESTED", "ASSIGNED", "CONFIRMED", "CHECKED_IN"] as const;
  let volunteerIdx = 0;

  for (let i = 0; i < 5; i++) {
    const incident = incidents[i];
    const numAssignments = 2 + Math.floor(Math.random() * 4);
    for (let j = 0; j < numAssignments && volunteerIdx < volunteers.length; j++) {
      const vol = volunteers[volunteerIdx++];
      const statusIdx = Math.min(j, statusFlow.length - 1);
      const status = statusFlow[statusIdx];
      await prisma.assignment.create({
        data: {
          incidentId: incident.id,
          volunteerId: vol.id,
          status,
          role: "general_support",
          assignedAt: new Date(),
          confirmedAt: ["CONFIRMED", "CHECKED_IN"].includes(status) ? new Date() : null,
          checkedInAt: status === "CHECKED_IN" ? new Date() : null,
        },
      });
    }
  }

  // Create incident reports (incoming/social)
  const reportTexts = [
    { text: "North Gaza: multiple homes damaged, families need extraction now", platform: "twitter", conf: 0.62 },
    { text: "Field clinic overwhelmed — medics and supplies needed ASAP", platform: "twitter", conf: 0.78 },
    { text: "Gaza City distribution: long lines for water, need volunteers", platform: "twitter", conf: 0.55 },
    { text: "Deir al-Balah corridor: debris blocking aid trucks", platform: "twitter", conf: 0.48 },
    { text: "Khan Yunis hospital: OR capacity critical, surgeons requested", platform: "twitter", conf: 0.88 },
    { text: "Unverified: evacuation rumor — treat as noise until confirmed", platform: "twitter", conf: 0.32 },
    { text: "Shelter registration backlog — Arabic speakers needed", platform: "twitter", conf: 0.82 },
    { text: "Duplicate signal — same as earlier North Gaza structural post", platform: "twitter", conf: 0.94 },
    { text: "South: sanitation sweep scheduled; PPE on site", platform: "community", conf: 0.58 },
    { text: "Rafah assessment: engineer team requested before wide volunteer push", platform: "twitter", conf: 0.71 },
  ];

  for (let i = 0; i < reportTexts.length; i++) {
    const r = reportTexts[i];
    await prisma.incidentReport.create({
      data: {
        rawText: r.text,
        platform: r.platform,
        confidence: r.conf,
        extractedLat: incidents[i % incidents.length]?.lat,
        extractedLng: incidents[i % incidents.length]?.lng,
        extractedLocation: incidents[i % incidents.length]?.locationName,
        incidentId: i < 8 ? incidents[i % 6].id : null,
        timestamp: new Date(Date.now() - i * 3600000),
        isDuplicate: i === 7,
      },
    });
  }

  // Create some incident notes
  for (let i = 0; i < 4; i++) {
    await prisma.incidentNote.create({
      data: {
        incidentId: incidents[i].id,
        content: ["Verified by fire department on scene.", "Awaiting structural assessment.", "Red Cross coordinating.", "Logistics team en route."][i],
        isInternal: true,
        authorId: organizerUser.id,
      },
    });
  }

  console.log(`✅ Created ${volunteers.length} volunteers, ${incidents.length} incidents`);
  console.log("🌱 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
