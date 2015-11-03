'use strict';
describe('-> MVC Tests:', function() {
    it('should have "extend" and "isObject" methods', function() {
        expect(typeof mvc.extend).toEqual('function');
        expect(typeof mvc.isObject).toEqual('function');
    });

    it('"extend" method should extend objects', function() {
        var obj1 = {
                key1: 1,
                key2: 2
            },
            obj2 = {
                key3: 3,
                key4: 4
            },
            obj = mvc.extend(obj1, obj2);

        expect(obj.key1 + obj.key2 + obj.key3 + obj.key4).toEqual(10);
    });


    it('"isObject" method should return is param represent object or not', function () {
        expect(mvc.isObject({})).toBe(true);
        expect(mvc.isObject([])).toBe(true);
        expect(mvc.isObject('object')).toBe(false);
        expect(mvc.isObject(1)).toBe(false);
        expect(mvc.isObject(true)).toBe(false);
        expect(mvc.isObject(undefined)).toBe(false);
        expect(mvc.isObject(null)).toBe(false);
    });

    it('should include Observer, Model, View, Controller and Application instances', function () {
        expect(mvc.Observer).toBeDefined();
        expect(mvc.Model).toBeDefined();
        expect(mvc.View).toBeDefined();
        expect(mvc.Controller).toBeDefined();
        expect(mvc.Application).toBeDefined();
    });


    describe('Observer:', function () {
        var observer = Object.create(mvc.Observer),
           callback = jasmine.createSpy();

        it('should have "on", "off" and "dispatch" methods', function () {
            expect(typeof observer.on).toEqual('function');
            expect(typeof observer.off).toEqual('function');
            expect(typeof observer.dispatch).toEqual('function');
        });

        it('"on" method should create Observer listeners object and add listeners into it', function () {
            var eventName = 'eventStr';

            observer.on(eventName, callback, this);
            expect(observer.listeners).toBeDefined();
            expect(observer.listeners[eventName].length).toBe(1);
            expect(observer.listeners[eventName][0]).toEqual({
                'listener': callback,
                'context': this
            });

            eventName = {
                'eventObj': callback
            };

            observer.on(eventName, this);

            expect(observer.listeners['eventObj'].length).toBe(1);
            expect(observer.listeners['eventObj'][0]).toEqual({
                'listener': callback,
                'context': this
            });
        });

        it('"dispatch" method should call all listeners for triggered event', function () {
            observer.dispatch('eventStr', 'data1');
            expect(callback).toHaveBeenCalledWith('data1');

            observer.dispatch('eventObj', 'data2');
            expect(callback).toHaveBeenCalledWith('data2');
            expect(callback.calls.count()).toBe(2);
        });

        it('"off" method should delete one listener, listeners of event name or all listeners', function () {
            observer.off('eventObj', callback);
            expect(observer.listeners['eventObj'][0]).not.toBeDefined();

            observer.off('eventObj');
            expect(observer.listeners['eventObj']).not.toBeDefined();

            observer.off();
            expect(observer.listeners).not.toBeDefined();
        });
    });

    describe('Model:', function () {
        var model = new mvc.Model;
        it('should be a function', function () {
            expect(typeof mvc.Model).toEqual('function');
        });

        it('an instance should have a data object', function () {
            expect(mvc.isObject(model.data)).toBe(true);
        });

        it(' an instance should have extended options from Observer', function () {
            expect(typeof model.on).toEqual('function');
            expect(typeof model.off).toEqual('function');
            expect(typeof model.dispatch).toEqual('function');
        });

        it('an instance should have "getData", "isValid", "setData" methods', function () {
            expect(typeof model.getData).toEqual('function');
            expect(typeof model.isValid).toEqual('function');
            expect(typeof model.setData).toEqual('function');
        });
    });

    describe('View:', function () {
        it('should be a function', function () {
            expect(typeof mvc.View).toEqual('function');
        });

        it('an instance should have an element', function () {
            var view = new mvc.View;
            expect(view.element).toBe(document.body);
        });
    });

    describe('Contoller:', function () {
        it('should be a function', function () {
            expect(typeof mvc.Controller).toEqual('function');
        });

        it('an instance should have "init" method', function () {
            var controller = new mvc.Controller;
            expect(typeof controller.init).toEqual('function');
        });
    });

    describe('Application:', function () {
        var test = {
                app: mvc.Application.extend(),
                controller: mvc.Controller
            },
            app;

        app = new test.app(test.controller);

        it('should be a function', function () {
            expect(typeof mvc.Application).toEqual('function');
        });

        it('an instance should have start mathod', function () {
            expect(typeof app.start).toEqual('function');
        });
    });
});