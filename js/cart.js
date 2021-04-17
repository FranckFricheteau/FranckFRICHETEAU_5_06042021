
(async() => {
    const productsInShoppingCart = Cart.products
    if (productsInShoppingCart === null) return
    hydratePage(productsInShoppingCart)
})()

function hydratePage(productsInShoppingCart) {
    //Placer le prix total
    document.getElementById('totalPrice').textContent = Cart.getTotalPrice() + '.00€'

    //boucler sur tous les produits et les afficher
    const productList = Object.values(productsInShoppingCart)
    productList.forEach((product) => {
        displayProduct(product)
    })
    addEventListeners()
}

function displayProduct(product) {
    //Obtenir et cloner le template
    const templateElt = document.getElementById('productTemplate')
    const cloneElt = document.importNode(templateElt.content, true)


    //hydrater le template
    cloneElt.getElementById('productName').textContent = product.name
    cloneElt.getElementById('productQuantity').selectedIndex = product.quantity - 1
    cloneElt.getElementById('productPrice').textContent = product.price / 100 + '00€'
    cloneElt.getElementById('productTotalPrice').textContent = (product.price * product.quantity) / 100 + '.00€'

    //Ajouter des évènements
    cloneElt.getElementById('productQuantity').onchange = (e) => {
        e.preventDefault()

        Cart.updateProductQuantity(product._id, e.target.selectedIndex + 1)

        //mise à jour produit prix total
        const totalPriceElt = e.target.parentElement.parentElement.parentElement.querySelector('#productTotalPrice')

        const newPrice = (product.price * Cart.getProductQuantity(product._id)) / 100 + '.00€'
        totalPriceElt.textContent = newPrice

        //Mettre a jour tous les produits avec le prix total
        document.getElementById('totalPrice').textContent = Cart.getTotalPrice() + '.00€'
    }

    //afficher template
    document.getElementById('productList').prepend(cloneElt)

}

function addEventListeners() {
    //Poursuivre sur le bouton
    document.getElementById('confirmPurchase').onclick = (e) => {
        e.preventDefault()
        sendOrder()
    }

    //Vérifiez que les données sont valides
    watchValidity(document.getElementById('firstName'), (e) => e.target.value.length > 1)
    watchValidity(document.getElementById('lastName'), (e) => e.target.value.length > 1)
    watchValidity(document.getElementById('email'), (e) => {
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        return emailRegex.test(e.target.value)
    })
    watchValidity(document.getElementById('address'), (e) => e.target.value.length > 6)
    watchValidity(document.getElementById('city'), (e) => e.target.value.length > 1)

}

function watchValidity(elt, condition) {
    elt.oninput = (e) => {
        if (condition(e)) {
            validInputElt(e.target)
        } else {
            neutralInputElt(e.target)
        }
    }

    elt.onblur = (e) => {
        if (!condition(e)) {
            invalidInputElt(e.target)
        }
    }
}

function validInputElt(elt) {
    elt.style.border = 'solid 1px green'
    elt.style.boxShadow = '#00800066 0px 0px 4px'

}

function invalidInputElt(elt) {
    elt.style.border = 'solid 1px red'
    elt.style.boxShadow = 'rgba(128, 0, 0, 0.4) 0px 0px 4px'
}

function neutralInputElt(elt) {
    elt.style.border = ''
    elt.style.boxShadow = ''
}

function sendOrder() {
    const firstName = document.getElementById('firstName').value
    const lastName = document.getElementById('lastName').value
    const email = document.getElementById('email').value
    const address = document.getElementById('address').value
    const city = document.getElementById('city').value
    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    if (!(
            firstName.length > 1 &&
            lastName.length > 1 &&
            emailRegex.test(email) &&
            address.length > 6 &&
            city.length > 1
        )) {
        console.log("Veuillez remplir les champs correctements avant de procéder au paiement")
        return
    }

    const products = Object.values(Cart.products).map((product) => {
        return product._id
    })

    const order = {
        contact: {
            firstName: firstName,
            lastName: lastName,
            address: address,
            city: city,
            email: email,
        },
        products: products,
    }

    const requestOptions = {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }

    fetch(`${apiUrl}/api/teddies/order`, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            console.log(json)
            localStorage.removeItem('shoppingCart')
            window.location.href = `${window.location.origin}/orderStatus.html?orderId=${json.orderId}`
        })
        .catch((err) => {
            alert(err, e)
        })

}