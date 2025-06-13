import bcrypt from "bcryptjs";

async function hash(password) {
  return bcrypt.hash(password, getNumberOfRounds());
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
