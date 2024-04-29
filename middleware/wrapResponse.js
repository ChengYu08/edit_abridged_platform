const logger = require("../utils/log");
// middleware function to wrap JSON responses
const wrapResponse = (req, res, next) => {
  // Save the original res.json() function
  const originalJson = res.json;

  // Create a new res.json() function
  res.json = function (data) {
    // Wrap the response data in the desired template
    const wrappedData = {
      status: 'success',
      data: data,
      msg: "success",
      code: 200,
    };

    // Call the original res.json() function with the wrapped data
    originalJson.call(this, wrappedData);
  };
  logger.debug(`url:${req.url} method: ${req.method} params:${JSON.stringify(req.params)} query: ${ JSON.stringify(req.query) } body ${req.body}`);

  // Move to the next middleware or route handler
  next();
};

module.exports = wrapResponse;