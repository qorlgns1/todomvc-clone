const log = console.log;
log("시작");
// snake_case
let newTodoInput = document.querySelector(".new-todo");
const todoList = document.querySelector(".todo-list");
// camelCase
const mainEl = document.querySelector(".main");
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

newTodoInput.addEventListener("keydown", function (e) {
  //log(e.target.value);
  const ENTER = 13;

  // typeof obj1.method ==="function" && obj1.method();
  if (e.keyCode === ENTER && e.target.value) {
    const item = stringToNode(`
    <li>
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>${newTodoInput.value}</label>
        <button class="destroy btn-x"></button>
      </div>
    </li>
    `);

    todoList.append(item);

    displayChange(mainEl, "block");
    newTodoInput.value = "";

    //log(todoList);
  }
});

const memo = {};
const find = (eventName, el) => {
  return memo[eventName].filter(({ target }) => target === el)[0];
};
// eventEmitter pattern 이런거 검색해서 보면 좋음.
const delegate = (parent, candidate, eventName, callback) => {
  memo[eventName] = memo[eventName] || [];
  const eventBindingTarget = find(eventName, parent);

  if (!eventBindingTarget) {
    // 없는경우
    memo[eventName].push({
      target: parent,
      listeners: [
        {
          candidate: candidate, // 실제로 클릭될 요소
          callback: callback, // 실제로 클릭될 요소가 클릭되면 호출할 함수
        },
      ],
    });

    // 보통때의 메모리는 절약하면서
    // 런타임때의 메모리를 사용하는 방식
    parent.addEventListener(eventName, (e) => {
      // 클릭이 수행되면 parent에 걸려있는 이벤트 리스트를 가지고와서 실행한다.
      find(eventName, parent).listeners.forEach(({ candidate, callback }) => {
        candidate(e) && callback(e);
      });
    });
  } else {
    // 있는 경우(main에다가 이벤트를 이미 걸어준경우)// memo["click"]에 값이 존재하고 main에 click이 걸려 있는 경우
    eventBindingTarget.listeners.push({
      candidate: candidate, // 실제로 클릭될 요소
      callback: callback, // 실제로 클릭될 요소가 클릭되면 호출할 함수
    });
  }
};

const hasClass = (target, className) => {
  return Array.prototype.includes.call(target.classList, className);
};

delegate(
  mainEl,
  (e) => hasClass(e.target, "destroy"),
  "click",
  (e) => {
    destroy(e);
  }
);

delegate(
  mainEl,
  (e) => hasClass(e.target, "toggle"),
  "click",
  (e) => {
    toggle(e);
  }
);

// event delegate pattern // 검색
mainEl.addEventListener("click", function (e /* callback event or evt */) {
  //e.preventDefault();
  const target = e.target;

  if (target.parentNode === filters[0]) {
    const todoNode = todoList.children;
    Array.prototype.forEach.call(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");
      toggleNode.parentNode.style.display = "block";
    });
    filters[0].children[0].classList.remove("selected");
    filters[1].children[0].classList.remove("selected");
    filters[2].children[0].classList.remove("selected");
    target.classList.add("selected");
  } else if (target.parentNode === filters[1]) {
    const todoNode = todoList.children;
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
    const todoNode = todoList.children;
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

  const todoNode = todoList.children;
  const checkBool = getInnerValue();
  Array.prototype.forEach.call(todoNode, function (node, i) {
    const toggleNode = node.querySelector(".toggle");

    if (checkBool) {
      toggleNode.checked = true;
      todoList.children[i].classList.add("completed");
    } else {
      toggleNode.checked = false;
      todoList.children[i].classList.remove("completed");
    }
  });
});

clearButton.addEventListener("click", function () {
  const recordIndex = [];
  Array.prototype.forEach.call(todoList.children, function (v, i) {
    if (v.classList.contains("completed")) {
      recordIndex.push(i);
    }
  });

  for (let i = recordIndex.length - 1; 0 <= i; i--) {
    todoList.children[recordIndex[i]].remove();
  }
});

function destroy(element) {
  let destroybutton = document.querySelectorAll(".destroy");
  const clickButtonIndex = findIndex(destroybutton, element);
  const item = todoList.children[clickButtonIndex];
  if (item) {
    item.remove();
  }

  if (todoList.children.length === 0) {
    displayChange(mainEl, "none");
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
    todoList.children[toggleButtonIndex].classList.add("completed");
  } else {
    todoList.children[toggleButtonIndex].classList.remove("completed");
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

function stringToNode(str) {
  const wrap = document.createElement("div");

  wrap.innerHTML = str;

  return wrap.children[0];
}
