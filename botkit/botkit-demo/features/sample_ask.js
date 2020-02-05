const { BotkitConversation } = require("botkit");
module.exports = function(controller) {
  const tacos = new BotkitConversation("tacos", controller);
  tacos.say("Oh boy, taco time!");
  tacos.ask(
    "What type of taco do you want?",
    async (answer, convo, bot) => {
      // do something with the answer!
      console.log("answer ", answer);
      console.log("convo ", convo);
      console.log("bot ", bot);
    },
    "type_of_taco"
  );
  tacos.say("Yum!!");
  controller.addDialog(tacos);

  controller.hears("tacos", "message", async (bot, message) => {
    await bot.beginDialog("tacos");
  });
};
