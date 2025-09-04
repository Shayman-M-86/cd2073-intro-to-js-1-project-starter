let currencySymbol = '$';

// Draws product list
function drawProducts() {
    let productList = document.querySelector('.products');
    let productItems = '';
    products.forEach((element) => {
        productItems += `
            <div data-productId='${element.productId}'>
                <img src='${element.image}'>
                <h3>${element.name}</h3>
                <p>price: ${currencySymbol}${element.price}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        `;
    });
    // use innerHTML so that products only drawn once
    productList.innerHTML = productItems;
}

// Draws cart
function drawCart() {
    let cartList = document.querySelector('.cart');
    // clear cart before drawing
    let cartItems = '';
    cart.forEach((element) => {
        let itemTotal = element.price * element.quantity;

        cartItems += `
            <div data-productId='${element.productId}'>
                <h3>${element.name}</h3>
                <p>price: ${currencySymbol}${element.price}</p>
                <p>quantity: ${element.quantity}</p>
                <p>total: ${currencySymbol}${itemTotal}</p>
                <button class="qup">+</button>
                <button class="qdown">-</button>
                <button class="remove">remove</button>
            </div>
        `;
    });
    // use innerHTML so that cart products only drawn once
    cart.length
        ? (cartList.innerHTML = cartItems)
        : (cartList.innerHTML = 'Cart Empty');
}

// Draws checkout
function drawCheckout() {
    let checkout = document.querySelector('.cart-total');
    checkout.innerHTML = '';

    // run cartTotal() from script.js
    let cartSum = cartTotal();

    let div = document.createElement('div');
    div.innerHTML = `<p>Cart Total: ${currencySymbol}${cartSum}</p> <p>Total Cash held: ${currencySymbol}${receivedTotal}</p>`;
    checkout.append(div);
}

// Initialize store with products, cart, and checkout
drawProducts();
drawCart();
drawCheckout();

document.querySelector('.products').addEventListener('click', (e) => {
    let productId = e.target.parentNode.getAttribute('data-productId');
    productId *= 1;
    addProductToCart(productId);
    drawCart();
    drawCheckout();
});

// Event delegation used to support dynamically added cart items
document.querySelector('.cart').addEventListener('click', (e) => {
    // Helper nested higher order function to use below
    // Must be nested to have access to the event target
    // Takes in a cart function as an agrument
    function runCartFunction(fn) {
        let productId = e.target.parentNode.getAttribute('data-productId');
        productId *= 1;
        for (let i = cart.length - 1; i > -1; i--) {
            if (cart[i].productId === productId) {
                let productId = cart[i].productId;
                fn(productId);
            }
        }
        // force cart and checkout redraw after cart function completes
        drawCart();
        drawCheckout();
    }

    // check the target's class and run function based on class
    if (e.target.classList.contains('remove')) {
        // run removeProductFromCart() from script.js
        runCartFunction(removeProductFromCart);
    } else if (e.target.classList.contains('qup')) {
        // run increaseQuantity() from script.js
        runCartFunction(increaseQuantity);
    } else if (e.target.classList.contains('qdown')) {
        // run decreaseQuantity() from script.js
        runCartFunction(decreaseQuantity);
    }
});

document.querySelector('.pay').addEventListener('click', (e) => {
    e.preventDefault();

    // Get input cash received field value, set to number
    let amount = document.querySelector('.received').value;
    amount *= 1;
    if (isNaN(amount)) {
        alert('Please enter a valid amount');
        document.querySelector('.received').value = '';
        return;
    }
    // Accumulate receivedTotal
    receivedTotal += amount;

    // Set cashReturn to return value of pay()
    let cashReturn = pay(receivedTotal); // Calculate cashReturn using accumulated receivedTotal

    let paymentSummary = document.querySelector('.pay-summary');
    let div = document.createElement('div');
    drawCheckout();
    // If total cash received is greater than cart total thank customer
    // Else request additional funds
    if (cashReturn >= 0) {
        // Build a list of purchased items
        let purchasedItems = cart.map(item => 
            `<li>${item.name} x${item.quantity} (${currencySymbol}${item.price} each)</li>`
        ).join('');
        div.innerHTML =
          `<p>Cash Received: ${currencySymbol}${amount}</p>` +
          (cashReturn > 0
            ? `<p>Cash Returned: ${currencySymbol}${cashReturn}</p>`
            : "") +
          (purchasedItems
            ? `<p>Thank you!</p>
            <p>Items Purchased:</p>` + `<ul>${purchasedItems}</ul></p>`
            : "") +
          `<hr/></p>`;
        receivedTotal = 0; // reset for next transaction
        emptyCart();
        drawCart();
        drawCheckout();
        document.querySelector(".received").value = "";
    } else if ((receivedTotal === amount)) {
      // added a check if it is the first time paying
      // reset cash field for next entry
      document.querySelector(".received").value = "";
      div.innerHTML = `
            <p>Cash Received: ${currencySymbol}${amount}</p>
            <p>Remaining Balance: ${cashReturn}$</p>
            <p>Please pay additional amount.</p>
            <hr/></p>
        `;
    } else {
      // added total payment
      document.querySelector(".received").value = "";
      div.innerHTML = `
            <p>Total Received: ${currencySymbol}${receivedTotal}</p> 
            <p>Cash Received: ${currencySymbol}${amount}</p>
            <p>Remaining Balance: ${cashReturn}$</p>
            <p>Please pay additional amount.</p>
            <hr/></p>
        `;
    }
    paymentSummary.append(div);
});

/* Standout suggestions */
/* Begin remove all items from cart */
function dropCart() {
  let shoppingCart = document.querySelector(".empty-btn");
  let div = document.createElement("button");
  div.classList.add("empty");
  div.innerHTML = `Empty Cart`;
  shoppingCart.append(div);
}
dropCart();

document.querySelector(".empty-btn").addEventListener("click", (e) => {
  if (e.target.classList.contains("empty")) {
    emptyCart();
    drawCart();
    drawCheckout();
  }
});
/* End all items from cart */

/* Begin currency converter */
function currencyBuilder() {
  let currencyPicker = document.querySelector(".currency-selector");
  let select = document.createElement("select");
  select.classList.add("currency-select");
  select.innerHTML = `<option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="YEN">YEN</option>`;
  currencyPicker.append(select);
}
currencyBuilder();

document.querySelector('.currency-select').addEventListener('change', function handleChange(event) {
    switch(event.target.value){
        case 'EUR':
            currencySymbol = '€';
            break;
        case 'YEN':
            currencySymbol = '¥';
            break;
        default:
            currencySymbol = '$';
            break;
     }

    currency(event.target.value);
    drawProducts();
    drawCart();
    drawCheckout();
});
/* End currency converter */
/* End standout suggestions */
