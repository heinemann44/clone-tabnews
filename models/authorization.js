function can(user, feature, resource) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = can(user, "update:user:others") || user.id === resource.id;
  }

  return authorized;
}

function cant(user, feature, resource) {
  return !can(user, feature, resource);
}

const authorization = {
  can,
  cant,
};

export default authorization;
