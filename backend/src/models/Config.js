const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    porcentajeSalon: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
