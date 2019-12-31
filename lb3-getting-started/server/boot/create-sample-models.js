module.exports = function(app) {
  app.dataSources.mysqlDs.autoupdate("CoffeeShop", function(err) {
    if (err) throw err;

    app.models.CoffeeShop.create(
      [],
      function(err, coffeeShops) {
        if (err) throw err;

        console.log("Models created: \n", coffeeShops);
      }
    );
  });
};
