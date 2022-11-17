function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function setError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}


//submit
const submitLogin = document.querySelector('#login_button');
const submitRegister = document.querySelector('#register_button');
submitLogin.onclick = function() {
    const username = document.querySelector('#login_username').value;
    const password = document.querySelector('#login_password').value;
    // console.log(username,password);
    fetch('http://localhost:5000/login', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            username : username,
            password : password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.data == null) {
            setError(document.querySelector("#login--error"), "Your username or password does not match!");
        }
        else {
            setData('username',username);
            window.location.href = 'sus.html';
        }
    })
}
submitRegister.onclick = function() {
    const username = document.querySelector('#signupUsername').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const cf_password = document.querySelector('#confirmPass').value;
    
    if (password != cf_password) {
        setError(document.querySelector("#register--error"), "Please make sure your password match!");
    } else {
        fetch('http://localhost:5000/register', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                username : username,
                email: email,
                password : password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.data == null) {
                setError(document.querySelector("#register--error"), "Username is already existed!!");
            }
            else {
                setData('username',username);
                window.location.href = 'sus.html';
            }
        })
    }
}
//clear error message
document.querySelectorAll(".form__input").forEach(e=>{
    e.oninput = function(e) {
        var element1 = document.querySelector("#register--error");
        var element2 = document.querySelector("#login--error");
        element1.classList.remove("form__input--error");
        element1.textContent = "";
        element2.classList.remove("form__input--error");
        element2.textContent = "";
    }
})


document.addEventListener("DOMContentLoaded", () => {
    //login function
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount"); 
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("form__hidden");
        createAccountForm.classList.remove("form__hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form__hidden");
        createAccountForm.classList.add("form__hidden");
    });

    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters in length");
            }
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
});
