(function () {
    // Функция создания заголовка
    function createAppTitle(title) {
        // Создаём тег заголовок <h2>
        let appTitle = document.createElement('h2');
        // Вкладываем текст переданный аргументом функции в <h2>
        appTitle.innerHTML = title;
        // Возвращаем DOM элемент
        return appTitle;
    }
    // Функция создания формы (поле ввода и кнопка)
    function createTodoItemForm() {
        //Создаём элементы формы
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWrapper = document.createElement('div');
        let button = document.createElement('button');
        // Присваиваем элементам формы классы из bootstrap
        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        // Устанавливаем placeholder для поля ввода
        input.placeholder = 'Введите название дела';
        // Присваиваем элементам формы классы из bootstrap
        buttonWrapper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.setAttribute('disabled', true);
        // Задаём текст кнопки
        button.textContent = 'Добавить дело';
        // Помещаем кнопку в контейнер для кнопки
        buttonWrapper.append(button);
        // Помещаем поле ввода в форму
        form.append(input);
        // Помещаем контейнер с кнопкой в форму
        form.append(buttonWrapper);
    
        //Отслеживаем ввод текста в input.
        // При вводе текста кнопка "Добавить дело" становиться активной
        input.oninput = function () {
            button.disabled = false;
        }
    
        // Функция возвращает объект с формой, полем ввода и кнопкой, для того чтобы в дальнейшем иметь к ним доступ
        return {
            form,
            input,
            button
        };
    }
    
    //Функция создания списка
    function createTodoList() {
        // Создаём список
        let list = document.createElement('ul');
        // Присваиваем списку класс из bootstrap
        list.classList.add('list-group');
        // Функция возвращает список
        return list;
    }
    
    // Функция создания элементов списка
    // В аргументы принимает ключ списка "nameList" из "localStorage" и объект на основе которого будет создаваться элемент списка
    function createTodoItemElement(todoItem, {onDone, onDelete}) {
        const doneClass = 'list-group-item-success';
        // Создаём элемент списка
        let item = document.createElement('li');
        // Создаём контейнер для кнопок
        let buttonGroup = document.createElement('div');
        // Создаём кнопку для изменения статуса дела
        let doneButton = document.createElement('button');
        // Создаём кнопку для удаления дела
        let deleteButton = document.createElement('button');
    
        // Присваиваем элементу списка классы из bootstrap
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        if (todoItem.done) {
            item.classList.add(doneClass);
        }
        // В элемент списка помещаем поле 'name' из объекта переданного в аргумент функции
        item.textContent = todoItem.name;
        
        // Присваиваем кнопкам классы из bootstrap и вставляем необходимый текст
        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = 'Готово';
        deleteButton.classList.add('bdt', 'btn-danger');
        deleteButton.textContent = 'Удалить';



        // Отслеживаем событие "click" на кнопке изменения статуса
        doneButton.addEventListener('click', async function () {
            onDone({todoItem, element: item});
            // переключатель класса отвечающего за цвет фона элемента списка
            item.classList.toggle(doneClass, todoItem.done);

        })

        // Отслеживаем событие "click" на кнопке удаления элемента
        deleteButton.addEventListener ('click', async function(){
            onDelete({todoItem, element: item});
        });
        
        // Помещаем в контейнер для кнопок кнопки
        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        // Помещаем в элемент списка контейнер с кнопками
        item.append(buttonGroup);

        // Функция возвращает созданный элемент
        return item;
    }

    

    // Функция формирует приложение на основе данных, возвращаемы функциями написанных выше.
    // В аргументы передаётся контейнер в который будет помещаться приложение и заголовок
    async function createTodoApp(container, title, nameList) {
        // Помещаем в переменную результат выполнения функции создания заголовка
        let todoAppTitle = createAppTitle(title);
        // Помещаем в переменную результат выполнения функции создания формы
        let todoItemForm = createTodoItemForm();
        // Помещаем в переменную результат выполнения функции создания списка
        let todoList = createTodoList();

        const handlers = {
            onDone( { todoItem } ) {
                todoItem.done = !todoItem.done;
                fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({done: todoItem.done}),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            },

            onDelete ( { todoItem, element } ) {
                if (!confirm('Вы уверены?')) {
                    return;
                }
                element.remove();
                fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
                    method: 'DELETE',
                })
            },
        }
    
        // Помещаем в контейнер заголовок
        container.append(todoAppTitle);
        // Помещаем в контейнер форму с кнопкой (для ввода данных)
        container.append(todoItemForm.form);
        // Помещаем в контейнер пустой список
        container.append(todoList);

        const response = await fetch('http://localhost:3000/api/todos');
        const availableList = await response.json();

        availableList.forEach(todoItem => {
            if (todoItem.owner === nameList) {
                const todoItemElement = createTodoItemElement(todoItem, handlers);
                todoList.append(todoItemElement);
            }
        });
            

        // Обращаемся к форме через объект полученный в резултате выполнения функции createTodoItemForm() 
        // и отслеживаем событие 'submit'(отправка формы)
        // Если событие 'submit' произойдет, то выполнится код в function(e)
        todoItemForm.form.addEventListener('submit', async (e) => {
            // preventDefault - отменяет отправку формы (нет перезагрузки страницы)
            e.preventDefault();
            // Если поле ввода не true, т.е. пустое, то при нажатии на кнопку отправки функция остановит своё выполнение
            if(!todoItemForm.input.value){
                return;
            } 

            const response = await fetch('http://localhost:3000/api/todos', {
                method: 'POST',
                body: JSON.stringify({
                    name: todoItemForm.input.value.trim(),
                    owner: nameList,
                    done: false,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const todoItem = await response.json();
            console.log(todoItem);

            // В переменную помещаем объект с элементами списка созданный функцией 'createTodoItem', в которую аргументом передан созданный объект дела.
            let todoItemElement = createTodoItemElement(todoItem, handlers);
    
            // добавляем в список сформированный элемент списка
            todoList.append(todoItemElement);
            // Делаем поле ввода путым
            todoItemForm.input.value = '';
            // Делаем кнопку "Добавить дело" не активной
            todoItemForm.button.disabled = true;
        });
    }
    // Добавляем в глобальный объект "window" метод с именем "createTodoApp" со значением равным функции "createTodoApp()"
    window.createTodoApp = createTodoApp;
        
    })();