// Copyright IBM Corp. 2015,2017. All Rights Reserved.
// Node module: loopback-example-relations
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(app) {
  var Customer = app.models.Customer;
  var Order = app.models.Order;

  // define a custom scope
  Customer.scope('youngFolks', {where: {age: {lte: 22 }}});
  app.dataSources.db.automigrate('Customer', function(err) {
    if (err) throw err;

    var customers = [
      {name: 'Customer A', age: 21},
      {name: 'Customer B', age: 22},
      {name: 'Customer C', age: 23},
      {name: 'Customer D', age: 24},
      {age: 25}
      ];
    var orders = [
      {
        description: 'First order by Customer A',
        date: '01-01-2015'
      },
      {
        description: 'Second order by Customer A',
        date: '02-01-2015'
      },
      {
        description: 'Order by Customer B',
        date: '03-01-2015'
      },
      {
        description: 'Order by Customer C',
        date: '04-01-2015'
      },
      {
        description: 'Order by Anonymous',
        date: '05-01-2015'
      }
    ];

    // Create customers and orders
    Customer.create(customers[0], function(err, instance) {
      if (err) return console.error(err);
      console.log('Customer created: ', instance);
      orders[0].customerId = instance.id;
      orders[1].customerId = instance.id;
      Order.create(orders[0], function(err, instance) {
        if (err) return console.error(err);
        console.log('Order created: ', instance);
      });
      Order.create(orders[1], function(err, instance) {
        if (err) return console.error(err);
        console.log('Order created: ', instance);
      });
    });
    Customer.create(customers[1], function(err, instance) {
      if (err) return console.error(err);
      console.log('Customer created: ', instance);
      orders[2].customerId = instance.id;
      Order.create(orders[2], function(err, instance) {
        if (err) return console.error(err);
        console.log('Order created: ', instance);
      });
    });
    Customer.create(customers[2], function(err, instance) {
      if (err) return console.error(err);
      console.log('Customer created: ', instance);
      orders[3].customerId = instance.id;
      Order.create(orders[3], function(err, instance) {
        if (err) return console.error(err);
        console.log('Order created: ', instance);
      });
    });
    Customer.create(customers[3], function(err, instance) {
      if (err) return console.error(err);
      console.log('Customer created: ', instance);
      instance.orders.create(orders[4], function(err, instance) {
        if (err) return console.error(err);
        console.log('Order created: ', instance);
        instance.shipments.create({date: new Date(), description: 'Shipment'},
        function(err, instance) {
          if (err) return console.error(err);
          console.log('Shipment created: ', instance);
        });
      });
    });
  });
};
