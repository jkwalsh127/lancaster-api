const dayjs = require("dayjs");
const evm = require("../evm.cjs");

module.exports = async function (cronId = '') {
  await evm.createEvent({
    name: dayjs().format("[[]HH:mm A]") + " Increment Ticker",
    action: {
      name: "cron-ticker",
      params: {
        cronId: cronId,
      },
    },
    cycle: {
      unit: "hours",
      value: 1,
    },
  });
};
