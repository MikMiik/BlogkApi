const { User } = require("@/models");
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
    const result = await User.update(data, { where: { id } });
    return result;
  }

  async remove(id) {
    const user = await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
    });
    const result = await user.destroy();
    return result;
  }
}

module.exports = new UsersService();
