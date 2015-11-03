describe('-> TO DO List Tests:', function () {
    it('should be an object with "m", "v", "c" keys', function () {
        expect(mvc.isObject(todoList)).toBeTruthy();
        expect(mvc.isObject(todoList.m)).toBeTruthy();
        expect(mvc.isObject(todoList.v)).toBeTruthy();
        expect(mvc.isObject(todoList.c)).toBeTruthy();
    });

    describe('Models:', function () {
        describe('List Model:', function () {
            beforeEach(function () {
                this.model = new todoList.m.ListModel;
            });
            afterEach(function () {
                delete this.model;
            });

            it('an instance should have Local Storage key', function () {
                expect(typeof this.model.LSKey).toBe('string');
            });

            it('an instance should have methods', function () {
                expect(typeof this.model.getData).toBe('function');
                expect(typeof this.model.setData).toBe('function');
                expect(typeof this.model.getDataForLS).toBe('function');
                expect(typeof this.model.createList).toBe('function');
                expect(typeof this.model.addItem).toBe('function');
                expect(typeof this.model.addItemModel).toBe('function');
                expect(typeof this.model.generateId).toBe('function');
                expect(typeof this.model.getDataView).toBe('function');
                expect(typeof this.model.removeItem).toBe('function');
            });

            it('"getData" method should create model data', function () {
                spyOn(this.model, 'dispatch');
                spyOn(localStorage, 'getItem').and.returnValue("[]");
                this.model.getData();

                expect(this.model.dispatch).toHaveBeenCalledWith('emptyList');
                expect(this.model.data).toEqual({
                    items: [],
                    itemsCount: 0
                });
            });

            it('"getData" method should get items array from Local Storage and dispatch items', function () {
                spyOn(this.model, 'dispatch');
                spyOn(localStorage, 'getItem').and.returnValue('[{' +
                    '"text":"To do smth great!",' +
                    '"status":"active",' +
                    '"id":"0"' +
                    '}]');
                this.model.getData();

                expect(localStorage.getItem).toHaveBeenCalledWith(this.model.LSKey);
            });

            it('"setData" method should set items to Local Storage', function () {
                var exportItem;
                spyOn(localStorage, 'getItem').and.returnValue('[{' +
                    '"text":"To do smth great!",' +
                    '"status":"active",' +
                    '"id":"0"' +
                    '}]');

                this.model.getData();
                exportItem = {
                    text: this.model.data.items[0].text,
                    status: this.model.data.items[0].status,
                    id: this.model.data.items[0].id.toString()
                };

                spyOn(localStorage, 'setItem');
                spyOn(this.model, 'getDataForLS').and.returnValue(exportItem);

                this.model.setData();

                expect(localStorage.setItem).toHaveBeenCalledWith(this.model.LSKey, JSON.stringify(exportItem));
            });
        });
    });
});