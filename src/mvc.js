var lib;
var mvc = {
    extend: (!!lib && lib.extend) || function (obj) {
        //_.extend
        if (!this.isObject(obj)) return obj;

        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    },
    isObject: (!!lib && lib.isObject) || function(obj) {
        //_.isObject
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    }
};

var Observer = mvc.Observer = {
    on: function (eventName, listener, context) {
        this.listeners || (this.listeners = {});
        if (mvc.isObject(eventName)) {
            // in this case context will be passed obviously as the second param
            context = listener;

            for (var event in eventName) {
                this.on(event, eventName[event], context);
            }

            return ;
        }

        if(!this.listeners[eventName]){
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push({
            'listener': listener,
            'context': context || this
        });
    },

    off: function (eventName, listener) {
        var length,
            i;

        this.listeners || (this.listeners = {});

        if (!eventName) {
            delete this.listeners;
            return ;
        }

        if (this.listeners[eventName] && !listener) {
            delete this.listeners[eventName];
            return ;
        }

        if (this.listeners[eventName] && listener) {
            for (i = 0, length = this.listeners[eventName].length; i < length; i ++) {
                if (this.listeners[eventName][i].listener === listener) {
                    this.listeners[eventName].splice(i, 1);
                    return ;
                }
            }
        }
    },

    dispatch: function (eventName, data) {
        var handler,
            i,
            l;
        data = (data === void 0 || data === null) ? this : data;

        this.listeners || (this.listeners = {});

        if (this.listeners[eventName]) {
            for(i = 0, l = this.listeners[eventName].length; i < l; i++) {
                handler = this.listeners[eventName][i];
                handler.listener.call(handler.context, data);
            }
        }
    }
};

/*Model*/
var Model = mvc.Model = function () {
    this.data = {};
};

mvc.extend(Model.prototype, Observer);

Model.prototype.getData = function () {};

Model.prototype.isValid = function () {
    return true;
};

Model.prototype.setData = function () {};

/*View*/
var View = mvc.View = function () {
    this.element = document.body;
};
mvc.extend(View.prototype, Observer);

/*Controller*/
var Controller = mvc.Controller = function () {};
mvc.extend(Controller.prototype, Observer);
Controller.prototype.init = function () {};

/*Application*/
var Application = mvc.Application = function (initController) {
    var controller = initController ? new initController : new mvc.Controller;
    this.start(controller);
};

Application.prototype.start = function (controller) {
    controller.init();
};

var extend = function(props){
    var parent = this;
    var child = function(){
        return parent.apply(this, arguments);
    };

    mvc.extend(child, parent);

    var Surrogate = function(){this.constructor = child;};
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (props){
        mvc.extend(child.prototype, props);
    }

    child.__parent__ = parent.prototype;

    return child;
};

View.extend = Model.extend = Controller.extend = Application.extend = extend;