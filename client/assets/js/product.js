let buyBtn = document.querySelectorAll(".buy_button");

function rangeSlide(value,index,price) {
    document.querySelector(`#rangeValue${index}`).innerHTML = Math.round(value/10);
    document.querySelector(`#total_price${index}`).innerHTML =  "Total price: $" + price * Math.round(value/10);
}

document.addEventListener("DOMContentLoaded", () => {
    // console.log(window.localStorage.getItem('username'));
    document.querySelector('#user_name').textContent = window.localStorage.getItem('username');
    fetch('http://localhost:5000/shop')
    .then(res => res.json())
    .then(data => {
        var i = 0;
        for (var index of data.data) {
            var name = index.name;
            var img = index.img;
            var price = index.price;
            var amount = index.quantity;
            var htmlText = `<div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <div class="glasses_box">
                    <div class="buy_product">
                        <figure><img src="./assets/images/${img}" alt="#"/></figure>
                        <h3><span class="blu">$</span>${price}</h3>
                        <p>${name}</p>
                        <button type="button" class="buy_button">Add to cart</button>
                    </div>
                    <div class="accept_buy_product hidden">
                        <form class="form" id="buy">
                            <p>${name}</p>
                            <div class="amount__input-group">
                                <span>Amount:</span>
                                <input class="range" type="range" value="0" min="0" max="${amount * 10}" onChange="rangeSlide(this.value,${i},${price})" onmousemove="rangeSlide(this.value,${i},${price})"></input>
                                <span id="rangeValue${i}">0</span>
                            </div>
                            <div id="total_price${i}" class="total--price">Total price: $0</div>
                            <button class="send_button accept_buy_btn" type="submit">Send</button>
                            <button class="back_button accept_buy_btn" type="button">Back</button>
                        </form>
                    </div>
                </div>
            </div>`;
            var innerHTML = document.querySelector('#product_list').innerHTML;
            document.querySelector('#product_list').innerHTML = htmlText + innerHTML;
            i++;
        }
        document.querySelectorAll(".buy_button")
        .forEach(e=>{
            e.onclick = function() {
                e.parentElement.parentElement.querySelector('.buy_product').classList.add('hidden');
                e.parentElement.parentElement.querySelector('.accept_buy_product').classList.remove('hidden');   
            }
        });
        document.querySelectorAll(".back_button")
        .forEach(e=>{
            e.onclick = function() {
                e.parentElement.parentElement.parentElement.querySelector('.accept_buy_product').classList.add('hidden');
                e.parentElement.parentElement.parentElement.querySelector('.buy_product').classList.remove('hidden');   
            }
        });
        document.querySelectorAll(".send_button")
        .forEach(e=>{
            e.onclick = function() {
                fetch('http://localhost:5000/send', {
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        name: e.parentElement.querySelector('p').innerText,
                        amount: Math.round(e.parentElement.querySelector('.range').value/10),
                        price: e.parentElement.querySelector('.total--price').innerHTML.slice(14),
                        username: window.localStorage.getItem('username')
                    })
                })
            }
        });
    });
});


const sellBtn = document.querySelector('#sell_button');
if (sellBtn != null) {
    sellBtn.onclick = function() {
        const name = document.querySelector('#product_name').value;
        const price = document.querySelector('#product_price').value;
        const img = document.querySelector('#product_img').value;
        const quantity = document.querySelector('#product_quantity').value;
        

        if (name == '' || price == '' || img == '' || quantity == '') {
            document.querySelector("#sell_message").classList.add("sell_form--message");
            document.querySelector("#sell_message").textContent = 'Fields can not empty';
        }
        else {
            fetch('http://localhost:5000/sell', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    name : name,
                    price : price,
                    image: img,
                    sellerUsername: window.localStorage.getItem('username'),
                    quantity: quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                document.querySelector("#sell_message").classList.add("sell_form--message");
                document.querySelector("#sell_message").textContent = 'Your product is selling';
            })
        }
    }
}
document.querySelectorAll(".form__input").forEach(e=>{
    e.oninput = function(e) {
        var element1 = document.querySelector("#sell_message");
        element1.classList.remove("sell_form--message");
        element1.textContent = "";
    }
})

const cartBtn = document.querySelector('#open_cart');
cartBtn.onclick = function() {
    showBuyTickets();
    document.querySelector('#cart_details').innerHTML = '';
    setData('total_value',0);
    fetch('http://localhost:5000/cart', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            username: window.localStorage.getItem('username')
        })
    })
    .then(response => response.json())
    .then(data => {
        for (var index of data.data) {
            fetch('http://localhost:5000/get', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    id: index.productID,
                    amount: index.amount,
                    total: index.price,
                    cartID: index.cartID
                })
            })
            .then(res => res.json())
            .then(data1=>{
                var productName = data1.data[0]['name'];
                var cartAmount = data1.amount;
                var cartPrice = data1.total;
                var cartID = data1.cartID;
                document.querySelector('#cart_details').innerHTML +=
                `<div class="cart_detail--container">
                    <span class="cart_details--name">${productName}</span>
                    <span class="cart_details--amount">Amount: ${cartAmount}</span>
                    <span class="cart_details--price">Price: ${cartPrice}</span>
                    <span class="cart_details--id hidden">${cartID}</span>
                    <button type="button" class="delete_from_cart">Delete</button>
                </div>`;
                setData('total_value',parseInt(window.localStorage.getItem('total_value')) + parseInt(cartPrice));
                document.querySelector('#total_value').innerHTML = `Total: $${window.localStorage.getItem('total_value')}`;
            })
            
        }
    })
}

const modalSelector = document.querySelector('.js-modal');
const closeBtn = document.querySelector('.js-close-btn');
const modal = document.querySelector('.modal');
function showBuyTickets() {
    modal.classList.add('open');
}
function closeBuyTickets() {
    modal.classList.remove('open');
}
closeBtn.addEventListener('click',closeBuyTickets);
modal.addEventListener('click', closeBuyTickets);
modalSelector.addEventListener('click', function (event){
    event.stopPropagation();
})