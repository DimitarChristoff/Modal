window.addEvent("domready", function() {

new Modal.BootStrap(document.body, {
    onConfirm: function() {
        this.hide();
        alert("you rocked!");
    },
    onCancel: function() {
        this.hide();

    }
});

});