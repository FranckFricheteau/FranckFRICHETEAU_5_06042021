(async() => {
    const productsInShoppingCart = Cart.products
    if (productsInShoppingCart === null) return
    hydratePage(productsInShoppingCart)
})()

function hydratePage(productsInShoppingCart) {
    // Ensemble prix total
    document.getElementById('totalPrice').textContent = Cart.getTotalPrice() + '.00€'

    // Boucler sur tous les produits et les afficher
    const productList = Object.values(productsInShoppingCart)
    productList.forEach((product) => {
        displayProduct(product)
    })

    addEventListeners()
}

function displayProduct(product) {
    // Obtenir & cloner le template
    const templateElt = document.getElementById('productTemplate')
    const cloneElt = document.importNode(templateElt.content, true)

    // Hydrater le template (nom + quantité + prix produit + prix total)
    cloneElt.getElementById('productName').textContent = product.name
    cloneElt.getElementById('productQuantity').selectedIndex = product.quantity - 1
    cloneElt.getElementById('productPrice').textContent = product.price / 100 + '.00€'
    cloneElt.getElementById('productTotalPrice').textContent =
        (product.price * product.quantity) / 100 + '.00€'

    // Ajouter les évènements
    cloneElt.getElementById('productQuantity').onchange = (e) => {
        e.preventDefault()

        Cart.updateProductQuantity(product._id, e.target.selectedIndex + 1)

        // Mettre à jour le prix total produit
        const totalPriceElt = e.target.parentElement.parentElement.parentElement.querySelector(
            '#productTotalPrice'
        )
        const newPrice = (product.price * Cart.getProductQuantity(product._id)) / 100 + '.00€'
        totalPriceElt.textContent = newPrice

        // Mettre à jour le prix total de tous les produits
        document.getElementById('totalPrice').textContent = Cart.getTotalPrice() + '.00€'
    }

    // Montrer le template
    document.getElementById('productsList').prepend(cloneElt)
}

function addEventListeners() {
    // Poursuivre sur le button
    document.getElementById('confirmPurchase').onclick = (e) => {
        e.preventDefault()
        sendOrder()
    }

    // Input de validation des champs (Prénom + Nom + mail + adresse + code postal + ville)
    watchValidity(document.getElementById('firstName'), (e) => e.target.value.length > 1)
    watchValidity(document.getElementById('lastName'), (e) => e.target.value.length > 1)
    watchValidity(document.getElementById('email'), (e) => {
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        return emailRegex.test(e.target.value)
    })
    watchValidity(document.getElementById('address'), (e) => e.target.value.length > 6)
    watchValidity(document.getElementById('zipcode'), (e) => {
        const zipcodeRegex = /[0-9]{5}(-[0-9]{4})?/
        return zipcodeRegex.test(e.target.value)
    })

    watchValidity(document.getElementById('city'), (e) => e.target.value.length > 1)
}

function watchValidity(elt, condition) { //valider ou non le champ de l'input en fonction de l'action de l'utilisateur. Champ validé si les caractères attendus de l'input sont correct sinon retourne une erreur si champ incorrect ou vide
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

function validInputElt(elt) { // si le champ de l'input est valide, affiche une couleur verte
    elt.style.border = 'solid 1px green'
    elt.style.boxShadow = '#00800066 0px 0px 4px'
}

function invalidInputElt(elt) { // si le champ de l'input n'est pas valide, affiche une couleur rouge
    elt.style.border = 'solid 1px red'
    elt.style.boxShadow = 'rgba(128, 0, 0, 0.4) 0px 0px 4px'
}

function neutralInputElt(elt) { // si le champ est vide, affiche aucune couleur
    elt.style.border = ''
    elt.style.boxShadow = ''
}

function sendOrder() {
    const firstName = document.getElementById('firstName').value
    const lastName = document.getElementById('lastName').value
    const address = document.getElementById('address').value
    const zipcode = document.getElementById('zipcode').value
    const email = document.getElementById('email').value
    const city = document.getElementById('city').value

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    const zipcodeRegex = /[0-9]{5}(-[0-9]{4})?/

    if (!(
            firstName.length > 1 &&
            lastName.length > 1 &&
            emailRegex.test(email) &&
            address.length > 6 &&
            zipcodeRegex.test(zipcode) &&
            city.length > 1
        )) {
        alert("Veuillez remplir les champs correctement avant de procéder au paiement ! ")
        return
    }

    const products = Object.values(Cart.products).map((product) => {
        return product._id
    })

    const order = {
        contact: {
            firstName: firstName,
            lastName: lastName,
            address: address + ' ' + zipcode,
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
        .catch((e) => {
            alert("Votre commande n'a pas été prise en compte, veuillez renouveler votre opération s'il vous plaît")
        })
}