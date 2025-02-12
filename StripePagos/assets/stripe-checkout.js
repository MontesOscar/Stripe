import STRIPE_KEYS from "./stripe-keys.js";

const d = document,
    $productos = d.getElementById("productos"),
    $template = d.getElementById("productos-template").content,
    $fragment = d.createDocumentFragment(),
    fetchOptions={
        headers: {
            Authorization: `Bearer ${STRIPE_KEYS.secret}`, 
        },
    };
    let products, prices;
    const moneyFormat= num=> `$${num.slice(0,-2)}.${num.slice(-2)}`;
    Promise.all([
      fetch("https://api.stripe.com/v1/products",fetchOptions),
     fetch("https://api.stripe.com/v1/prices", fetchOptions)  
    ]).then(responses=>Promise.all(responses.map((res)=>res.json())))
    .then((json)=> {
        products= json[0].data;
        prices=json[1].data;
       // console.log(prices,produ); 
        prices.forEach((el) => {
            let productData = products.filter((product)=>product.id===el.product)
            console.log(productData)

             $template.querySelector(".producto").setAttribute("data-price", el.id);
             $template.querySelector("img").src=productData[0].images[0];
             $template.querySelector("figcaption").innerHTML=`
             ${productData[0].name}
             <br>
             ${moneyFormat(el.unit_amount_decimal)} ${el.currency}
             `;
              let $clone = d.importNode($template, true);
              $fragment.appendChild($clone);
        });
        $productos.appendChild($fragment);
    }).catch(err=>{
        console.log(err);
        let message = err.statusText || "Ocurrio un error al conectarse a la API de Stripe"
        $productos.innerHTML= `<p>Error  ${err.status}: ${message}</p>`;
    })

    d.addEventListener("click", (e)=>{
        if(e.target.matches(".producto *")){
        let price=e.target.parentElement.getAttribute("data-price");
        //console.log(price);
        Stripe(STRIPE_KEYS.public)
        .redirectToCheckout({
            lineItems:[{price, quantity:1}],
            mode: "payment",
            successUrl:"http://localhost:8000/assets/stripe-success.html",
            cancelUrl:"http://localhost:8000/assets/stripe-cancel.html"
        })
        .then(res=>{
            console.log(res);
            if(res.error){
                $productos.insertAdjacentHTML("afterend", res.error.message);
            }
        }); 
        }
    });

