const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const generateUniqueSlug = require("../../../utils/generateUniqueSlug");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

// Hàm tạo slug từ tên
function createUsernameSlug(name, slugs) {
  return generateUniqueSlug(name, slugs);
}

// Hàm hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Hàm tạo dữ liệu user giả
async function generateUsers(count = 100) {
  const users = [];
  const slugs = new Set();
  const usedEmails = new Set();
  const usedPhones = new Set();
  const usedUsername = new Set();

  for (let i = 0; i < count; i++) {
    let email, phone, username;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = firstName + " " + lastName;
    // Đảm bảo email unique
    do {
      email = faker.internet.email();
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Đảm bảo phone unique
    do {
      phone = faker.phone.number("#### ### ###");
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    do {
      username = createUsernameSlug(name, slugs);
    } while (usedUsername.has(username));

    const user = {
      firstName,
      lastName,
      email,
      password: await hashPassword(
        generator.generate({
          length: 10,
          numbers: true,
        })
      ),
      role: faker.helpers.arrayElement(["User", "Developer", "Senior"]),
      username,
      status: faker.helpers.arrayElement(["Active", "Offline"]),
      phone,
      birthday: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      // gender: faker.helpers.arrayElement(["Male", "Female", "Other"]),
      address: faker.location.streetAddress(true),
      introduction: faker.lorem.sentence(),
      lastLogin: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      twoFactorAuth: faker.datatype.boolean(0.5),
      twoFactorSecret: generator.generate({
        length: 10,
        numbers: true,
      }),
      postsCount: faker.number.int({ min: 0, max: 10 }),
      followersCount: faker.number.int({ min: 0, max: 10 }),
      followingCount: faker.number.int({ min: 0, max: 10 }),
      likesCount: faker.number.int({ min: 0, max: 10 }),
      verifiedAt: faker.datatype.boolean(0.8) ? faker.date.recent() : null, // 80% chance được verify
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    users.push(user);
  }
  return users;
}

module.exports = generateUsers;
