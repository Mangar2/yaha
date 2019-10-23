const Broker = require("@mangar2/broker");
const config = require("./config.json");

var broker = new Broker(config);
broker.run();