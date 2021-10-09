const log = console.log;
log("시작");
let todo_input = document.querySelector(".new-todo");
const todo_list = document.querySelector(".todo-list");
const mainClassNode = document.querySelector(".main");
const toggleAllButton = document.querySelector(".toggle-all");
const filters = document.querySelectorAll(".filters li");
const clearButton = document.querySelector(".clear-completed");

function innerValue() {
  let toggle = false;

  return function () {
    toggle = !toggle;
    return toggle;
  };
}
const getInnerValue = innerValue();

todo_input.addEventListener("keydown", function (e) {
  //log(e.target.value);
  const KEY_DOWN = 13;
  if (e.keyCode === KEY_DOWN) {
    if (!e.target.value) {
      return;
    }

    const createLiTag = `
    <li>
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>${todo_input.value}</label>
        <button class="destroy"></button>
      </div>
    </li>
    `;

    const tempDivTag = document.createElement("div");
    tempDivTag.innerHTML = createLiTag;
    //log(tempDivTag.children[0]);

    todo_list.append(tempDivTag.children[0]);

    displayChange(mainClassNode, "block");
    todo_input.value = "";

    //log(todo_list);
  }
});

mainClassNode.addEventListener("click", function (element) {
  //element.preventDefault();
  const target = element.target;

  if (target.className === "destroy") {
    try {
      destroy(element);
    } catch (error) {
      log("destroy 에러");
    }
  } else if (target.className === "toggle") {
    try {
      toggle(element);
    } catch (error) {
      log("toggle 에러");
    }
  } else if (target.parentNode === filters[0]) {
    const todoNode = todo_list.children;
    Array.prototype.forEach.call(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");
      toggleNode.parentNode.style.display = "block";
    });
    filters[0].children[0].classList.remove("selected");
    filters[1].children[0].classList.remove("selected");
    filters[2].children[0].classList.remove("selected");
    target.classList.add("selected");
  } else if (target.parentNode === filters[1]) {
    const todoNode = todo_list.children;
    Array.prototype.forEach.call(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");

      if (toggleNode.checked) {
        toggleNode.parentNode.style.display = "none";
      } else {
        toggleNode.parentNode.style.display = "block";
      }
    });

    filters[0].children[0].classList.remove("selected");
    filters[1].children[0].classList.remove("selected");
    filters[2].children[0].classList.remove("selected");
    target.classList.add("selected");
  } else if (target.parentNode === filters[2]) {
    const todoNode = todo_list.children;
    Array.prototype.forEach.call(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");

      if (toggleNode.checked) {
        toggleNode.parentNode.style.display = "block";
      } else {
        toggleNode.parentNode.style.display = "none";
      }
    });

    filters[0].children[0].classList.remove("selected");
    filters[1].children[0].classList.remove("selected");
    filters[2].children[0].classList.remove("selected");
    target.classList.add("selected");
  }
});

toggleAllButton.addEventListener("click", (e) => {
  e.preventDefault();

  const todoNode = todo_list.children;
  const checkBool = getInnerValue();
  Array.prototype.forEach.call(todoNode, function (node, i) {
    const toggleNode = node.querySelector(".toggle");

    if (checkBool) {
      toggleNode.checked = true;
      todo_list.children[i].classList.add("completed");
    } else {
      toggleNode.checked = false;
      todo_list.children[i].classList.remove("completed");
    }
  });
});

clearButton.addEventListener("click", function () {
  const recordIndex = [];
  Array.prototype.forEach.call(todo_list.children, function (v, i) {
    if (v.classList.contains("completed")) {
      recordIndex.push(i);
    }
  });

  for (let i = recordIndex.length - 1; 0 <= i; i--) {
    todo_list.children[recordIndex[i]].remove();
  }
});

function destroy(element) {
  let destroybutton = document.querySelectorAll(".destroy");
  const clickButtonIndex = findIndex(destroybutton, element);
  const item = todo_list.children[clickButtonIndex];
  if (item) {
    item.remove();
  }

  if (todo_list.children.length === 0) {
    displayChange(mainClassNode, "none");
  }
}

function toggle(element) {
  let toggleButton = document.querySelectorAll(".toggle");

  if (toggleButton.length === 0) {
    return;
  }

  const toggleButtonIndex = findIndex(toggleButton, element);

  const toggleItem = toggleButton[toggleButtonIndex];
  if (toggleItem.checked) {
    todo_list.children[toggleButtonIndex].classList.add("completed");
  } else {
    todo_list.children[toggleButtonIndex].classList.remove("completed");
  }

  //log('toggleItem', toggleButtonIndex, toggleItem.checked);
}

function findIndex(node, element) {
  const index = Array.prototype.reduce.call(
    node,
    (acc, curr, index) => {
      if (element.target === curr) {
        return index;
      } else {
        return acc;
      }
    },
    -1
  );

  return index;
}

function displayChange(node, changeDisplay) {
  const DISPLAY = changeDisplay;

  if (node.style.display !== DISPLAY) {
    node.style.display = DISPLAY;
  }
}

// function createTag() {
//   let li = createNode('li');
//   let div = createNode('div').classList.add('view');
//   let input = createNode('input').classList.add('toggle');
//   input.type = 'checkbox';
//   let label = createNode('label');
//   let button = createNode('button').classList.add('destroy');

//   li.append(div);
//   div.append(input);
//   div.append(label);
//   div.append(button);

//   return li;
// }

// function createNode(node) {
//   return document.createElement(node);
// }
