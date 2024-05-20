const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

// Event listener to load todos when the DOM content is loaded
document.addEventListener("DOMContentLoaded", displayTodos());

// Event listener for adding a new todo
todoButton.addEventListener("click", addTodo);

// Event listener for handling todo item actions (e.g., completing, editing, deleting)
todoList.addEventListener("click", handleTodoClick);

// Event listener for filtering todos
filterOption.addEventListener("change", filterTodo);

// Function to add a new todo
function addTodo(event) {
    event.preventDefault();

    const todoText = todoInput.value.trim();
    const dueDateInput = document.querySelector(".due-date-input");

    if (!dueDateInput || !dueDateInput.value.trim()) {
        console.error("Due date input not found or empty");
        return;
    }

    const dueDate = dueDateInput.value.trim();

    if (todoText === "") {
        console.error("Todo text is empty");
        return;
    }
	
	
	
    saveLocalTodo({
        text: todoText,
        dueDate: dueDate,
        completed: false // Initialize as not completed
    });
	
    
	displayTodos(); 
    todoInput.value = "";
    dueDateInput.value = ""; // Clear due date input
}

// Function to display todos from local storage
function displayTodos() {
    const todos = getLocalTodos();


  	const TodayTodos = document.getElementById("TodayTodos").querySelector(".todo-list");
    const TomorrowTodos = document.getElementById("TomorrowTodos").querySelector(".todo-list");
    const UpcomingTodos = document.getElementById("UpcomingTodos").querySelector(".todo-list");

    TodayTodos.innerHTML = "";
    TomorrowTodos.innerHTML = "";
    UpcomingTodos.innerHTML = "";

    let date = new Date();
    let today = date.toISOString().split('T')[0];

    let tomorrowDate = new Date(date);
    tomorrowDate.setDate(date.getDate() + 1);
    let tomorrow = tomorrowDate.toISOString().split('T')[0];

    let upcomingDate = new Date(date);
    upcomingDate.setDate(date.getDate() + 2);
    let upcoming = upcomingDate.toISOString().split('T')[0];

    todos.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB;
    });

    // Categorize todos based on due date
    todos.forEach(todo => {
        const todoDiv = createTodoElement(todo);
        const dueDate = todo.dueDate;

        if (dueDate === today) {
            TodayTodos.appendChild(todoDiv);
        } else if (dueDate === tomorrow) {
            TomorrowTodos.appendChild(todoDiv);
        } else if (new Date(dueDate) > new Date(tomorrow)) {
            UpcomingTodos.appendChild(todoDiv);
        }
    });
	   
	
	document.querySelectorAll('.todo-list').forEach(list => {
        list.addEventListener('click', handleTodoClick);
    });
}

// Function to create a todo element
function createTodoElement(todo) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

 	const newTodo = document.createElement("li");
	newTodo.innerText = todo.text;
	newTodo.classList.add("todo-item");
	newTodo.style.display = "block"; // Ensure newTodo is visible initially
	todoDiv.appendChild(newTodo);

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.classList.add("edit-input");
    editInput.value = todo.text;
    editInput.style.display = "none"; // Initially hidden
    todoDiv.appendChild(editInput); 
	
    const editDate = document.createElement("input");
    editDate.type = "date";
    editDate.classList.add("todo-date");
    editDate.value = todo.dueDate;
    editDate.style.display = "block";
    todoDiv.appendChild(editDate);

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add("edit-btn");
    todoDiv.appendChild(editButton);

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);
	
	 editDate.addEventListener("change", function() {
        updateLocalTodoStatus(todoDiv);
    });

    return todoDiv;
}

// Function to handle todo item actions
function handleTodoClick(event) {
    const clickedElement = event.target;
    const todoDiv = clickedElement.closest(".todo");
	const todoItem = todoDiv.querySelector(".todo-item");
    const editInput = todoDiv.querySelector(".edit-input");
    const dateSpan = todoDiv.querySelector(".todo-date"); 

    if (clickedElement.classList.contains("complete-btn")) {
        todoDiv.classList.toggle("completed");
        updateLocalTodoStatus(todoDiv);
    } else if (clickedElement.classList.contains("edit-btn")) {
       if (todoItem.style.display === "none") {
            // Switch to normal mode
            todoItem.style.display = "block";
            editInput.style.display = "none";
            dateSpan.style.display = "block";
            
            // Update todo text if changed
           updateLocalTodoStatus(todoDiv); 
        } else {
            // Switch to edit mode
            todoItem.style.display = "none";
            editInput.style.display = "block";
            dateSpan.style.display = "block";

            dateSpan.focus(); // Focus on the date input field
            editInput.focus(); // Focus on the edit input field
        }
    } else if (clickedElement.classList.contains("trash-btn")) {
        todoDiv.classList.add("slide");
        removeLocalTodo(todoDiv);
        todoDiv.addEventListener("transitionend", function () {
            todoDiv.remove();
        });
    }
}

// Function to filter todos
function filterTodo() {
    const todos = Array.from(todoList.children);
    const filterValue = filterOption.value;
	
    todos.forEach(todo => {
        switch (filterValue) {
            case "all":
                todo.style.display = "flex";
                break;
            case "completed":
                todo.style.display = todo.classList.contains("completed") ? "flex" : "none";
                break;
            case "incomplete":
                todo.style.display = todo.classList.contains("completed") ? "none" : "flex";
                break;
        }
    });
}

// Function to save a todo to local storage
function saveLocalTodo(todo) {
    const todos = getLocalTodos();
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to retrieve todos from local storage
function getLocalTodos() {
    return JSON.parse(localStorage.getItem("todos")) || [];
}

// Function to remove a todo from local storage
function removeLocalTodo(todoDiv) {
    const todoText = todoDiv.querySelector(".todo-item").innerText;
    const todos = getLocalTodos().filter(todo => todo.text !== todoText);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to update the completion status of a todo in local storage
function updateLocalTodoStatus(todoDiv) {
    const todoItem = todoDiv.querySelector(".todo-item");
    const editInput = todoDiv.querySelector(".edit-input");
    const editDate = todoDiv.querySelector(".todo-date");

    console.log("Original Text:", todoItem.innerText);
    console.log("Edited Text:", editInput.value);
    console.log("Original Due Date:", editDate.dataset.originalDate);
    console.log("Edited Due Date:", editDate.value);

    const todos = getLocalTodos();

    // Find the index of the todo to update
    const todoIndex = Array.from(todoDiv.parentNode.children).indexOf(todoDiv);

    console.log("Todo Index:", todoIndex);

    if (todoIndex !== -1) {
        // Update the todo text and dueDate
        todoItem.innerText = editInput.value;
        todos[todoIndex].dueDate = editDate.value;

        console.log("Updated Todos:", todos);
		   // Update the todo item text in the UI
        todoItem.innerText = editInput.value;


        // Save updated todos back to localStorage
        localStorage.setItem("todos", JSON.stringify(todos));
    }
}

