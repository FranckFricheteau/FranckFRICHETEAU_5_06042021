//Fonction principale, appelée automatiquement au chargement de la page

(async() => {
    const products = await getProducts()
    hydratePage(products)
})()

async function getProducts() {
    return fetch(`${apiUrl}/api/teddies`)
        .then((httpBodyResponse) => httpBodyResponse.json())
        .then((products) => products)
        .catch((e) => {
            alert("Connexion au serveur impossible, veuillez réessayer ultérieurement");
        })
}

function hydratePage(products) {
    document.getElementById('productsList').innerHTML = '' //On récupére les produits avec la fonction hydratePage, retire également les boites de chargement

    products.forEach((product) => { //Boucler sur tous les produits et les affiche
        displayProduct(product)
    })

}

function displayProduct(product) {
    // Obtenir un modèle
    const templateElt = document.getElementById('product')

    //cloner le modèle
    const cloneElt = document.importNode(templateElt.content, true)

    //modèle d'hydrate
    cloneElt.getElementById('productImage').src = product.imageUrl
    cloneElt.getElementById('productName').textContent = product.name
    cloneElt.getElementById('productPrice').textContent = `${product.price / 100}.00 €`
    cloneElt.getElementById('productDescription').textContent = product.description
    cloneElt.getElementById('productLink').href = `/products.html?id=${product._id}`

    //afficher le modèle
    document.getElementById('productsList').appendChild(cloneElt)

}