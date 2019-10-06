const Connect = require("@mangar2/connect");
const Publish = require("@mangar2/publish");
const UnitTest = require("@mangar2/unittest");
const Message = require("@mangar2/message");

var unitTest = new UnitTest(true);

(async function test() {    
    try {
        let result;
        const CLEAN = true;
        const HOST = "127.0.0.1";
        const BROKER_PORT = 9001;
        // connect
        let connect = new Connect("/connect/test", HOST, BROKER_PORT, 9002);

        result = await connect.connect(CLEAN);
        unitTest.assertTrue(connect.isConnected, "successful connected");
        unitTest.assertEqual(result && result.present, 0, "No connection present");

        let publish = new Publish(HOST, BROKER_PORT, {retry: 3});
        let notAvailable = new Publish(HOST, 9003, {retry : 3});
        // publish QoS 0
        result = await publish.publish(new Message("/a/a", 1, "test"), 0, 0);
        unitTest.assertEqual(result, undefined, "QoS 0 message have undefined result");

        // publish QoS 1
        result = await publish.publish(new Message("/a/a", 1, "test"), 1, 0);
        unitTest.assertTrue(result, "QoS 1 message successful");

        // publish QoS 2
        result = await publish.publish(new Message("/a/a", 1, "test"), 2, 0);
        unitTest.assertTrue(result, "QoS 2 message successful");

        // QoS 1 on disconnect
        result = await notAvailable.publish(new Message("/a/a", 1, "test"), 1, 0);
        unitTest.assertTrue(!result, "QoS 1 message could not be delivered");

        unitTest.showResult(5);
    }
    catch (err) {
        console.error(err);
        console.error("Error: test ends with errors")
        process.exit(1);
    }
})();

