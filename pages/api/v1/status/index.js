function status(request, response) {
  response.status(200).json({ teste: "test" });
}

export default status;
