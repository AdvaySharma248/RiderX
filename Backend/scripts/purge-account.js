const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../models/user.model");
const Captain = require("../models/captain.model");
const Ride = require("../models/ride.model");
const SupportTicket = require("../models/supportTicket.model");
const SosAlert = require("../models/sosAlert.model");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const maskMongoUri = (uri) => String(uri || "").replace(/\/\/([^@]+)@/g, "//<redacted>@");

const parseArgs = (argv) => {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item) continue;

    if (item === "--help" || item === "-h") {
      args.help = true;
      continue;
    }

    if (!item.startsWith("--")) {
      args._.push(item);
      continue;
    }

    const key = item.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
      continue;
    }

    args[key] = true;
  }
  return args;
};

const usage = () => {
  // Keep output minimal and actionable.
  console.log("Usage:");
  console.log("  node scripts/purge-account.js --email <email> [--type user|captain|both] [--cascade] [--env production|development] [--allow-production] [--apply]");
  console.log("");
  console.log("Notes:");
  console.log("  - Dry-run by default; pass --apply to actually delete.");
  console.log("  - If ENVIRONMENT=production, you must pass --allow-production.");
  console.log("  - --cascade also deletes rides/support/sos docs referencing the account.");
};

const normalizeType = (value) => {
  const type = String(value || "both").trim().toLowerCase();
  if (type === "rider") return "user";
  if (type === "driver") return "captain";
  if (type === "user" || type === "captain" || type === "both") return type;
  return null;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const email = String(args.email || args._[0] || "").trim();
  const type = normalizeType(args.type);
  const cascade = Boolean(args.cascade);
  const apply = Boolean(args.apply);
  const targetEnv = String(args.env || process.env.ENVIRONMENT || "development").trim().toLowerCase();

  if (!email) {
    usage();
    process.exitCode = 1;
    return;
  }

  if (!type) {
    console.error("Invalid --type. Expected user, captain, or both.");
    process.exitCode = 1;
    return;
  }

  if (targetEnv === "production" && !args["allow-production"]) {
    console.error("Refusing to run against production without --allow-production.");
    process.exitCode = 1;
    return;
  }

  const uri =
    String(args.uri || "").trim() ||
    (targetEnv === "production"
      ? String(process.env.MONGODB_PROD_URL || "").trim()
      : String(process.env.MONGODB_DEV_URL || "").trim());

  if (!uri) {
    console.error("MongoDB URI is not configured.");
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(uri);

  const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");
  const dryRun = !apply;

  console.log(`Connected (${targetEnv}) -> ${maskMongoUri(uri)}`);
  console.log(`Target email: ${email}`);
  console.log(`Mode: ${dryRun ? "dry-run" : "apply"}${cascade ? " + cascade" : ""}`);

  if (type === "user" || type === "both") {
    const users = await User.find({ email: emailRegex }).select("_id email");
    console.log(`Users found: ${users.length}`);

    if (!dryRun && users.length > 0) {
      const userIds = users.map((u) => u._id);
      if (cascade) {
        const rideRes = await Ride.deleteMany({ user: { $in: userIds } });
        const supportRes = await SupportTicket.deleteMany({ user: { $in: userIds } });
        const sosRes = await SosAlert.deleteMany({ user: { $in: userIds } });
        console.log(`Deleted rides (user): ${rideRes.deletedCount || 0}`);
        console.log(`Deleted support tickets (user): ${supportRes.deletedCount || 0}`);
        console.log(`Deleted sos alerts (user): ${sosRes.deletedCount || 0}`);
      }

      const delRes = await User.deleteMany({ _id: { $in: userIds } });
      console.log(`Deleted users: ${delRes.deletedCount || 0}`);
    }
  }

  if (type === "captain" || type === "both") {
    const captains = await Captain.find({ email: emailRegex }).select("_id email");
    console.log(`Captains found: ${captains.length}`);

    if (!dryRun && captains.length > 0) {
      const captainIds = captains.map((c) => c._id);
      if (cascade) {
        const rideRes = await Ride.deleteMany({ captain: { $in: captainIds } });
        const supportRes = await SupportTicket.deleteMany({ captain: { $in: captainIds } });
        const sosRes = await SosAlert.deleteMany({ captain: { $in: captainIds } });
        console.log(`Deleted rides (captain): ${rideRes.deletedCount || 0}`);
        console.log(`Deleted support tickets (captain): ${supportRes.deletedCount || 0}`);
        console.log(`Deleted sos alerts (captain): ${sosRes.deletedCount || 0}`);
      }

      const delRes = await Captain.deleteMany({ _id: { $in: captainIds } });
      console.log(`Deleted captains: ${delRes.deletedCount || 0}`);
    }
  }

  if (dryRun) {
    console.log("Dry-run complete. Re-run with --apply to delete.");
  }
};

main()
  .catch((error) => {
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });

