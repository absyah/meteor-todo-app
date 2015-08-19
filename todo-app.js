Task = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Template.body.helpers({
    tasks: function () {
      return Task.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert to Mongo
      Task.insert({
        text: text,
        createdAt: new Date()
      });

      // Clear form
      event.target.text.value = "";
    }
  });

}
