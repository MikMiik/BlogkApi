const { User, Skill, Achievement } = require("@/models");
const { Op } = require("sequelize");
class UsersService {
  async getAll() {
    const users = await User.findAll();
    return users;
  }

  async getById(id) {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id }, { username: id }],
      },
      attributes: [
        "id",
        "email",
        "firstName",
        "lastName",
        "username",
        "name",
        "avatar",
        "role",
        "status",
      ],
    });
    return user;
  }
  async getByEmail(email) {
    const user = await User.findOne({
      where: { email },
    });
    return user;
  }

  async create(data) {
    const user = await User.create(data);
    return user;
  }

  async update(id, data) {
    await User.update(data, { where: { id } });
    return { message: "Reset password successful" };
  }

  async remove(id) {
    const result = await User.destroy({ where: { id } });
    return result;
  }
}

module.exports = new UsersService();
