import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import Task from "./models/task.model.js";
import User from "./models/user.model.js";

const seedPassword = "SeedPassword123!";
const replaceSeedData = process.argv.includes("--replace");

const seedUsers = [
  {
    email: "seed.user01@example.test",
    tasks: [
      ["Plan the week", "Choose three priorities and block focused time for each one."],
      ["Water the houseplants", "Check the soil and water the plants that feel dry."],
      ["Sort the mail", "Recycle envelopes and file the bills that need attention."],
    ],
  },
  {
    email: "seed.user02@example.test",
    tasks: [
      ["Prepare a grocery list", "Check the pantry and write down ingredients for five dinners."],
      ["Schedule an annual checkup", "Compare available dates and book a routine appointment."],
      ["Back up phone photos", "Copy this month's photos to the family cloud folder."],
      ["Clean the coffee machine", "Run the cleaning cycle and refill the water reservoir."],
    ],
  },
  {
    email: "seed.user03@example.test",
    tasks: [
      ["Review the project brief", "Highlight open questions and send them to the project team."],
      ["Return library books", "Put the two borrowed books by the front door before leaving."],
      ["Update the household budget", "Categorize this week's receipts and check the monthly total."],
      ["Replace the hallway bulb", "Measure the old bulb and pick up a matching warm-white replacement."],
      ["Draft a weekend itinerary", "Pick one outdoor activity and one relaxed indoor option."],
    ],
  },
  {
    email: "seed.user04@example.test",
    tasks: [
      ["Reply to the design feedback", "Address the three open comments and share the revised mockup."],
      ["Wash reusable grocery bags", "Wash the fabric bags and leave them out to dry."],
      ["Organize the desk drawer", "Group stationery together and recycle dried-out pens."],
      ["Check the car tire pressure", "Use the recommended pressure listed inside the driver door."],
      ["Choose a new book", "Browse the reading list and borrow one title for this month."],
      ["Send the meeting notes", "Summarize decisions and owners from the morning planning call."],
    ],
  },
  {
    email: "seed.user05@example.test",
    tasks: [
      ["Practice guitar for twenty minutes", "Work slowly through the chord changes in the new song."],
      ["Prepare lunches for tomorrow", "Pack two balanced lunches and put them in the refrigerator."],
      ["Clean the bathroom mirror", "Wipe away streaks and polish the mirror with a clean cloth."],
      ["Review the monthly subscriptions", "Cancel services that are no longer being used."],
      ["Update emergency contacts", "Confirm the phone numbers saved on the household contact sheet."],
      ["Take the winter coat to be repaired", "Drop off the coat and ask when it will be ready."],
      ["Sketch ideas for the garden", "Draw a simple layout with room for herbs and two planters."],
    ],
  },
  {
    email: "seed.user06@example.test",
    tasks: [
      ["Finish the presentation outline", "Add the key points and examples before polishing the slides."],
      ["Pick up a parcel", "Bring the collection code and photo ID to the pickup counter."],
      ["Clean out the refrigerator", "Discard expired food and wipe the shelves before shopping."],
      ["Read the first chapter", "Set aside half an hour and note any useful ideas."],
      ["Update the bicycle chain", "Clean the chain, apply lubricant, and wipe away the excess."],
      ["Confirm dinner with friends", "Message everyone to confirm the time and dietary preferences."],
      ["Put the clean towels away", "Fold the laundry and return towels to the bathroom cabinet."],
      ["Test the smoke alarm", "Press the test button and replace the battery if the alarm is weak."],
    ],
  },
  {
    email: "seed.user07@example.test",
    tasks: [
      ["Submit the expense report", "Attach receipts for the client visit and verify the totals."],
      ["Pick up fresh herbs", "Buy basil and parsley for the meals planned this week."],
      ["Organize the photo album", "Select ten favorite pictures and add captions with dates."],
      ["Clean the balcony", "Sweep the floor and wipe down the small outdoor table."],
      ["Review the online course", "Complete the quiz and write down topics to revisit."],
      ["Book a haircut", "Find an appointment that fits around next week's meetings."],
      ["Replace the water filter", "Install the spare filter and flush it according to the instructions."],
      ["Donate unused kitchenware", "Pack clean items that have not been used in the past year."],
      ["Plan a short evening walk", "Choose a safe route and invite a neighbor to join."],
    ],
  },
  {
    email: "seed.user08@example.test",
    tasks: [
      ["Review the team roadmap", "Check the milestone dates and flag any dependencies that changed."],
      ["Make a batch of soup", "Prepare a vegetable soup and freeze two portions for later."],
      ["Sort the recycling", "Rinse containers and take cardboard to the recycling bin."],
      ["Update the travel checklist", "Add medications, chargers, and the latest booking details."],
      ["Clean the laptop keyboard", "Power down the laptop and gently remove dust between the keys."],
      ["Send a birthday card", "Write a note and mail the card before the end of the week."],
      ["Check the pantry staples", "Add rice, oats, and cooking oil to the shopping list if needed."],
      ["Review the volunteer schedule", "Confirm the shift time and arrange transportation."],
      ["Tighten the loose cabinet handle", "Use the correct screwdriver and check the other handles too."],
      ["Write a short journal entry", "Record one thing that went well and one thing to improve tomorrow."],
    ],
  },
  {
    email: "seed.user09@example.test",
    tasks: [
      ["Finalize the workshop agenda", "Add discussion times and send the agenda to attendees."],
      ["Prepare a new recipe", "Try the lentil recipe and note any changes for next time."],
      ["Clean the entryway rug", "Shake out the rug outside and vacuum the entryway."],
      ["Review the savings goal", "Compare the current balance with the target for this quarter."],
      ["Check the garden tools", "Clean the hand tools and store them in the dry shed."],
      ["Arrange a video call with family", "Suggest two times and share the meeting link."],
      ["Renew the parking permit", "Gather the vehicle details and submit the renewal form."],
      ["Label the storage boxes", "Mark each box with its contents before stacking it in the closet."],
      ["Take a walk during lunch", "Leave the desk for twenty minutes and get some fresh air."],
      ["Read the book club selection", "Finish the next three chapters before the weekend discussion."],
      ["Check the first aid kit", "Replace used supplies and make a note of anything expired."],
      ["Clear old downloads", "Delete files that are no longer needed and keep important documents."],
    ],
  },
  {
    email: "seed.user10@example.test",
    tasks: [
      ["Create a project retrospective", "Collect team takeaways and group them into keep, change, and try."],
      ["Prepare breakfast for the week", "Portion overnight oats into jars and refrigerate them."],
      ["Vacuum the living room", "Move light furniture and vacuum the corners and under the sofa."],
      ["Check the home insurance renewal", "Compare the renewal details and note questions for the provider."],
      ["Update the personal portfolio", "Add a short summary of the latest completed project."],
      ["Prune the garden plants", "Remove dead leaves and clear the clippings from the path."],
      ["Return the borrowed charger", "Pack the charger and arrange a convenient handoff."],
      ["Plan next month's workouts", "Schedule three realistic sessions each week in the calendar."],
      ["Clean the reusable water bottle", "Wash the lid and bottle thoroughly and let both air dry."],
      ["Review the team's open requests", "Assign an owner to each request that is still waiting."],
      ["Organize the spice shelf", "Group spices by type and move the most-used jars within reach."],
      ["Check the weather stripping", "Inspect the front door for gaps and note any needed repairs."],
      ["Make a playlist for the road trip", "Choose a mix of familiar songs and new discoveries."],
      ["Prepare documents for tax season", "Gather income statements and receipts in one secure folder."],
      ["Clean the kitchen extractor filter", "Remove the filter and wash it following the appliance guide."],
      ["Set up a neighborhood book swap", "Choose a date and invite neighbors to bring a book to exchange."],
    ],
  },
];

