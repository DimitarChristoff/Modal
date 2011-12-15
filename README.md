Modal BootStrap
===============

A MooTools 1.4+ plugin that allows easy modal window use through HTML5 Boot-Strapping via data- properties on elements.
Provides:

  - Modal.Overlay
  - Modal.Base
  - Modal.BootStrap
  - Modernizr (adds csstransitions detection ONLY if not already loaded) (+1k)

![Screenshot 1](http://fragged.org/img/Modal.BootStrap.png)

How to use
----------

Download and check the `Demo/index.html`.

Opening a modal can be as simple as adding this:

```javascript
    new Modal.BootStrap(document.body);
```

```HTML
    <a href="#simonSays" class="modal-overlay" data-title="Simon was here">Load contents of id=simonSays into a modal</a>`

Of course, you can open a modal window by pure javascript without the BootStrap:

```javascript
    new Modal.Base(document.body, {
        header: "Hi",
        body: "loading something"
    });
```

Example
-------

[http://jsfiddle.net/dimitar/GGAa5/](http://jsfiddle.net/dimitar/GGAa5/)


Public methods and options of Modal.Base
----------------------------------------

- `.show(options)` - shows the current modal window whereby options can override the instance options
- `.hide(options)` - hides the current modal window whereby options can override the instance options
- `.toggle()` - shows / hides the current modal window
- `.setTitle(title)` - sets/updates the contents of the title of the modal window
- `.setBody(body)` - sets/updates the contents of the body of the modal window
- `.setFooter(footer)` - sets the contents of the footer of the modal window

Keep in mind it will prefer CSS3 transitions, if they are available - instead of Fx.Morph (as fallback).

Check the Modal.js for all options, they are mostly self-explanatory.

Events in Modal.Base
--------------------

- `onReady` - fires when a new instance is created
- `onShow` - fires when modal is shown
- `onHide` - firs when modal is hidden

Data properties and options for Modal.BootStrap
-----------------------------------------------

These are the properties on the trigger elements it can read:

- `data-type` - type of modal data. default is element (via href), can also be `ajax` to get content from the href,
- `data-title` - string or id of element to grab content from
- `data-buttons` - JSON that adds footer buttons, eg `[{className:'right modal-close','text':'No, thanks','event':'cancel'},{className:'left','text':'Sure!','event':'confirm'}]`,
- `data-footer` - string or id of element to grab content from
- `data-overlay` - true|false for protecting the screen behind the modal window
- `data-any-close` - true|false for allowing clicking outside the modal window to close it (when overlay is on)
- `data-esc-close` - true|false to bind ESC to close the modal

From the Options object:

`modalLinks: "a.modal-overlay"` - tells it to attach to all A links with class "modal-overlay"

