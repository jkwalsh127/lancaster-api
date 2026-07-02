const dayjs = require("dayjs");
const evm = require("../evm.cjs");

module.exports = async function () {
  await evm.createEvent({
    name: dayjs().format("[[]HH:mm A]") + " Send operational email",
    action: {
      name: "send-email",
      params: {
        recipients: [], // insert emails here
      },
    },
    cycle: {
      unit: "hours",
      value: 1,
    },
  });
};
