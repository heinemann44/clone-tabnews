import bcrypt from "bcryptjs";

async function hash(password) {
  return bcrypt.hash(password, getNumberOfRounds());
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function compare(plainTextPassword, hashedPassword) {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
