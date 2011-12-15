Modal BootStrap
===============

A MooTools 1.4+ plugin that allows easy modal window use through HTML5 Boot-Strapping via data- properties on elements.
Provides:

  - Modal.Overlay
  - Modal.Base
  - Modal.BootStrap
  - Modernizr (adds csstransitions selection if not already on page)

![Screenshot 1](http://fragged.org/img/Modal.BootStrap.png)

How to use
----------

Check the `Demo/index.html`.

Opening a modal can be as simple as adding this:

```javascript
new Modal.BootStrap(document.body);
```

`<a href="#simonSays" class="modal-overlay" data-title="Simon was here">Load contents of id=simonSays into a modal</a>`

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
