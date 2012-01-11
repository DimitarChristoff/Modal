/*
---

name: Modal.BootStrap

description: provides a dom boostrap for modal content

authors: Daniel Buchner, Dimitar Christoff, Simon Smith

license: MIT-style license.

version: 1.07

requires:
  - Core/String
  - Core/Event
  - Core/Element
  - Core/Array
  - Core/Class

provides: Modal.Overlay, Modal.Base, Modal.BootStrap, Modernizr

...
*/
(function() {

// setup a namespace
var Modal = this.Modal = {};

//detect css3 transition support via modernizr if needed
var Modernizr = this.Modernizr || function(a,b,c){function z(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1),d=(a+" "+m.join(c+" ")+c).split(" ");return y(d,b)}function y(a,b){for(var d in a)if(j[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function x(a,b){return!!~(""+a).indexOf(b)}function w(a,b){return typeof a===b}function v(a,b){return u(prefixes.join(a+";")+(b||""))}function u(a){j.cssText=a}var d="2.0.6",e={},f=b.documentElement,g=b.head||b.getElementsByTagName("head")[0],h="modernizr",i=b.createElement(h),j=i.style,k,l=Object.prototype.toString,m="Webkit Moz O ms Khtml".split(" "),n={},o={},p={},q=[],r,s={}.hasOwnProperty,t;!w(s,c)&&!w(s.call,c)?t=function(a,b){return s.call(a,b)}:t=function(a,b){return b in a&&w(a.constructor.prototype[b],c)},n.csstransitions=function(){return z("transitionProperty")};for(var A in n)t(n,A)&&(r=A.toLowerCase(),e[r]=n[A](),q.push((e[r]?"":"no-")+r));u(""),i=k=null,e._version=d,e._domPrefixes=m,e.testProp=function(a){return y([a])},e.testAllProps=z;return e}(this,this.document);

// provides:
// Modernizr.csstransitions = false;
Element.NativeEvents.transitionend = 2;

Element.implement({
    diffuse: function(position){
        return this.setStyles({
            position: position || 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            width: '100%'
        });
    }
});

Modal.Overlay = new Class({

    Implements: [Events, Chain, Options],

    options: {
        zIndex: 900000,
        opacity: .3,
        backgroundColor: '#555',
        fx: {
            duration: 300
        }
    },

    initialize: function(container, options){
        this.setOptions(options);
        this.container = document.id(container);
        var self = this;
        this.element = new Element('div', {
            'class': 'overlay',
            styles: {
                display: 'none',
                opacity: 0,
                zIndex: this.options.zIndex,
                backgroundColor: this.options.backgroundColor
            },
            events: {
                click: function() {
                    self.fireEvent("overlayClick");
                }
            },
            tween: this.options.fx
        }).diffuse('fixed').inject(this.container);
    },

    show: function(){
        this.element.setStyle("display", "block").fade(this.options.opacity);
    },

    hide: function(){
        this.element.fade(this.options.opacity).get("tween").chain(function() {
            this.element.setStyle("display", "none");
        });
    }

});

Modal.Base = new Class({

    Implements: [Events, Chain, Options],

    options: {
        id: "modal",
        margin: 20,
        overlay: true,
        anyClose: true,
        escClose: false,
        limitHeight: true,
        header: "",
        body: "",
        footer: "",
        useTransitions: true && Modernizr.csstransitions,
        transitionClass: "transition",
		transitionClassBox: "modal-box-initial",
        transitionShowClass: "modal-visible",
        fx: {
            duration: 400,
            properties: {
                show: {
                    opacity: [0,1],
                    marginTop: [30,0]
                },
                hide: {
                    opacity: [1,0],
                    marginTop: [0,30]
                }
            }
        },
        overlayFx: {
            duration: 0
        }
    },

    // the magic template by csuwldcat. tables ftw...
    template: ['<table class="modal" style="position: fixed; top: 0; left: -100%; width: 100%; height: 100%;">',
                '<tbody style="height: 100%;">',
                    '<tr style="height: 100%;">',
                        '<td style="vertical-align: middle; height: 100%; text-align: center">',
                            '<div class="modal-box boxShadow clearfix" style="position: relative; margin: 0 auto;">',
                                '<span class="modal-close"></span>',
                                '<div class="modal-header"></div>',
                                '<div class="modal-content" style="overflow: auto;">',
                                    '<div class="modal-body"></div>',
                                '</div>',
                                '<div class="modal-footer"></div>',
                            '</div>',
                        '</td>',
                    '</tr>',
                '</tbody>',
            '</table>'].join(""),

    initialize: function(container, options){
        this.setOptions(options);

        this.container = document.id(container);
        if (!this.container)
            return;

        var proxy = new Element("div", {
            "html": this.template
        });

        // save references
        this.element = proxy.getFirst().store('modal', this).inject(this.container);
        this.box = this.element.getElement('div.modal-box').set('morph', this.options.fx).setStyles({
            'opacity': 0
        });

        if (this.options.useTransitions) {
            this.box.addClass(this.options.transitionClass);
			this.box.addClass(this.options.transitionClassBox);
        }

        this.content = this.box.getElement('div.modal-content');
        this.body = this.content.getFirst();
        this.footer = this.content.getNext();
        this.header = this.content.getPrevious();
        this.closeButton = this.header.getPrevious();
        this.wrapper = this.box.getParent();

        // modal instance id for toggling...
        this.setId(this.options.id);

        // use overlay?
        this.overlay = (this.options.overlay) ? new Modal.Overlay(this.container, {
            fx: this.options.overlayFx,
            onOverlayClick: this.overlayClick.bind(this)
        }) : false;

        this.isShown = false;

        // set defaults
        this.fill(this.options);

        // close methods...
        this.attachEvents();
        this.fireEvent("ready");
    },

    overlayClick: function(e) {
        // handle click on overlay to close if allowed
        e && e.preventDefault();

        if (this.box.retrieve("options").anyClose) {
            this.hide();
        }
    },

    escapePress: function(e) {
        // handle press of ESC to close if allowed
        if (e && e.key) {
            var opts = this.box.retrieve("options") || this.options;
            if (e.key === 'esc' && opts.escClose) {
                this.hide();
            }
        }
    },

    attachEvents: function() {
        // ways to close...
        this.box.addEvent('click:relay(.modal-close)', this.hide.bind(this));
        window.addEvents({
            'keydown': this.escapePress.bind(this),
            'resize': this.limitHeight.bind(this)
        });

        return this;
    },

    setId: function(id) {
        // needed so each modal can have a unique id.
        this.box.store("uid", id);
        return this;
    }.protect(),

    getId: function() {
        return this.box.retrieve("uid") || this.options.id;
    },

    toggle: function() {
        // simple toggler for the instance
        var method = this.isShown ? "hide" : "show";
        this[method].apply(this, arguments);
    },

    show: function(options){
        options = options || this.options;
        if (options.overlay)
            this.overlay.show();

        this.box.setStyle("visibility", "visible");

        if (this.options.useTransitions) {
            this.box.addClass(this.options.transitionShowClass);
        }
        else {
            this.box.morph(options.fx.properties.show);
        }

        if (this.options.openClass) {
            this.box.addClass(this.options.openClass);
        }

        this.isShown = true;
        this.box.store("options", options);
        this.fireEvent('show');

        return this;
    },

    hide: function(){
        var self = this;


        var completeCallback = function() {
            clearTimeout(self.hideTimer);
            self.box.setStyle("visibility", "hidden").removeEvents("transitionend");
        };

        if (this.options.useTransitions) {
            this.box.addEvent("transitionend", completeCallback);
            this.box.removeClass(this.options.transitionShowClass);
        }
        else {
            this.box.morph(this.options.fx.properties.hide);
        }
        this.hideTimer = completeCallback.delay(this.options.fx.duration);

        this.isShown = false;
        if (this.options.overlay)
            this.overlay.hide();

        this.fireEvent('hide');

        return this;
    },

    fill: function(options){
        var self = this, mapper = function(e){
            if (options[e] !== undefined)
                self.element.getElement('div.modal-' + e).set("html", options[e]);
        };

        ['header', 'body', 'footer'].each(mapper);

        this.offsetSize = this.element.getElements('div.modal-header, div.modal-footer').getSize();
        this.limitHeight();
        return this;
    },

    setTitle: function(title) {
        var obj = {
            header: title || ""
        };

        this.fill(obj);
        this.fireEvent("content", obj);
        return this;
    },

    setBody: function(body) {
        var obj = {
            body: body || ""
        };

        this.fill(obj);
        this.fireEvent("content", obj);
        return this;
    },

    setFooter: function(footer) {
        var obj = {
            footer: footer || ""
        };

        this.fill(obj);
        this.fireEvent("content", obj);
        return this;
    },

    limitHeight: function(){
        if(this.options.limitHeight) this.content.setStyle('max-height', window.getSize().y - this.offsetSize[0].y - this.offsetSize[1].y - this.options.margin * 2);
    }

});

Modal.BootStrap = new Class({
    /*
        this class will add dom bootstrap func for modal use w/o specific javascript func / calls by virtue of data-elements
    */

    Extends: Modal.Base,

    options: {
        modalLinks: ".modal-overlay",
        buttonsZen: "div.clearfix.modal-buttons",
        loadingContent: "loading...",
        autoOpenByHash: true,
        props: {
            href: "href",
            modalType: "data-type",
            modalTitle: "data-title",
            modalBody: "data-body",
            modalButtons: "data-buttons",
            modalFooter: "data-footer",
            modalOverlay: "data-overlay",
            modalEasyClose: "data-any-close",
            modalEscClose: "data-esc-close",
            modalOpenEvent: "data-event-open",
            modalCloseEvent: "data-event-close",
            modalCustomClass: "data-class"
        }
    },

    handledOptions: {},

    initialize: function(container, options) {
        this.setOptions(options);
        this.parent(container, this.options);
        this.attachBootstrap();
        this.options.autoOpenByHash && this.applyHash();
        this.fireEvent("ready");
    },

    attachBootstrap: function(mask) {
        // what elements to listen on.
        mask = mask || this.options.modalLinks;
        this.container.addEvent(["click:relay(",mask,")"].join(""), this.handleClick.bind(this));
        return this;
    },

    handleClick: function(e) {
        // when container click has found a match
        e && e.preventDefault && e.preventDefault();

        var el = e.target;
        if (!el)
            return;

        // grab all properties we want
        var props = {};
        Object.each(this.options.props, function(value, key) {
            props[key] = el.get(value) || "";
        });

        var self = this;
        // store local options as they override the class options, more than 1 instance can exist
        // and can behave differently. see .show which stores the passed options.
        var options = Object.clone(this.options);

        // overlay?
        if (props.modalOverlay) {
            options.overlay = !!JSON.decode(props.modalOverlay);
        }

        // any click closes on modal
        if (props.modalEasyClose) {
            options.anyClose = !!JSON.decode(props.modalEasyClose);
        }

        // allow close by pressing ESC key
        if (props.modalEscClose) {
            options.escClose = !!JSON.decode(props.modalEscClose);
        }

        // is it already shown? only works w/o overlay as it's click-driven. acts as toggle.
        if (this.getId() == el.uid && this.isShown) {
            this.hide();
            return;
        }

        // custom events
        if (this.boundOpenEvent)
            this.removeEvent("show", this.boundOpenEvent);
        if (this.boundCloseEvent)
            this.removeEvent("hide", this.boundCloseEvent);

        if (props.modalOpenEvent) {
            // open
            this.boundOpenEvent = this.boundOpenEvent || this.fireEvent.bind(this, props.modalOpenEvent);
            this.addEvent("show", this.boundOpenEvent);
        }

        if (props.modalCloseEvent) {
            // close
            this.boundCloseEvent = this.boundCloseEvent || this.fireEvent.bind(this, props.modalCloseEvent);
            this.addEvent("hide", this.boundCloseEvent);
        }

        if (props.modalCustomClass) {
            // add and remove class on show/hide, eg, .autoWidth as per demo.
            options.openClass = props.modalCustomClass;
        }

        // set an ID so that it knows the trigger element (for toggle)
        this.setId(el.uid);

        // set the title of the modal
        this.setTitle(this.getData(props.modalTitle));

        // have we got modal buttons behaviour attached by data
        if (props.modalButtons) {
             var buttons = JSON.decode(props.modalButtons);
             if (buttons && buttons.length) {
                this.setFooter("");
                 // wrap it in this
                var holder = new Element(this.options.buttonsZen);

                Array.each(buttons, function(obj) {
                    var button = new Element("button", {
                        "class": obj.className,
                        html: obj.text
                    }).inject(holder).addClass(self.options.transitionClass);

                    if (obj.event) {
                        button.addEvent("click", function(event) {
                            self.fireEvent(obj.event);
                        })
                    }
                });

                holder.inject(this.footer);
            }

        }
        else {
            // else, look for a normal footer prop
            this.setFooter(this.getData(props.modalFooter));
        }

        // save instance options
        this.handledOptions[this.getId()] = options;

        // what content to get, element or ajax are suported for now.
        var val = props.modalBody || props.href;
        switch (props.modalType) {
            case "ajax":
                new Request({
                    method: "get",
                    url: val,
                    onRequest: function() {
                        // spinner or text, whatever.
                        // self.setBody(self.options.loadingContent);
                        // self.show(options);
                    },
                    onSuccess: function() {
                        // set the body
                        self.setBody(this.response.text).show(options, el);
                    },
                    onFailure: function() {
                        self.setBody("Contents did not load. Close and try again").show(options, el);
                    }
                }).send();
                break;
            default:
                // get data from the href property as element directly
                this.setBody(this.getData(val, !!props.href || !!props.modalBody));
                this.show(options, el);
            break;
        }
    },

    show: function(options) {
        if (this.handledOptions[this.getId()].openClass)
            this.box.addClass(this.handledOptions[this.getId()].openClass);
        this.parent(options);
    },

    hide: function() {
        this.parent();
        if (this.handledOptions[this.getId()].openClass) {
            this.box.removeClass.delay(500, this.box, this.handledOptions[this.getId()].openClass);
        }

        if (this.savedHash && this.savedHash === location.hash) {
            this.savedHash = false;
            history.back();
        }
    },

    getData: function(prop, hashChange) {
        // internal that converts a property into data (html) or returns property itself.
        var words = prop.split(/\s/);
        if (words.length === 1) {
            var target = document.id(words[0].replace('#', ''));
            if (target) {
                if (hashChange && location.hash != words[0]) {
                    this.savedHash = location.hash = words[0];
                }
                return target.get("html");
            }
        }

        // is it an image?
        var parts = prop.split(".");
        if (parts.length) {
            var extenstion = parts.getLast().toLowerCase();

            if (['jpg','png','jpeg','gif'].contains(extenstion))
                return ["<img src='", prop, "' />"].join("")
        }


        return prop;
    }.protect(),

    applyHash: function() {
        // try to open a link to an id managed by an event handler automatically
        var hash = window.location.hash;
        if (!hash)
            return;

        var trigger = document.getElement([this.options.modalLinks, "[href=", hash, "]"].join("")) || document.getElement([this.options.modalLinks, "[", this.options.props.modalBody, "=", hash, "]"].join(""));
        if (trigger) {
            this.container.fireEvent("click", {
                target: trigger
            });
        }
    }

}); // end class


})();
