const fs = require('fs');

const dropdownLogic = `

// --- CUSTOM DROPDOWN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const x = document.getElementsByClassName("custom-select");
    for (let i = 0; i < x.length; i++) {
        const selElmnt = x[i].getElementsByTagName("select")[0];
        if (!selElmnt) continue;
        
        // Crear el elemento div que actuará como el item seleccionado
        const a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        
        // Crear el elemento div que contendrá la lista de opciones
        const b = document.createElement("DIV");
        b.setAttribute("class", "select-items");
        for (let j = 0; j < selElmnt.length; j++) {
            const c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {
                // Cuando se hace clic en un elemento, actualizar la select box original y el item seleccionado
                const s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                const h = this.parentNode.previousSibling;
                for (let k = 0; k < s.length; k++) {
                    if (s.options[k].innerHTML == this.innerHTML) {
                        s.selectedIndex = k;
                        h.innerHTML = this.innerHTML;
                        // Trigger the change event for applying filters
                        const event = new Event('change');
                        s.dispatchEvent(event);
                        
                        const y = this.parentNode.getElementsByClassName("same-as-selected");
                        for (let l = 0; l < y.length; l++) {
                            y[l].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        
        // Añadir evento al item seleccionado para abrir/cerrar la lista
        a.addEventListener("click", function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-show");
            this.classList.toggle("select-arrow-active");
        });
    }

    function closeAllSelect(elmnt) {
        const x = document.getElementsByClassName("select-items");
        const y = document.getElementsByClassName("select-selected");
        const arrNo = [];
        for (let i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (let i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.remove("select-show");
            }
        }
    }

    document.addEventListener("click", closeAllSelect);
});
`;

fs.appendFileSync('script.js', dropdownLogic);
console.log('Dropdown logic appended to script.js');
