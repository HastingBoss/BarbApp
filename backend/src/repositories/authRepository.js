const User = require("../models/User");

const authRepository = {
  async findByEmail(email) {
    return User.findOne({ email });
  },

  async findById(id) {
    return User.findById(id).select("-password");
  },

  async create(data) {
    const user = new User(data);
    return user.save();
  },

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true }).select("-password");
  },
};

module.exports = authRepository;
