// 'use strict';

// module.exports = function(app, callback) {
//   // Obtain the datasource registered with the name "mysqlDS"
//   const dataSource = app.dataSources.mysqlDS;

//   // Step 1: define a model for "conversation_backups" table,
//   // including any models for related tables (e.g. "conversation_backups").
//   dataSource.discoverAndBuildModels(
//     'conversation_backups',
//     {relations: true},
//     function(err, models) {
//       if (err) return callback(err);

//       // Step 2: expose all new models via REST API
//       for (const modelName in models) {
//         app.model(models[modelName], {dataSource: dataSource});
//       }

//       callback();
//     });
// };