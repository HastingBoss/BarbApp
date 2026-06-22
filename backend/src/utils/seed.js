const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin ya existe");
      await mongoose.connection.close();
      return;
    }

    const email = process.env.ADMIN_EMAIL || "admin@barberia.com";
    const password = process.env.ADMIN_PASSWORD || "password_seguro";

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
    });

    console.log("Admin creado exitosamente");
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error en seed:", err.message);
    process.exit(1);
  }
}

seed();
