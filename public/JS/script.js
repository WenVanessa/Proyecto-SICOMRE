const header = document.querySelector("header");
const footer = document.querySelector("footer");
const nav = document.querySelector("nav");

header.innerHTML = `
<div class="container header-container">
<img src="img/feyalegria2.png" alt="Fe y Alegría Logo" class="header-logo">
<div class="header-title">
    <h1>SICOMRE</h1>
    <h2><b>"Sistema de seguridad y control para las rutas escolares"</b></h2>
</div>
</div>

`;

nav.innerHTML=`
<div class="nav nav-pills nav-fill">

<div class="nav-lindo">
    <div class="one_nosotros">
        <a class="nav-link" href="/nosotros"> <img src="img/nosotrosimagen.png" class="imagen-del-nav" /> NOSOTROS   </a>
    </div>
    <div class="one_nosotros">
        <a class="nav-link" href="/contactanos"> <img src="img/contactanosimagen.png" class="imagen-del-nav" /> CONTACTANOS</a>
    </div>
    <div class="one_nosotros">    
        <a class="nav-link" href="/"> <img src="img/infoimagen.png" class="imagen-del-nav" /> INFO</a>
    </div>
    <div class="one_nosotros">    
        <a class="nav-link" href="/login"> <img src="img/loginimagen.png" class="imagen-del-nav" />  ACCEDER</a>
    </div>    
</div>

</div>`;


footer.innerHTML = `
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="copyright">
                    <b><h2>Derechos de autor</h2>
                    <p>Derechos de autor 2024 © SICOMRE. Todos los derechos reservados.</p></b>
                </div>
            </div>
        </div>
    </div>
`;
