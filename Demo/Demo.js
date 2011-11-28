window.addEvent("domready", function() {

new COMMON.Modal.bootStrap(document.body, {
    onConfirm: function() {
        this.hide();
        alert("you rocked!");
    },
    onCancel: function() {
        this.hide();

    }
});

});