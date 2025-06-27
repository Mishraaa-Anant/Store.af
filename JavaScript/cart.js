let cart = [];
let products = [];
let totalPrice = document.getElementById("total_price");
let cartCounter = document.getElementById("cart-counter");
let cartItemsCount = document.getElementById("cart_counts");
const cartTextElements = document.querySelectorAll(".cart_products");
const btnControl = document.querySelector(".btn_control");
const cartTotal = document.querySelector(".cart_total");

// WhatsApp number
const WHATSAPP_NUMBER = "918855965442"; // Removed spaces and formatting

loadCart();
getData();
checkCart();

async function getData() {
    let response = await fetch('json/products.json');
    let json = await response.json();
    products = json;
}

function loadCart() {
    let storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, inputQuantity = 1) {
    let product = products.find(p => p.id == productId);
    if (product) {
        let existingProduct = cart.find(p => p.id == productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            let productWithQuantity = { ...product, quantity: inputQuantity };
            cart.push(productWithQuantity);
        }
        saveCart();
        checkCart();
    }
}

function addCartToHTML() {
    let content = ``;
    cart.forEach((product, index) => {
        let price = parseFloat(product.price.replace('₹', '').replace(',', ''));
        let totalPrice = price * product.quantity;
        content += `
        <div class="cart_product">
            <div class="cart_product_img">  
                <img src=${product.images[0]}>
            </div>
            <div class="cart_product_info">  
                <div class="top_card">
                    <div class="left_card">
                        <h4 class="product_name">${product.name}</h4>
                        <span class="product_price">${product.price}</span>
                    </div>
                    <div class="remove_product" onclick="removeFromCart(${index})">
                        <ion-icon name="close-outline"></ion-icon>
                    </div>
                </div>
                <div class="buttom_card">
                    <div class="counts">
                        <button class="counts_btns minus" onclick="decreaseQuantity(${index})">-</button>
                        <input type="number" inputmode="numeric" name="productCount" min="1" step="1" max="999"
                            class="product_count" value=${product.quantity}>
                        <button class="counts_btns plus" onclick="increaseQuantity(${index})">+</button>
                    </div>
                    <span class="total_price">₹${totalPrice.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>`;
    });
    cartTextElements.forEach(element => {
        element.innerHTML = content;
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    checkCart();
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    saveCart();
    checkCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart();
        checkCart();
    } else {
        removeFromCart(index);
    }
}

function updateTotalPrice() {
    let total = cart.reduce((sum, product) => {
        let price = parseFloat(product.price.replace('₹', '').replace(',', ''));
        return sum + (price * product.quantity);
    }, 0);
    totalPrice.innerHTML = `₹${total.toLocaleString('en-IN')}`;
    localStorage.setItem("total price", total + 0); // Delivery charge in INR
    return total;
}

function checkCart() {
    if (cart.length == 0) {
        cartTextElements.forEach(element => {
            element.classList.add("empty");
            element.innerHTML = "Your cart is empty";
        })
        cartCounter.innerHTML = 0;
        btnControl.style.display = "none";
        cartTotal.style.display = "none";
        checkCartPage(0, 0);
    } else {
        cartTextElements.forEach(element => {
            element.classList.remove("empty");
        })
        addCartToHTML();
        let totalQuantity = cart.reduce((sum, product) => sum + product.quantity, 0);
        cartCounter.innerHTML = totalQuantity;
        btnControl.style.display = "flex";
        cartTotal.style.display = "flex";
        let total = updateTotalPrice();
        checkCartPage(total, totalQuantity);
    }
}

function checkCartPage(total, totalQuantity) {
    if (window.location.pathname.includes("cartPage.html")) {
        if (cart.length == 0) {
            cartItemsCount.innerHTML = `(0 items)`;
            document.getElementById("Subtotal").innerHTML = `₹0`;
            document.getElementById("total_order").innerHTML = `₹0`;
        } else {
            cartItemsCount.innerHTML = `(${totalQuantity} items)`;
            displayInCartPage(total);
        }
    }
}

function displayInCartPage(total) {
    let subTotal = document.getElementById("Subtotal");
    subTotal.innerHTML = `₹${total.toLocaleString('en-IN')}`;
    let totalOrder = parseFloat(subTotal.innerHTML.replace('₹', '').replace(',', '')) + 0; // Delivery charge ₹500
    document.getElementById("total_order").innerHTML = `₹${totalOrder.toLocaleString('en-IN')}`;
}

// Generate WhatsApp message with cart details
function generateWhatsAppMessage() {
    let message = "🛒 *New Order Details*\n\n";
    
    // Add cart items
    cart.forEach((product, index) => {
        let price = parseFloat(product.price.replace('₹', '').replace(',', ''));
        let itemTotal = price * product.quantity;
        message += `${index + 1}. *${product.name}*\n`;
        message += `   Price: ${product.price}\n`;
        message += `   Quantity: ${product.quantity}\n`;
        message += `   Total: ₹${itemTotal.toLocaleString('en-IN')}\n\n`;
    });
    
    // Add totals
    let subtotal = cart.reduce((sum, product) => {
        let price = parseFloat(product.price.replace('₹', '').replace(',', ''));
        return sum + (price * product.quantity);
    }, 0);
    
    let totalItems = cart.reduce((sum, product) => sum + product.quantity, 0);
    let finalTotal = subtotal + 0; // Adding delivery charge ₹500
    
    message += `📊 *Order Summary:*\n`;
    message += `Total Items: ${totalItems}\n`;
    message += `Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
    message += `Delivery Charge: ₹0\n`;
    message += `*Final Total: ₹${finalTotal.toLocaleString('en-IN')}*\n\n`;
    
    // Add customer info if available
    let email = localStorage.getItem('email');
    if (email) {
        message += `📧 Customer Email: ${email}\n`;
    }
    
    message += `⏰ Order Time: ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}\n`;
    message += `\nThank you for your order! 🙏`;
    
    return encodeURIComponent(message);
}

// Send message to WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    const message = generateWhatsAppMessage();
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
}

// Modified checkout function
function checkOut() {
    if (cart.length != 0) {
        // Send cart details to WhatsApp before proceeding to checkout
        sendToWhatsApp();
        
        // Optional: Add a small delay before redirecting
        setTimeout(() => {
            window.location.href = "checkout.html";
        }, 1000);
    } else {
        alert("Your cart is empty!");
    }
}
