//Fonction principale, appelée automatiquement au chargement de la page
(async() => {
    const productId = getProductId()
    const productData = await getProductData(productId)
    hydratePage(productData)
})()

function getProductId() {
    return new URL(window.location.href).searchParams.get('id')
}

function getProductData(productId) {
    return fetch(`${apiUrl}/api/teddies/${productId}`)
        .catch((error) => {
            console.log(error)
        })
        .then((httpBodyResponse) => httpBodyResponse.json())
        .then((productData) => productData)
}

function hydratePage(product) {
    // Hydrater la page avec des données
    document.getElementById('productImage').src = product.imageUrl
    document.getElementById('productName').textContent = product.name
    document.getElementById('productPrice').textContent = `${product.price / 100}.00 €`
    document.getElementById('productDescription').textContent = product.description
    document.getElementById(
        'productColors'
    ).style.gridTemplateColumns = `repeat(${product.colors.length}, 1fr)`

    // Ajouter event listeners sur les boutons
    document.getElementById('addToCart').onclick = (event) => {
        event.preventDefault()
        Cart.addProduct(product)
        redirectToShoppingCart(product.name)
    }

    // Obtenier un element parent
    const colorsElt = document.getElementById('productColors')

    // Montrer toutes les couleurs
    product.colors.forEach((color) => {
        // Obtenir et cloner le modèle pour une couleur
        const templateElt = document.getElementById('productColor')
        const cloneElt = document.importNode(templateElt.content, true)

        // Hydrater couleur du clone
        cloneElt.querySelector('div').style.backgroundColor = color

        // Montrer une nouvelle couleur
        colorsElt.appendChild(cloneElt)
    })
}

function redirectToShoppingCart(productName) {
    window.location.href = `${window.location.origin}/cart.html?lastAddedProductName=${productName}`
}