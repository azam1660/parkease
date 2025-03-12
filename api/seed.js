import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import User from "./models/user.model.js";
import Tenant from "./models/tenant.model.js";
import Setting from "./models/setting.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Function to generate a dummy tenant, SuperAdmin user, and settings
const generateDummyTenantAndSuperAdmin = async () => {
  try {
    const tenant = new Tenant({
      name: faker.company.name(),
      domain: faker.internet.domainName(),
      plan: faker.helpers.arrayElement(["Free", "Basic", "Premium"]),
      status: "Active",
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      subscription: {
        startDate: new Date(),
        endDate: faker.date.future(),
        paymentMethod: "Credit Card",
        autoRenew: true,
      },
      settings: {
        theme: faker.helpers.arrayElement(["light", "dark"]),
        logo: faker.image.avatar(),
        customDomain: faker.internet.domainName(),
      },
    });

    await tenant.save();

    const plainPassword = "SuperAdmin123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("Generated Hashed Password:", hashedPassword); // 🔍 Log hashed password before saving

    const user = new User({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: plainPassword, // Ensure this is used
      role: "SuperAdmin",
      status: "Active",
      tenant: tenant._id,
      lastActive: new Date(),
      phoneNumber: faker.phone.number(),
      profileImage: faker.image.avatar(),
      preferences: {
        language: faker.helpers.arrayElement(["English", "Spanish", "French"]),
        notifications: { email: faker.datatype.boolean(), sms: faker.datatype.boolean() },
        theme: faker.helpers.arrayElement(["light", "dark"]),
      },
    });

    await user.save();
    console.log("User saved successfully!");

    // Store all settings in a single document
    const setting = new Setting({
      tenant: tenant._id,
      settings: {
        general: {
          companyName: tenant.name,
          address: tenant.address.street,
          contactEmail: tenant.contactEmail,
          contactPhone: tenant.contactPhone,
          darkMode: faker.datatype.boolean(),
        },
        pricing: {
          hourlyRate: faker.number.float({ min: 2, max: 10, precision: 0.1 }),
          dailyRate: faker.number.float({ min: 10, max: 50, precision: 0.1 }),
        },
        api: {
          plateRecognizerKey: "",
        },
        notifications: {
          emailNotifications: faker.datatype.boolean(),
        },
      },
    });

    await setting.save();

    console.log("Dummy tenant, SuperAdmin user, and settings created successfully!");
    process.exit();
  } catch (error) {
    console.error("Error generating tenant, SuperAdmin user, and settings:", error);
    process.exit(1);
  }
};

// Run the script
(async () => {
  await connectDB();
  await generateDummyTenantAndSuperAdmin();
})();
