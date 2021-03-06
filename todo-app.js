Task = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Meteor.subscribe("tasks");

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
      Meteor.call("addTask", text);

      // Clear form
      event.target.text.value = "";
    },

    // Hide completed tasks
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  // TEMPLATE TASKS HELPER
  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  // TEMPLATE TASKS EVENTS
  Template.task.events({
    // update
    "click .toggle-checked": function () {
      Meteor.call("setChecked", this._id, ! this.checked);
    },

    // delete
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },

    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

// server code
if (Meteor.isServer) {

  // methods
  Meteor.methods({
    // add task method
    addTask: function (text) {
      // make sure user is logged in to create a task
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Task.insert({
        owner: Meteor.userId(),
        username: Meteor.user().username,
        text: text,
        createdAt: new Date()
      });
    },

    // delete task
    deleteTask: function (taskId) {
      Task.remove(taskId);
    },

    // set checked
    setChecked: function (taskId, setChecked) {
      Task.update(taskId, {
        $set: {checked: setChecked}
      });
    },

    // set to private
    setPrivate: function (taskId, setToPrivate) {
      var task = Task.findOne(taskId);

      if (task.owner !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Task.update(taskId, {
        $set: {private: setToPrivate}
      });
    }

  });

  // Publish to client
  Meteor.publish("tasks", function () {
    return Task.find();
  });

}
