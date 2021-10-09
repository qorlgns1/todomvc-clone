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
const itemsLeft = getItemsLeft();

loadLocalStorageData();

function getItemsLeft() {
  let count = 0;

  function getCount(count) {
    if (count <= 0) {
      count = 0;
    }
    return count + " items left";
  }

  return {
    increase: function () {
      if (count < 0) {
        count = 0;
      }
      count++;
      return getCount(count);
    },
    decrease: function () {
      count--;
      return getCount(count);
    },
    reset: function () {
      count = 0;
      return getCount(count);
    },
    setCount: function (newCount) {
      count = newCount;
      return getCount(count);
    },
    show: function () {
      return getCount(count);
    },
  };
}

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
    createLocalStorageData();
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

function forEachCall(node, callback) {
  Array.prototype.forEach.call(node, callback);
}

// event delegate pattern // 검색
mainEl.addEventListener("click", function (e /* callback event or evt */) {
  //e.preventDefault();
  const target = e.target;
  const todoNode = todoList.children;
  if (target.parentNode === filters[0]) {
    forEachCall(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");
      displayChange(toggleNode.parentNode, "block");
    });
  } else if (target.parentNode === filters[1]) {
    forEachCall(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");
      const toggleParentNode = toggleNode.parentNode;

      if (toggleNode.checked) {
        displayChange(toggleParentNode, "none");
      } else {
        displayChange(toggleParentNode, "block");
      }
    });
  } else if (target.parentNode === filters[2]) {
    forEachCall(todoNode, function (node) {
      const toggleNode = node.querySelector(".toggle");
      const toggleParentNode = toggleNode.parentNode;

      if (toggleNode.checked) {
        displayChange(toggleParentNode, "block");
      } else {
        displayChange(toggleParentNode, "none");
      }
    });
  }

  removeClass("selected");
  target.classList.add("selected");
});

toggleAllButton.addEventListener("click", () => {
  //e.preventDefault();

  const todoNode = todoList.children;
  const checkBool = toggleAllButton.checked;

  //count 클로저 값 변경
  const count = getTotalLocalStorageCount();
  if (checkBool) {
    itemsLeft.setCount(count);
  } else {
    itemsLeft.setCount(0);
  }

  Array.prototype.forEach.call(todoNode, function (node, i) {
    const toggleNode = node.querySelector(".toggle");

    if (checkBool) {
      toggleNode.checked = checkBool;
      todoList.children[i].classList.add("completed");
      changeLocalStorageDataState(i, checkBool);
    } else {
      toggleNode.checked = checkBool;
      todoList.children[i].classList.remove("completed");
      changeLocalStorageDataState(i, checkBool);
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
    removeLocalStorageData(i);
  }

  closeMainEl();
});

function removeClass(className) {
  for (let i = 0; i < 3; i++) {
    filters[i].children[0].classList.remove(className);
  }
}

function destroy(event) {
  let destroybutton = document.querySelectorAll(".destroy");
  const clickButtonIndex = findIndex(destroybutton, event);
  const item = todoList.children[clickButtonIndex];
  if (item) {
    item.remove();
    removeLocalStorageData(clickButtonIndex);
  }

  closeMainEl();
}

function closeMainEl() {
  if (todoList.childElementCount === 0) {
    itemsLeft.reset();
    displayChange(mainEl, "none");
    toggleAllButton.checked = false;
  }
}

function toggle(event) {
  let toggleButton = document.querySelectorAll(".toggle");

  if (toggleButton.length === 0) {
    return;
  }

  const toggleButtonIndex = findIndex(toggleButton, event);

  const toggleItem = toggleButton[toggleButtonIndex];
  if (toggleItem.checked) {
    todoList.children[toggleButtonIndex].classList.add("completed");
    changeLocalStorageDataState(toggleButtonIndex, toggleItem.checked);
  } else {
    todoList.children[toggleButtonIndex].classList.remove("completed");
    changeLocalStorageDataState(toggleButtonIndex, toggleItem.checked);
  }
}

function findIndex(node, event) {
  const index = Array.prototype.reduce.call(
    node,
    (acc, curr, index) => {
      if (event.target === curr) {
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

function loadLocalStorageData() {
  let data = localStorage.getItem("todos-vanilla-es6");
  let parseData = JSON.parse(data) || [];
  parseData.forEach((v) => {
    //log(v, i);
    const item = stringToNode(`
    <li class='${v.completed ? "completed" : ""}'>
      <div class="view">
        <input class="toggle" type="checkbox">
        <label>${v.title}</label>
        <button class="destroy btn-x"></button>
      </div>
    </li>
    `);

    todoList.append(item);

    if (!v.completed) {
      itemsLeft.increase();
    }
  });

  showItemsLeft();

  if (todoList.childElementCount) {
    displayChange(mainEl, "block");
  }
}

function createLocalStorageData() {
  let data = JSON.parse(localStorage.getItem("todos-vanilla-es6")) || [];
  data.push({
    id: "-",
    title: newTodoInput.value,
    completed: false,
  });

  localStorage.setItem("todos-vanilla-es6", JSON.stringify(data));

  itemsLeft.increase();
  showItemsLeft();
}

function removeLocalStorageData(index) {
  let data = localStorage.getItem("todos-vanilla-es6");
  let parseData = JSON.parse(data);
  parseData.splice(index, 1);
  localStorage.setItem("todos-vanilla-es6", JSON.stringify(parseData));
}

function changeLocalStorageDataState(index, state) {
  let data = localStorage.getItem("todos-vanilla-es6");
  let parseData = JSON.parse(data);
  parseData[index].completed = state;

  if (state) {
    itemsLeft.decrease();
    showItemsLeft();
  } else {
    itemsLeft.increase();
    showItemsLeft();
  }

  closeMainEl();

  //localStorage.removeItem('todos-vanilla-es6');
  localStorage.setItem("todos-vanilla-es6", JSON.stringify(parseData));
}

function showItemsLeft() {
  let count = document.querySelector(".todo-count");
  count.innerHTML = itemsLeft.show();
}

function getTotalLocalStorageCount() {
  let data = localStorage.getItem("todos-vanilla-es6");
  let parseData = JSON.parse(data);

  return parseData.length;
}
