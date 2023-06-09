let cat;
const box = document.querySelector(".container");
const upd = document.querySelector(".md-container");
const addBtn = document.querySelector(".addBtn");
const mdBox = document.querySelector(".modal-container");
const mdClose = mdBox.querySelector(".modal-close");
const penClose = document.querySelector(".md-close")

// Общая функция добавления котов
// ----------------------------------------------
function createCart(cat, el = box) {
    const card = document.createElement("div");
    card.className = "card";
    if (!cat.image) {
        card.classList.add("default");
    } else {
        card.style.backgroundImage = `url(${cat.image})`;
    }
    const name = document.createElement("h3");
    name.innerText = cat.name;

    const like = document.createElement("i");
    like.className = "fa-heart card__like";

    // Лайк или дизлайк
    like.classList.add(cat.favorite ? "fa-solid" : "fa-regular");

    // клик на сердечко
    like.addEventListener("click", e => {
        e.stopPropagation();
        if (cat.id) {
            fetch(`${path}/update/${cat.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ favorite: !cat.favorite })
            })
                .then(res => {
                    if (res.status === 200) {
                        like.classList.toggle("fa-solid");
                        like.classList.toggle("fa-regular");
                        cats = cats.map(element => {
                            if (element.id === cat.id) {
                                element.favorite = !cat.favorite
                            }
                            return element
                        })
                        localStorage.setItem("cats-data", JSON.stringify(cats));
                    }

                })
        }
    })
    // изменения
    const pen = document.createElement("i");
    pen.className = "fa-solid fa-pen card__pen"
   
    pen.addEventListener("click", e => {
        e.stopPropagation();
        upd.style.display = "flex";
        const idInput = upd.querySelector("input[name=id]");
        if (idInput) {
            idInput.value=cat.id;
        }
        const nameInput = upd.querySelector("input[name=name]");
        if (nameInput) {
            nameInput.value=cat.name;
        }
        const imageInput = upd.querySelector("input[name=image]");
        if (imageInput) {
            imageInput.value=cat.image;
        }
        const favoriteInput = upd.querySelector("input[name=favorite]");
        if (favoriteInput) {
            favoriteInput.value=cat.favorite;
        }
        const descriptionInput = upd.querySelector("input[name=description]");
        if (descriptionInput) {
            descriptionInput.value=cat.description;
        }
    });

    
    penClose.addEventListener("click", e => {
        upd.style = null;
    })
    


    // корзина
    const trash = document.createElement("i");
    trash.className = "fa-solid fa-trash card__trash";
    trash.addEventListener("click", e => {
        e.stopPropagation();
        deleteCard(cat.id, card);
    })

    // Добавление в карточку
    card.append(like, pen, name, trash);

    if (cat.age >= 0) {
        const age = document.createElement("span");
        age.innerText = cat.age;
        card.append(age);
    }

    card.addEventListener("click", e => {
        location.assign(`index2.html?id=${cat.id}`)
    })
    el.append(card)
}
// ----------------------------------------------
// вызов функции
// createCart(cat, el = box)


// localStorage
let user = localStorage.getItem("cat12") //получить имя пользователя
const path = `https://cats.petiteweb.dev/api/single/${user}`;

if (!user) {
    user = prompt("Ваше уникальное имя: ", "beginner-frontender")
    localStorage.setItem("cat12", user) // добавить имя пользователя
    localStorage.removeItem("cats-data") //очистить котов при новом пользователе
}
let cats = localStorage.getItem("cats-data") // массив с котами
if (cats) {
    cats = JSON.parse(cats) // взять из строки объект
    for (let cat of cats) {
        createCart(cat, box); // передаем котов
    }
} else { // Добовление котиков из базы, если котов нет 
    fetch(path + "/show")
        .then(function (res) {
            if (res.statusText === "OK") {
                return res.json();
            }
        })
        .then(function (data) {
            if (!data.length) {
                box.innerHTML = "<div class=\"empty\">У вас пока еще нет питомцев</div>"
            } else {
                cats = [...data];
                localStorage.setItem("cats-data", JSON.stringify(data)) // сохраняем котов в localStorage
                for (let c of data) {
                    createCart(c, box);
                }
            }
        })
}
// функция добавления котика в базу данных
function addCat(cat) {
    fetch(path + "/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cat)
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
}
// addCat(cat);

// функция удаления карточки с котом 
function deleteCard(id, el) {
    if (id) {
        fetch(`${path}/delete/${id}`, {
            method: "delete"
        })
            .then(res => {
                if (res.status === 200) {
                    cats = cats.filter(cat => cat.id !== id);
                    localStorage.setItem("cats-data", JSON.stringify(cats));
                    el.remove();
                }
            })
    }
}

// Открытие и закрытие модального окна c добавлением кота
addBtn.addEventListener("click", e => {
    mdBox.style.display = "flex";
});
mdClose.addEventListener("click", e => {
    mdBox.style = null;
});
// ----------------------------------------------

// Отправка формы обратной связи 
const addForm = document.forms.add;
addForm.addEventListener("submit", e => {
    e.preventDefault(); // остановить действие по умолчанию
    const body = {};
    for (let i = 0; i < addForm.elements.length; i++) {
        const inp = addForm.elements[i];
        if (inp.name) { // элемент формы имеет атрибут name (не является кнопкой)
            if (inp.type === "checkbox") {
                body[inp.name] = inp.checked;
            } else {
                body[inp.name] = inp.value;
            }
        }
    }
    // отправка формы в базу данных
    fetch(path + "/add", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (res.ok) {
                addForm.reset();  // очистить форму
                mdBox.style = null; //закрыть форму
                createCart(body); //отправка в тело бади без перезагрузки страницы
                let cats = localStorage.getItem("cats-data");
                cats = JSON.parse(cats);
                cats.push(body);
                localStorage.setItem("cats-data", JSON.stringify(cats));

            } else {
                return res.json();
            }
        })
        .then(err => {
            if (err && err.message) {
                alert(err.message); //вывести сообщение об ошибке
            }
        });
})
// -------------------------------------------------------

// // Отправка формы обратной связи c изменениями
const updForm = document.forms.upd;
updForm.addEventListener("submit", e => {
    e.preventDefault(); // остановить действие по умолчанию
    const body = {};
    for (let i = 0; i < updForm.elements.length; i++) {
        const inp = updForm.elements[i];
        if (inp.name) { // элемент формы имеет атрибут name (не является кнопкой)
            if (inp.type === "checkbox") {
                body[inp.name] = inp.checked;
            } else {
                body[inp.name] = inp.value;
            }
        }
    }
    body.id = +body.id;
    console.log("upd", body);

    fetch(`${path}/update/${body.id}`, {
        method: "put",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.message.includes("успешно")) {
                cats = cats.map(cat => {
                    if (cat.id === body.id) {
                        return body;
                    }
                    return cat;
                })
                console.log(cats);
                box.innerHTML = "";
                cats.forEach(cat => {
                    createCart(cat, box);
                })
                updForm.reset()
                upd.style = null;
                localStorage.setItem("cats-data", JSON.stringify(cats));
            } else {
                return res.json();
            }
        })
       
})
