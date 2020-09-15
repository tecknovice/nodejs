var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
const csv = require("csv-parser");
const fs = require("fs");
const intents = [];
const questions = [];
const answers = [];

fs.createReadStream("csv/faq/faq_intent.csv")
  .pipe(csv({ separator: "|" }))
  .on("data", (data) => intents.push(data))
  .on("end", () => {
    // console.log(intents);
  });

fs.createReadStream("csv/faq/faq_question.csv")
  .pipe(csv({ separator: "|" }))
  .on("data", (data) => questions.push(data))
  .on("end", () => {
    // console.log(questions);
  });

fs.createReadStream("csv/faq/faq_answer.csv")
  .pipe(csv({ separator: "|" }))
  .on("data", (data) => answers.push(data))
  .on("end", () => {
    // console.log(answers);
  });

 console.log(intents, questions, answers);

const mixin = [];
for (let index = 0; index < intents.length; index++) {
  const intent = intents[index];
  const answer = answers.find((answer) => answer.id === intent.id);
  const correspondingQuestions = questions.filter(
    (question) => question.id === intent.id
  );
  let obj = {
    serviceId: "5f6062b675a36e1144a2b149",
    intentEntrace: [],
    intentExit: answer.answer,
    _class: "vn.com.emteller.data.model.TrainingData",
  };
  for (let index = 0; index < correspondingQuestions.length; index++) {
    const question = correspondingQuestions[index];
    obj.intentEntrace.push({ value: question.question, type: "c" });
  }
  mixin.push(obj);
}
console.log(mixin)

// MongoClient.connect(url, function (err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var myobj = { name: "Company Inc", address: "Highway 37" };
//   dbo.collection("customers").insertOne(myobj, function (err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
//   });
// });
