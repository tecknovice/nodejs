var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var url = "mongodb://192.168.0.33:27017/";
var csv2json = require("./CSVtoJSON");
const intents = csv2json("csv/tr/tr_intent.csv");
const questions = csv2json("csv/tr/tr_question.csv");
const answers = csv2json("csv/tr/tr_answer.csv");
// console.log(intents, questions, answers);
const data = [];
for (let index = 0; index < intents.length; index++) {
  const intent = intents[index];
  const answer = answers.find((answer) => answer.id === intent.id);
  const correspondingQuestions = questions.filter(
    (question) => question.id === intent.id
  );
  let obj = {
    serviceId: "5f6062d375a36e1144a2b158",
    intentEntrace: [],
    intentExit: answer.value,
    _class: "vn.com.emteller.data.model.TrainingData",
  };
  obj.intentEntrace.push({
    _id: new ObjectID(),
    value: intent.value,
    type: "c",
  });
  for (let index = 0; index < correspondingQuestions.length; index++) {
    const question = correspondingQuestions[index];
    obj.intentEntrace.push({
      _id: new ObjectID(),
      value: question.value,
      type: "c",
    });
  }
  data.push(obj);
}
console.log(data.map((item) => item.intentEntrace));
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("emteller");
  dbo.collection("training_datas").insertMany(data, function (err, res) {
    if (err) throw err;
    console.log("inserted");
    db.close();
  });
});