const taskCounts = seedUsers.map(({ tasks }) => tasks.length);
const taskCount = taskCounts.reduce((total, count) => total + count, 0);

if (
  seedUsers.length !== 10 ||
  taskCount !== 80 ||
  new Set(taskCounts).size !== seedUsers.length
) {
  throw new Error("Seed data must contain 10 users with unequal assignments totaling 80 tasks.");
}

async function seedDatabase() {
  try {
    await sequelize.authenticate();

    await sequelize.transaction(async (transaction) => {
      const seedEmails = seedUsers.map(({ email }) => email);
      const existingSeedUsers = await User.findAll({
        where: { email: seedEmails },
        attributes: ["id"],
        transaction,
      });

      if (existingSeedUsers.length > 0 && !replaceSeedData) {
        throw new Error(
          "Seed accounts already exist. Run `npm run seed -- --replace` to replace only the seed accounts and their tasks.",
        );
      }

      if (replaceSeedData && existingSeedUsers.length > 0) {
        const existingSeedUserIds = existingSeedUsers.map(({ id }) => id);
        await Task.destroy({
          where: { user_id: existingSeedUserIds },
          transaction,
        });
        await User.destroy({
          where: { id: existingSeedUserIds },
          transaction,
        });
      }

      const password_hash = await bcrypt.hash(seedPassword, 12);
      let taskIndex = 0;

      for (const seedUser of seedUsers) {
        const user = await User.create(
          { email: seedUser.email, password_hash },
          { transaction },
        );

        const tasks = seedUser.tasks.map(([title, description]) => {
          taskIndex += 1;
          return {
            user_id: user.id,
            title,
            description,
            completed: taskIndex % 5 === 0,
            image_key: null,
          };
        });

        await Task.bulkCreate(tasks, { transaction });
      }
    });

    console.log("Seeded 10 users and 80 tasks without images.");
  } finally {
    await sequelize.close();
  }
}

seedDatabase().catch((error) => {
  console.error("Database seeding failed:", error);
  process.exitCode = 1;
});
