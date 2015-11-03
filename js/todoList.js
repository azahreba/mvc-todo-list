"use strict";
window.onload = function () {

    /*MVC CONSTRUCTOR MODULE*/
    var mvc = (function (lib) {
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
            isObject: (!!lib && lib.isObject) || function (obj) {
                //_.isObject
                var type = typeof obj;
                return type === 'function' || type === 'object' && !!obj;
            }
        };

        var Observer = mvc.Observer = {
            on: function (eventName, listener, context) {
                this.listeners || (this.listeners = {});
                if (mvc.isObject(eventName)) {
                    // In this case context will be passed obviously as the second param
                    context = listener;

                    for (var event in eventName) {
                        this.on(event, eventName[event], context);
                    }

                    return;
                }

                if (!this.listeners[eventName]) {
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
                    return;
                }

                if (this.listeners[eventName] && !listener) {
                    delete this.listeners[eventName];
                    return;
                }

                if (this.listeners[eventName] && listener) {
                    for (i = 0, length = this.listeners[eventName].length; i < length; i++) {
                        if (this.listeners[eventName][i].listener === listener) {
                            this.listeners[eventName].splice(i, 1);
                            return;
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
                    for (i = 0, l = this.listeners[eventName].length; i < l; i++) {
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

        Model.prototype.getData = function () {
        };

        Model.prototype.isValid = function () {
            return true;
        };

        Model.prototype.setData = function () {
        };

        /*View*/
        var View = mvc.View = function () {
            this.element = document.body;
        };
        mvc.extend(View.prototype, Observer);

        /*Controller*/
        var Controller = mvc.Controller = function () {
        };
        mvc.extend(Controller.prototype, Observer);
        Controller.prototype.init = function () {
        };

        /*Application*/
        var Application = mvc.Application = function (initController) {
            var controller = initController ? new initController : new mvc.Controller;
            this.start(controller);
        };

        Application.prototype.start = function (controller) {
            controller.init();
        };

        var extend = function (props) {
            var parent = this;
            var child = function () {
                return parent.apply(this, arguments);
            };

            mvc.extend(child, parent);

            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            if (props) {
                mvc.extend(child.prototype, props);
            }

            child.__parent__ = parent.prototype;

            return child;
        };

        View.extend = Model.extend = Controller.extend = Application.extend = extend;

        return mvc;
    })();


    /*TO DO LIST CONSTRUCTOR MODULE*/
    var todoList = (function () {
        var todoList = {
            m: {},
            v: {},
            c: {}
        };

        /*LIST MODEL*/
        todoList.m.ListModel = mvc.Model.extend({
            LSKey: "simple_list",
            getData: function () {
                var lsData = localStorage.getItem(this.LSKey),
                    lsDataArray = lsData !== undefined && JSON.parse(lsData);

                this.createList();
                if (Array.isArray(lsDataArray) && lsDataArray.length) {
                    lsDataArray.forEach(function (lsItem) {
                        this.addItemModel(lsItem.text, lsItem.status, Number(lsItem.id));
                    }.bind(this));
                    this.dispatch("done", this.getDataView());
                } else {
                    this.dispatch("emptyList");
                }
            },

            setData: function () {
                this.isValid() && this.LSKey && localStorage.setItem(this.LSKey, JSON.stringify(this.getDataForLS()));
            },

            getDataForLS: function () {
                var exportArray = [];
                this.data.items.forEach(function (itemModel) {
                    exportArray.push(itemModel.getDataToExport());
                });
                return exportArray;
            },

            createList: function () {
                this.data = {
                    items: [],
                    itemsCount: 0
                };
            },

            addItem: function (str) {
                var model;
                if (this.data.itemsCount < 6) {
                    model = this.addItemModel(str);

                    if (this.isValid()) {
                        this.setData();
                        this.dispatch('itemWasAdded', {
                            item: {
                                text: model.getText(),
                                id: model.getId()
                            },
                            count: this.data.itemsCount
                        });
                    }
                }
            },

            addItemModel: function (text, status, id) {
                var newItemModel = new todoList.m.TaskModel;

                newItemModel.text = text;
                newItemModel.status = status || 'active';
                newItemModel.id = id || this.generateId();

                this.data.items.push(newItemModel);
                this.data.itemsCount = this.data.items.length;

                return newItemModel;
            },

            generateId: function () {
                return this.data.itemsCount ? this.data.items[this.data.itemsCount - 1].getId() + 1 : 0;
            },

            getDataView: function () {
                var exportObject = {
                    items: []
                };
                this.data.items.forEach(function (item) {
                    exportObject.items.push({
                        text: item.getText(),
                        id: item.getId()
                    });
                });

                exportObject.count = this.data.itemsCount;

                return exportObject;
            },

            removeItem: function (itemId) {
                var changed = false;

                this.data.items = this.data.items.filter(function (item) {
                    if (item.id === itemId) {
                        changed = true;
                        return false;
                    }
                    return true;
                });

                if (changed) {
                    this.data.itemsCount = this.data.items.length;
                    this.setData();
                }

                this.dispatch('itemWasRemoved', {
                    id: itemId,
                    count: this.data.itemsCount
                });
            }
        });

        /*TASK MODEL*/
        todoList.m.TaskModel = mvc.Model.extend({
            getText: function () {
                return this.text;
            },
            getId: function () {
                return this.id;
            },
            getDataToExport: function () {
                var text = this.text,
                    status = this.status,
                    id = this.id;

                return {
                    text: text,
                    status: status,
                    id: id.toString()
                };
            }
        });

        /*LIST VIEW*/
        todoList.v.ListView = mvc.View.extend({
            init: function () {
                this.itemsViews = [];
                this.element = document.getElementById('listContainer');
                this.initTabs();
                this.defineElements();
                this.addDefaultListeners();
            },

            initTabs: function () {
                var links = this.element.getElementsByTagName('a'),
                    i;

                for (i = 0; i < links.length; i++) {
                    links[i].addEventListener('click', function (e) {
                        e.currentTarget.parentNode.getElementsByTagName('input')[0].checked = true;
                    }, false);
                }
                links[1].click();
            },

            defineElements: function () {
                this._txtNewItem = this.element.getElementsByClassName('new-item')[0];
                this._itemsContainer = this.element.getElementsByClassName('items-container')[0];
                this._statisticsContainer = this.element.getElementsByClassName('statistics')[0];
                this._btnAddItem = this.element.getElementsByClassName('btn-add-item')[0];
            },

            addDefaultListeners: function () {
                this._btnAddItem.addEventListener("click", this.addItem.bind(this), false);
            },

            addItem: function (e) {
                var text = this._txtNewItem.value;

                e = e || window.event;
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }

                text.trim() && this.dispatch('addItem', text);
                this._txtNewItem.value = '';
                this._txtNewItem.focus();
            },

            removeItemView: function (id) {
                this.itemsViews = this.itemsViews.filter(function (itemView) {
                    if (itemView.id === id) {
                        itemView.removeItemNode();
                        return false;
                    }
                    return true;
                });
            },

            renderNewItem: function (data, isNew) {
                var newItem = new todoList.v.TaskView;

                newItem.text = data.text;
                newItem.id = data.id;

                this.itemsViews.push(newItem);
                newItem.init();
                newItem.dispatchFromParent = function (event, data) {
                    this.dispatch(event, data);
                }.bind(this);
                this._itemsContainer.appendChild(newItem.getItemNode(isNew));
            },

            renderItems: function (items) {
                items.forEach(function (item) {
                    this.renderNewItem(item, false);
                }.bind(this));

                setTimeout(function () {
                    this.rotateItems.go(this.itemsViews);
                }.bind(this), 1000);
            },

            setStatisticsText: function (count) {
                this._statisticsContainer.innerText = count + ' item(s) in list on Today';
            },

            rotateItems: {
                go: function (views) {
                    var counter = 0;
                    this.items = views;
                    this.rotateOne(counter);
                    this.interval = setInterval(function () {
                        this.rotateOne(++counter, views)
                    }.bind(this), 500);
                },
                rotateOne: function (id) {
                    if (this.items[id]) {
                        this.items[id].rotateAddOne();
                    } else {
                        clearInterval(this.interval);
                    }
                }
            }
        });

        /*TASK VIEW*/
        todoList.v.TaskView = mvc.View.extend({
            template: function (itemText, itemId) {
                return '<input class="item" value="' + itemText + '" disabled/>' +
                    '<span class="item-settings item-check" item-id="' + itemId +
                    '"><i class="fa fa-check"></i></span>' +
                    '<span class="item-settings item-edit" item-id="' + itemId +
                    '"><i class="fa fa-pencil"></i></span>' +
                    '<span class="item-settings item-delete" item-id="' + itemId +
                    '"><i class="fa fa-remove"></i></span>';
            },
            init: function () {
                this.createViewElement();
                return this;
            },

            createViewElement: function () {
                var el = document.createElement('div');
                el.className = 'item-wrapper';
                el.setAttribute('id', 'itemId' + this.id);

                this.element = el;
            },

            removeItem: function (e) {
                var id;

                e = e || window.event;
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }

                id = Number(e.currentTarget.getAttribute('item-id'));

                if (id || id === 0) {
                    this.dispatchFromParent('removeItem', id);
                }
            },

            getItemNode: function (isNew) {
                this.element.innerHTML = this.template(this.text, this.id.toString());

                //TODO: Add listeners for item's check and edit
                //this.element.getElementsByClassName('item-check')[0].addEventListener("click", checkItem, false);
                //this.element.getElementsByClassName('item-edit')[0].addEventListener("click", editItem, false);
                this.element.getElementsByClassName('item-delete')[0].addEventListener("click", this.removeItem.bind(this), false);

                isNew && setTimeout(function () {
                    this.rotateAddOne();
                }.bind(this), 0);

                return this.element;
            },

            removeItemNode: function () {
                this.rotateDeleteOne();
                setTimeout(function () {
                    this.element.remove();
                }.bind(this), 500);
            },

            rotateAddOne: function () {
                this.element.className += ' item-wrapper-rotate';
            },

            rotateDeleteOne: function () {
                this.element.className = 'item-wrapper';
            }
        });

        /*LIST CONTROLLER*/
        todoList.c.ListController = mvc.Controller.extend({
            model: new todoList.m.ListModel,
            view: new todoList.v.ListView,

            init: function () {
                this.model.on({
                    'done': this.renderAllItems,
                    'itemWasAdded': this.renderOneItem,
                    'itemWasRemoved': this.removeOneItem
                }, this);

                this.view.on({
                    'addItem': this.addItemToModel,
                    'removeItem': this.removeItemFromModel
                }, this);

                this.view.init();
                this.model.getData();
            },

            addItemToModel: function (text) {
                this.model.addItem(text);
            },

            removeItemFromModel: function (id) {
                this.model.removeItem(id);
            },

            renderOneItem: function (data) {
                this.view.renderNewItem(data.item, true);
                this.view.setStatisticsText(data.count);
            },

            removeOneItem: function (data) {
                this.view.removeItemView(data.id);
                this.view.setStatisticsText(data.count);
            },

            renderAllItems: function (data) {
                this.view.renderItems(data.items);
                this.view.setStatisticsText(data.count);
            }
        });

        todoList.Application = mvc.Application.extend();

        return new todoList.Application(todoList.c.ListController);
    })();

    var todoListApp = todoList;
};