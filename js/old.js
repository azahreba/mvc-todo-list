//--------------------------------------------------------------------------

    function Publisher() {
        this.subscribers = [];
    }

    Publisher.prototype.deliver = function(data) {
        this.subscribers.forEach(
            function (fn) {
                fn(data);
            }
        );

        return this;
    };

    Function.prototype.subscribe = function(publisher) {
        publisher.subscribers.push(this);
        return this;
    };

    function ControlEvents() {
        var counter = 0,
 list = new List();

        this.init = function() {
 addListeners();
 renderSavedItems.subscribe(list.pub);

 list.init();
 };

/*DONE*/function addListeners () {
            var links = document.getElementById('listContainer').getElementsByTagName('a'),
                i;

            for (i = 0; i < links.length; i++) {
                links[i].addEventListener('click', function (e) {
                    e.currentTarget.parentNode.getElementsByTagName('input')[0].checked = true;
                },false);
            }
            links[1].click();

            btnAddItem.addEventListener("click", addItem, false);
        }

/*DONE*/function addItem (e) {
            var text = txtNewItem.value;

            e = e || window.event;
            if(e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }

            text && list.addItem(addItemNode, text);
            txtNewItem.value = '';
        }

        function removeItem (e) {
            var id;

            e = e || window.event;
            if(e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }

            id = Number(e.currentTarget.getAttribute('item-id'));

            (id || id ===0) && list.removeItem(removeItemNode, id);
        }

/*DONE*/function addItemNode (text, id, isNew) {
            var item = document.createElement('div');
            var template = function (itemText, itemId) {
                return '<input class="item" value="' + itemText + '" disabled/>' +
                    '<span class="item-settings item-check" item-id="' + itemId + '"><i class="fa fa-check"></i></span>' +
                    '<span class="item-settings item-edit" item-id="' + itemId + '"><i class="fa fa-pencil"></i></span>' +
                    '<span class="item-settings item-delete" item-id="' + itemId + '"><i class="fa fa-remove"></i></span>';
            };

            item.className = 'item-wrapper';
            item.setAttribute('id', 'itemId' + id);
            item.innerHTML = template(text, id.toString());

    //        btnItemCheck.addEventListener("click", removeItem, false);
    //        btnItemEdit.addEventListener("click", removeItem, false);
            item.getElementsByClassName('item-delete')[0].addEventListener("click", removeItem, false);

            itemsContainer.appendChild(item);
            isNew ? setTimeout(function () {rotateItems.rotateAddOne(item);}, 0) : rotateItems.add(item);
            counter++;
            setStatisticText();
        }

        function removeItemNode (id) {
            var item = document.getElementById('itemId' + id);
            rotateItems.rotateDeleteOne(item);
            setTimeout(function () {
                item.parentNode.removeChild(item);
            }, 500);

            counter--;
            setStatisticText();
        }

        function renderSavedItems (items) {
            if (items.length) {
                items.forEach(function (item) {
                    addItemNode(item.text, item.id);
                });

                setTimeout(function () {
                    rotateItems.go();
                }, 1000);

                counter = items ? items.length : 0;
                setStatisticText(counter);
            }
        }

        function setStatisticText () {
            statistic.innerText = counter + ' items in list';
        }

/*DONE*/var rotateItems = {
            items: [],
            counter: 0,
            add: function (itemNode) {
                this.items.push(itemNode);
                return this;
            },
            go: function () {
                this.rotateAddOne(this.items[0]);
                this.interval = setInterval(this.rotateAll.bind(this), 500);
            },
            rotateAll: function () {
                if (this.items[++this.counter]) {
                    this.rotateAddOne(this.items[this.counter]);
                } else {
                    clearInterval(this.interval);
                }
            },
            rotateAddOne: function (item) {
                item.className += ' item-wrapper-rotate';
            },
            rotateDeleteOne: function (item) {
                item.className = 'item-wrapper';
            }
        };
}

    function List () {
        var lsKey = 'simple_list';
        this.pub = new Publisher();

        this.init = function () {
/*DONE*/    getItems.call(this);
        };


/*DONE*/this.addItem = function (callback, text, priority, status) {
            var lastItem = this.items[this.items.length - 1],
                newItem = {
                    id: lastItem ? lastItem.id + 1 : 0,
                    text: text,
                    priority: priority || lastItem ? lastItem.priority + 1 : 0,
                    done: status || false
                };

            this.items.push(newItem);
            setItems.call(this);

            callback(text, newItem.id, true);
        };

        this.removeItem = function (callback, id) {
            var changed;

            this.items = this.items.filter(function (item) {
                if (item.id === id) {
                    changed = true;
                    return false;
                }
                return true;
            });
            setItems.call(this);

            changed && callback(id);
        };

        function getItemsForView (items) {
            var txtItems = [];
            if (items) {
                items.forEach(function (item) {
                    txtItems.push({text: item.text, id: item.id});
                });
}

return txtItems;
}

function getItems () {
    var lsArr = JSON.parse(localStorage.getItem(lsKey)),
        sendData;

    if (Object.prototype.toString.call(lsArr) === '[object Array]') {
        this.items = lsArr;
        sendData = getItemsForView(this.items);
        this.pub.deliver(sendData);
    }
}

function setItems () {
    localStorage.setItem(lsKey, JSON.stringify(this.items));
}
}

List.prototype.items = [];

var controller = new ControlEvents();
controller.init();
