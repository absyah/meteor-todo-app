Task = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Template.body.helpers({
    // Tasks List
    tasks: function () {
      if (Session.get("hideCompleted")) {
        return Task.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        return Task.find({}, {sort: {createdAt: -1}});
      }
    },

    // Checkbox hideCompleted
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },

    // incomplete task counter
    incompleteCount: function () {
      return Task.find({checked: {$ne: true}}).count();
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
    },

    // Hide completed tasks
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    // update
    "click .toggle-checked": function () {
      Task.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },

    // delete
    "click .delete": function () {
      Task.remove(this._id);
    }

  });

}
