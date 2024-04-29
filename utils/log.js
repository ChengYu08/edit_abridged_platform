const log4js = require("log4js");
log4js.configure({
  appenders: {
    out: { type: "stdout" },
    app: { type: "file", filename: "简速台.log" },

},
  categories: { default: { appenders: ["app"], level: "error" } },
});
const logger = log4js.getLogger("简速台");
logger.level = "debug";

module.exports = logger;
